import {Routes} from '@angular/router';
import {ButtonAccessibilityDemo} from './button/button-a11y';
import {ButtonToggleAccessibilityDemo} from './button-toggle/button-toggle-a11y';
import {CheckboxAccessibilityDemo} from './checkbox/checkbox-a11y';
import {ChipsAccessibilityDemo} from './chips/chips-a11y';
import {RadioAccessibilityDemo} from './radio/radio-a11y';
import {AccessibilityHome} from './a11y';
import {DatepickerAccessibilityDemo} from './datepicker/datepicker-a11y';

export const ACCESSIBILITY_DEMO_ROUTES: Routes = [
  {path: '', component: AccessibilityHome},
  {path: 'button', component: ButtonAccessibilityDemo},
  {path: 'button-toggle', component: ButtonToggleAccessibilityDemo},
  {path: 'checkbox', component: CheckboxAccessibilityDemo},
  {path: 'chips', component: ChipsAccessibilityDemo},
  {path: 'datepicker', component: DatepickerAccessibilityDemo},
  {path: 'radio', component: RadioAccessibilityDemo},
];
