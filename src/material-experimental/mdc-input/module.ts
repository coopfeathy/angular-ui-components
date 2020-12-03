/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TextFieldModule} from '@angular/cdk/text-field';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material-experimental/mdc-core';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatTextareaAutosize} from './autosize';
import {MatInput} from './input';

@NgModule({
  imports: [MatCommonModule, MatFormFieldModule],
  exports: [MatInput, MatTextareaAutosize, MatFormFieldModule, TextFieldModule, MatCommonModule],
  declarations: [MatInput, MatTextareaAutosize],
})
export class MatInputModule {}
