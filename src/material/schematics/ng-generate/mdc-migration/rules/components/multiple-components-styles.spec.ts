import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from './test-setup-helper';

describe('multiple component styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(
    components: string[],
    oldFileContent: string,
    newFileContent: string,
  ) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(components, runner, cliAppTree);
    expect(tree.readContent(THEME_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  describe('mixin migrations', () => {
    it('should replace the old themes with the new ones', async () => {
      await runMigrationTest(
        ['checkbox', 'radio'],
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.checkbox-theme($theme);
        @include mat.radio-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.mdc-checkbox-theme($theme);
        @include mat.mdc-checkbox-typography($theme);
        @include mat.mdc-radio-theme($theme);
        @include mat.mdc-radio-typography($theme);
      `,
      );
    });

    it('should add correct theme if all-component-themes mixin included', async () => {
      await runMigrationTest(
        ['checkbox', 'radio'],
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.all-component-themes($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.all-mdc-component-themes($theme);
      `,
      );
    });

    it('should add correct theme with multi-line theme if all-component-themes mixin included', async () => {
      await runMigrationTest(
        ['checkbox', 'radio'],
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.all-component-themes((
          color: $config,
          typography: null,
          density: null,
        ));
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.all-mdc-component-themes((
          color: $config,
          typography: null,
          density: null,
        ));
      `,
      );
    });

    it('should add multiple themes for multiple all-component-themes mixins', async () => {
      await runMigrationTest(
        ['checkbox', 'radio'],
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.all-component-themes($light-theme);
        @include mat.all-component-themes($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.all-mdc-component-themes($light-theme);
        @include mat.all-mdc-component-themes($dark-theme);
      `,
      );
    });
  });
});
