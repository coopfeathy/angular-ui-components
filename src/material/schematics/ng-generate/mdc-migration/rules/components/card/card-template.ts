/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstElement} from '@angular/compiler';
import {TemplateMigrator, Update} from '../../template-migrator';
import {addAttribute} from '../../tree-traversal';

export class CardTemplateMigrator extends TemplateMigrator {
  component = 'card';
  tagName = 'mat-card';

  getUpdates(node: TmplAstElement): Update[] {
    if (node.name !== this.tagName) {
      return [];
    }

    return [
      {
        location: node.startSourceSpan.end,
        updateFn: html => addAttribute(html, node, 'appearance', 'outlined'),
      },
    ];
  }
}
