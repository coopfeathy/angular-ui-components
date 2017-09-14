import {main as ngc} from '@angular/tsc-wrapped';
import {readFileSync, writeFileSync} from 'fs';
import {sync as glob} from 'glob';
import {join} from 'path';
import {buildConfig} from './build-config';
import {getSecondaryEntryPointsForPackage} from './secondary-entry-points';
import {PackageBundler} from './build-bundles';


const {packagesDir, outputDir} = buildConfig;

/** Name of the tsconfig file that is responsible for building a package. */
const buildTsconfigName = 'tsconfig-build.json';

/** Name of the tsconfig file that is responsible for building the tests. */
const testsTsconfigName = 'tsconfig-tests.json';

/** Incrementing ID counter. */
let nextId = 0;

export class BuildPackage {
  /** Path to the package sources. */
  sourceDir: string;

  /** Path to the package output. */
  outputDir: string;

  /** Whether this package will re-export its secondary-entry points at the root module. */
  exportsSecondaryEntryPointsAtRoot = false;

  /** Path to the entry file of the package in the output directory. */
  readonly entryFilePath: string;

  /** Path to the tsconfig file, which will be used to build the package. */
  private readonly tsconfigBuild: string;

  /** Path to the tsconfig file, which will be used to build the tests. */
  private readonly tsconfigTests: string;

  private readonly bundler = new PackageBundler(this);

  /** Secondary entry points for the package. */
  get secondaryEntryPoints(): string[] {
    if (!this._secondaryEntryPoints) {
      this._secondaryEntryPoints = getSecondaryEntryPointsForPackage(this);
    }

    return this._secondaryEntryPoints;
  }

  private _secondaryEntryPoints: string[];

  constructor(public readonly name: string, public readonly dependencies: BuildPackage[] = []) {
    this.sourceDir = join(packagesDir, name);
    this.outputDir = join(outputDir, 'packages', name);

    this.tsconfigBuild = join(this.sourceDir, buildTsconfigName);
    this.tsconfigTests = join(this.sourceDir, testsTsconfigName);

    this.entryFilePath = join(this.outputDir, 'index.js');
  }

  /** Compiles the package sources with all secondary entry points. */
  async compile() {
    // Walk through every secondary entry point and build the TypeScript sources sequentially.
    for (const entryPoint of this.secondaryEntryPoints) {
      await this._compileEntryPoint(buildTsconfigName, entryPoint);
    }

    // Compile the primary entry-point.
    await this._compileEntryPoint(buildTsconfigName);
  }

  /** Compiles the TypeScript test source files for the package. */
  async compileTests() {
    await this._compileEntryPoint(testsTsconfigName);
  }

  /** Creates all bundles for the package and all associated entry points. */
  async createBundles() {
    await this.bundler.createBundles();
  }

  /** Compiles the TypeScript sources of a primary or secondary entry point. */
  private async _compileEntryPoint(tsconfigName: string, secondaryEntryPoint = '') {
    const entryPointPath = join(this.sourceDir, secondaryEntryPoint);
    const entryPointTsconfigPath = join(entryPointPath, tsconfigName);

    await ngc(entryPointTsconfigPath, {basePath: entryPointPath});
    this.renamePrivateReExportsToBeUnique(secondaryEntryPoint);
  }

  /** Renames `ɵa`-style re-exports generated by Angular to be unique across compilation units. */
  private renamePrivateReExportsToBeUnique(secondaryEntryPoint = '') {
    // When we compiled the typescript sources with ngc, we do entry-point individually.
    // If the root-level module re-exports multiple of these entry-points, the private-export
    // identifiers (e.g., `ɵa`) generated by ngc will collide. We work around this by suffixing
    // each of these identifiers with an ID specific to this entry point. We make this
    // replacement in the js, d.ts, and metadata output.
    if (this.exportsSecondaryEntryPointsAtRoot && secondaryEntryPoint) {
      const entryPointId = nextId++;
      const outputPath = join(this.outputDir, secondaryEntryPoint);
      glob(join(outputPath, '**/*.+(js|d.ts|metadata.json)')).forEach(filePath => {
        let fileContent = readFileSync(filePath, 'utf-8');
        fileContent = fileContent.replace(/(ɵ[a-z]+)/g, `$1${entryPointId}`);
        writeFileSync(filePath, fileContent, 'utf-8');
      });
    }
  }
}
