import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ACCESSIBILITY_DEMO_ROUTES} from './routes';
import {DemoMaterialModule} from '../demo-material-module';
import {AccessibilityHome, AccessibilityDemo} from './a11y';
import {ButtonAccessibilityDemo} from './button/button-a11y';
import {ButtonToggleAccessibilityDemo} from './button-toggle/button-toggle-a11y';
import {CheckboxAccessibilityDemo} from './checkbox/checkbox-a11y';
import {ChipsAccessibilityDemo} from './chips/chips-a11y';
import {RadioAccessibilityDemo} from './radio/radio-a11y';
import {DatepickerAccessibilityDemo} from './datepicker/datepicker-a11y';

@NgModule({
  imports: [
    RouterModule.forChild(ACCESSIBILITY_DEMO_ROUTES)
  ],
  exports: [
    RouterModule
  ]
})
export class AccessibilityRoutingModule {}

@NgModule({
  imports: [
    AccessibilityRoutingModule,
    CommonModule,
    DemoMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AccessibilityDemo,
    AccessibilityHome,
    ButtonAccessibilityDemo,
    ButtonToggleAccessibilityDemo,
    CheckboxAccessibilityDemo,
    ChipsAccessibilityDemo,
    DatepickerAccessibilityDemo,
    RadioAccessibilityDemo,
  ]
})
export class AccessibilityDemoModule {}
