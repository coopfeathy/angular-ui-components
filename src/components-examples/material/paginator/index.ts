import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {PaginatorConfigurableExample} from './paginator-configurable/paginator-configurable-example';
import {PaginatorOverviewExample} from './paginator-overview/paginator-overview-example';
import {PaginatorHarnessExample} from './paginator-harness/paginator-harness-example';
import {
  PaginatorIntlExample,
  PaginatorIntlExampleModule,
} from './paginator-intl/paginator-intl-example';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

export {
  PaginatorConfigurableExample,
  PaginatorHarnessExample,
  PaginatorIntlExample,
  PaginatorOverviewExample,
};

const EXAMPLES = [
  PaginatorConfigurableExample,
  PaginatorHarnessExample,
  // PaginatorIntlExample is imported through it's own example module.
  PaginatorOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    PaginatorIntlExampleModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class PaginatorExamplesModule {}
