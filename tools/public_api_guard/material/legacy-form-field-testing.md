## API Report File for "components-srcs"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AsyncFactoryFn } from '@angular/cdk/testing';
import { ComponentHarnessConstructor } from '@angular/cdk/testing';
import { HarnessPredicate } from '@angular/cdk/testing';
import { ErrorHarnessFilters as LegacyErrorHarnessFilters } from '@angular/material/form-field/testing';
import { FormFieldHarnessFilters as LegacyFormFieldHarnessFilters } from '@angular/material/form-field/testing';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { MatDateRangeInputHarness } from '@angular/material/datepicker/testing';
import { _MatErrorHarnessBase } from '@angular/material/form-field/testing';
import { _MatFormFieldHarnessBase } from '@angular/material/form-field/testing';
import { MatFormFieldControlHarness as MatLegacyFormFieldControlHarness } from '@angular/material/form-field/testing/control';
import { MatLegacyInputHarness } from '@angular/material/legacy-input/testing';
import { MatLegacySelectHarness } from '@angular/material/legacy-select/testing';
import { TestElement } from '@angular/cdk/testing';

export { LegacyErrorHarnessFilters }

// @public @deprecated
export type LegacyFormFieldControlHarness = MatLegacyInputHarness | MatLegacySelectHarness | MatDatepickerInputHarness | MatDateRangeInputHarness;

export { LegacyFormFieldHarnessFilters }

// @public @deprecated
export class MatLegacyErrorHarness extends _MatErrorHarnessBase {
    // (undocumented)
    static hostSelector: string;
    static with<T extends MatLegacyErrorHarness>(this: ComponentHarnessConstructor<T>, options?: LegacyErrorHarnessFilters): HarnessPredicate<T>;
}

export { MatLegacyFormFieldControlHarness }

// @public @deprecated
export class MatLegacyFormFieldHarness extends _MatFormFieldHarnessBase<LegacyFormFieldControlHarness, typeof MatLegacyErrorHarness> {
    // (undocumented)
    protected _datepickerInputControl: AsyncFactoryFn<MatDatepickerInputHarness | null>;
    // (undocumented)
    protected _dateRangeInputControl: AsyncFactoryFn<MatDateRangeInputHarness | null>;
    // (undocumented)
    protected _errorHarness: typeof MatLegacyErrorHarness;
    // (undocumented)
    protected _errors: AsyncFactoryFn<TestElement[]>;
    getAppearance(): Promise<'legacy' | 'standard' | 'fill' | 'outline'>;
    hasLabel(): Promise<boolean>;
    // (undocumented)
    protected _hints: AsyncFactoryFn<TestElement[]>;
    // (undocumented)
    static hostSelector: string;
    // (undocumented)
    protected _inputControl: AsyncFactoryFn<MatLegacyInputHarness | null>;
    isLabelFloating(): Promise<boolean>;
    // (undocumented)
    protected _label: AsyncFactoryFn<TestElement | null>;
    // (undocumented)
    protected _prefixContainer: AsyncFactoryFn<TestElement | null>;
    // (undocumented)
    protected _selectControl: AsyncFactoryFn<MatLegacySelectHarness | null>;
    // (undocumented)
    protected _suffixContainer: AsyncFactoryFn<TestElement | null>;
    static with(options?: LegacyFormFieldHarnessFilters): HarnessPredicate<MatLegacyFormFieldHarness>;
}

// (No @packageDocumentation comment for this package)

```
