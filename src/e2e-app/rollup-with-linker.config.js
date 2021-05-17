const node = require('rollup-plugin-node-resolve');
const {ConsoleLogger, LogLevel} = require("@angular/compiler-cli/src/ngtsc/logging");
const {NodeJSFileSystem} = require("@angular/compiler-cli/src/ngtsc/file_system");
const {createEs2015LinkerPlugin} = require('@angular/compiler-cli/linker/babel');
const {babel} = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const {sync: globSync} = require('glob');
const {join} = require('path');

/** File system used by the Angular linker plugin. */
const fileSystem = new NodeJSFileSystem();
/** Logger used by the Angular linker plugin. */
const logger = new ConsoleLogger(LogLevel.info);
/** Babel plugin that runs the Angular linker. */
const linkerPlugin = createEs2015LinkerPlugin({fileSystem, logger});

/**
 * Custom rollup plugin that enables bundling of the component examples which are
 * usually loaded lazily. We cannot use lazy loading here as we want to process
 * all sources with the linker, and rollup isn't able to process dynamic imports
 * which are not statically analyzable. We work around this by transforming the
 * dynamic non-static imports to statically analyzable dynamic imports that can be
 * processed by rollup. e.g. "import(`@angular/components-examples/${module}/index.js`")
 * will be transformed into an object that merges exports from all possible `${module}` values.
 */
const lazyExamplesPlugin = {
  transform: (code, id) => {
    if (!id.includes('load-example.mjs')) {
      return;
    }

    // In Bazel actions, the exec root is the current working directory.
    const execRoot = process.cwd();
    const examplesPackageDir = join(execRoot, 'node_modules/@angular/components-examples');
    const moduleImports = globSync('*/**/index?(.ngfactory).mjs', {cwd: examplesPackageDir})
      .map(m => `...yield import("@angular/components-examples/${m}")`);

    // Replaces the call to `loadModuleWithFactory` with a statically analyzable object literal that can
    // be processed by rollup. We merge all exports of the examples to a single object literal to avoid
    // dynamic non-analyzable imports that rollup cannot handle.
    return code.replace(/yield loadModuleWithFactory\([^)]+\);/, `
      {
        moduleExports: {${moduleImports.join(',')}},
        moduleFactoryExports: {${moduleImports.join(',')}},
      }
    `);
  },
}

module.exports = {
  output: {
    // Inline all dynamic imports in order to avoid generating multiple chunks. Multiple chunks
    // would require enabling `output_dir` which would inherently complicate the devserver setup.
    inlineDynamicImports: true,
  },
  plugins: [
    commonjs(),
    node({
      // The e2e-app runs with Ivy. We need to ensure the NGCC processed entry points are
      // loaded for the Angular dependencies.
      mainFields: ['es2015_ivy_ngcc', 'module_ivy_ngcc','es2015', 'module'],
    }),
    lazyExamplesPlugin,
    babel({
      plugins: [linkerPlugin],
      // There should be no babel helpers required as we process JavaScript code that has
      // been generated by TypeScript and uses tslib. We still set this option explicitly
      // to avoid a warning by Babel. Also in  case there are unprocessed helpers, this
      // ensures that the bundle works in the browser as expected.
      babelHelpers: 'bundled',
      // Due to the large size of referenced files and the potential slow-down, we avoid compression
      // by the Babel plugin.
      compact: false
    }),
  ],
};
