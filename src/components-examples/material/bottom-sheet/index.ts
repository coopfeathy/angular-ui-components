import {NgModule} from '@angular/core';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyListModule} from '@angular/material/legacy-list';
import {
  BottomSheetOverviewExample,
  BottomSheetOverviewExampleSheet,
} from './bottom-sheet-overview/bottom-sheet-overview-example';
import {BottomSheetHarnessExample} from './bottom-sheet-harness/bottom-sheet-harness-example';

export {BottomSheetHarnessExample, BottomSheetOverviewExample, BottomSheetOverviewExampleSheet};

const EXAMPLES = [
  BottomSheetHarnessExample,
  BottomSheetOverviewExample,
  BottomSheetOverviewExampleSheet,
];

@NgModule({
  imports: [MatBottomSheetModule, MatButtonModule, MatLegacyListModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class BottomSheetExamplesModule {}
