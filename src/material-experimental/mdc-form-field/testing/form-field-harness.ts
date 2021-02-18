/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {
  FormFieldHarnessFilters,
  _MatFormFieldHarnessBase,
} from '@angular/material/form-field/testing';
import {MatInputHarness} from '@angular/material-experimental/mdc-input/testing';
import {MatSelectHarness} from '@angular/material-experimental/mdc-select/testing';

// TODO(devversion): support datepicker harness once developed (COMP-203).
// Also support chip list harness.
/** Possible harnesses of controls which can be bound to a form-field. */
export type FormFieldControlHarness = MatInputHarness|MatSelectHarness;

/** Harness for interacting with a MDC-based form-field's in tests. */
export class MatFormFieldHarness extends _MatFormFieldHarnessBase<FormFieldControlHarness> {
  static hostSelector = '.mat-mdc-form-field';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatFormFieldHarness` that meets
   * certain criteria.
   * @param options Options for filtering which form field instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: FormFieldHarnessFilters = {}): HarnessPredicate<MatFormFieldHarness> {
    return new HarnessPredicate(MatFormFieldHarness, options)
        .addOption('floatingLabelText', options.floatingLabelText,
            async (harness, text) => HarnessPredicate.stringMatches(await harness.getLabel(), text))
        .addOption('hasErrors', options.hasErrors,
            async (harness, hasErrors) => await harness.hasErrors() === hasErrors);
  }

  protected _prefixContainer = this.locatorForOptional('.mat-mdc-form-field-prefix');
  protected _suffixContainer = this.locatorForOptional('.mat-mdc-form-field-suffix');
  protected _label = this.locatorForOptional('.mdc-floating-label');
  protected _errors = this.locatorForAll('.mat-mdc-form-field-error');
  protected _hints = this.locatorForAll('.mat-mdc-form-field-hint');
  protected _inputControl = this.locatorForOptional(MatInputHarness);
  protected _selectControl = this.locatorForOptional(MatSelectHarness);
  private _mdcTextField = this.locatorFor('.mat-mdc-text-field-wrapper');

  /** Gets the appearance of the form-field. */
  async getAppearance(): Promise<'fill'|'outline'> {
    const textFieldEl = await this._mdcTextField();
    if (await textFieldEl.hasClass('mdc-text-field--outlined')) {
      return 'outline';
    }
    return 'fill';
  }

  /** Whether the form-field has a label. */
  async hasLabel(): Promise<boolean> {
    return (await this._label()) !== null;
  }

  /** Whether the label is currently floating. */
  async isLabelFloating(): Promise<boolean> {
    const labelEl = await this._label();
    return labelEl !== null ? await labelEl.hasClass('mdc-floating-label--float-above') : false;
  }
}
