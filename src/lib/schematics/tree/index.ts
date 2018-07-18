/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {chain, noop, Rule, Tree} from '@angular-devkit/schematics';
import {addModuleImportToModule, findModuleFromOptions} from '../utils/ast';
import {buildComponent} from '../utils/devkit-utils/component';
import {Schema} from './schema';

/**
 * Scaffolds a new tree component.
 * Internally it bootstraps the base component schematic
 */
export default function(options: Schema): Rule {
  return chain([
    buildComponent({ ...options }),
    options.skipImport ? noop() : addTreeModulesToModule(options)
  ]);
}

/**
 * Adds the required modules to the relative module.
 */
function addTreeModulesToModule(options: Schema) {
  return (host: Tree) => {
    const modulePath = findModuleFromOptions(host, options);
    addModuleImportToModule(host, modulePath, 'MatTreeModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatIconModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material');
    return host;
  };
}
