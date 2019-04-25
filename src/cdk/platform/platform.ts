/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, Optional, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

// Whether the current platform supports the V8 Break Iterator. The V8 check
// is necessary to detect all Blink based browsers.
let hasV8BreakIterator: boolean;

// We need a try/catch around the reference to `Intl`, because accessing it in some cases can
// cause IE to throw. These cases are tied to particular versions of Windows and can happen if
// the consumer is providing a polyfilled `Map`. See:
// https://github.com/Microsoft/ChakraCore/issues/3189
// https://github.com/angular/components/issues/15687
try {
  hasV8BreakIterator = (typeof Intl !== 'undefined' && (Intl as any).v8BreakIterator);
} catch {
  hasV8BreakIterator = false;
}

/**
 * Service to detect the current platform by comparing the userAgent strings and
 * checking browser-specific global properties.
 */
@Injectable({providedIn: 'root'})
export class Platform {
  /**
   * Whether the Angular application is being rendered in the browser.
   * We want to use the Angular platform check because if the Document is shimmed
   * without the navigator, the following checks will fail. This is preferred because
   * sometimes the Document may be shimmed without the user's knowledge or intention
   */
  isBrowser: boolean = this._platformId ?
      isPlatformBrowser(this._platformId) : typeof document === 'object' && !!document;

  /** Whether the current browser is Microsoft Edge. */
  EDGE: boolean = this.isBrowser && /(edge)/i.test(navigator.userAgent);

  /** Whether the current rendering engine is Microsoft Trident. */
  TRIDENT: boolean = this.isBrowser && /(msie|trident)/i.test(navigator.userAgent);

  /** Whether the current rendering engine is Blink. */
  // EdgeHTML and Trident mock Blink specific things and need to be excluded from this check.
  BLINK: boolean = this.isBrowser && (!!((window as any).chrome || hasV8BreakIterator) &&
      typeof CSS !== 'undefined' && !this.EDGE && !this.TRIDENT);

  /** Whether the current rendering engine is WebKit. */
  // Webkit is part of the userAgent in EdgeHTML, Blink and Trident. Therefore we need to
  // ensure that Webkit runs standalone and is not used as another engine's base.
  WEBKIT: boolean = this.isBrowser &&
      /AppleWebKit/i.test(navigator.userAgent) && !this.BLINK && !this.EDGE && !this.TRIDENT;

  /** Whether the current platform is Apple iOS. */
  IOS: boolean = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in window);

  /** Whether the current browser is Firefox. */
  // It's difficult to detect the plain Gecko engine, because most of the browsers identify
  // them self as Gecko-like browsers and modify the userAgent's according to that.
  // Since we only cover one explicit Firefox case, we can simply check for Firefox
  // instead of having an unstable check for Gecko.
  FIREFOX: boolean = this.isBrowser && /(firefox|minefield)/i.test(navigator.userAgent);

  /** Whether the current platform is Android. */
  // Trident on mobile adds the android platform to the userAgent to trick detections.
  ANDROID: boolean = this.isBrowser && /android/i.test(navigator.userAgent) && !this.TRIDENT;

  /** Whether the current browser is Safari. */
  // Safari browsers will include the Safari keyword in their userAgent. Some browsers may fake
  // this and just place the Safari keyword in the userAgent. To be more safe about Safari every
  // Safari browser should also use Webkit as its layout engine.
  SAFARI: boolean = this.isBrowser && /safari/i.test(navigator.userAgent) && this.WEBKIT;

  /**
   * @breaking-change 8.0.0 remove optional decorator
   */
  constructor(@Optional() @Inject(PLATFORM_ID) private _platformId?: Object) {
}
}

