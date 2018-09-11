/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException} from '@angular-devkit/schematics';
import {WorkspaceProject} from '@schematics/angular/utility/config';
import {getProjectTargetOptions} from '../../utils/project-targets';

/** Looks for the index HTML file in the given project and returns its path. */
export function getIndexHtmlPath(project: WorkspaceProject): string {
  const buildOptions = getProjectTargetOptions(project, 'build');

  if (!buildOptions.index) {
    throw new SchematicsException('No project "index.html" file could be found.');
  }

  return buildOptions.index;
}
