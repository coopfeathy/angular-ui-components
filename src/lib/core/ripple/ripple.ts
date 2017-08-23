/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  Input,
  Inject,
  NgZone,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  InjectionToken,
  Optional,
} from '@angular/core';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {Platform} from '@angular/cdk/platform';
import {RippleConfig, RippleRenderer} from './ripple-renderer';
import {RippleRef} from './ripple-ref';

export interface RippleGlobalOptions {
  disabled?: boolean;
  baseSpeedFactor?: number;
}

/** Injection token that can be used to specify the global ripple options. */
export const MD_RIPPLE_GLOBAL_OPTIONS =
    new InjectionToken<RippleGlobalOptions>('md-ripple-global-options');

@Directive({
  selector: '[md-ripple], [mat-ripple], [mdRipple], [matRipple]',
  exportAs: 'mdRipple',
  host: {
    'class': 'mat-ripple',
    '[class.mat-ripple-unbounded]': 'unbounded'
  }
})
export class MdRipple implements OnChanges, OnDestroy {

  /**
   * The element that triggers the ripple when click events are received. Defaults to the
   * directive's host element.
   */
  // Prevent TS metadata emit from referencing HTMLElement in ripple.js
  // Otherwise running this code in a Node environment (e.g Universal) will not work.
  @Input('mdRippleTrigger') trigger: HTMLElement|HTMLElement;

  /**
   * Whether the ripple always originates from the center of the host element's bounds, rather
   * than originating from the location of the click event.
   */
  @Input('mdRippleCentered') centered: boolean;

  /**
   * Whether click events will not trigger the ripple. Ripples can be still launched manually
   * by using the `launch()` method.
   */
  @Input('mdRippleDisabled') disabled: boolean;

  /**
   * If set, the radius in pixels of foreground ripples when fully expanded. If unset, the radius
   * will be the distance from the center of the ripple to the furthest corner of the host element's
   * bounding rectangle.
   */
  @Input('mdRippleRadius') radius: number = 0;

  /**
   * If set, the normal duration of ripple animations is divided by this value. For example,
   * setting it to 0.5 will cause the animations to take twice as long.
   * A changed speedFactor will not modify the fade-out duration of the ripples.
   */
  @Input('mdRippleSpeedFactor') speedFactor: number = 1;

  /** Custom color for ripples. */
  @Input('mdRippleColor') color: string;

  /** Whether foreground ripples should be visible outside the component's bounds. */
  @Input('mdRippleUnbounded') unbounded: boolean;

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matRippleTrigger')
  get _matRippleTrigger() { return this.trigger; }
  set _matRippleTrigger(v) { this.trigger = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matRippleCentered')
  get _matRippleCentered() { return this.centered; }
  set _matRippleCentered(v) { this.centered = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matRippleDisabled')
  get _matRippleDisabled() { return this.disabled; }
  set _matRippleDisabled(v) { this.disabled = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matRippleRadius')
  get _matRippleRadius() { return this.radius; }
  set _matRippleRadius(v) { this.radius = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matRippleSpeedFactor')
  get _matRippleSpeedFactor() { return this.speedFactor; }
  set _matRippleSpeedFactor(v) { this.speedFactor = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matRippleColor')
  get _matRippleColor() { return this.color; }
  set _matRippleColor(v) { this.color = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matRippleUnbounded')
  get _matRippleUnbounded() { return this.unbounded; }
  set _matRippleUnbounded(v) { this.unbounded = v; }

  /** Renderer for the ripple DOM manipulations. */
  private _rippleRenderer: RippleRenderer;

  /** Options that are set globally for all ripples. */
  private _globalOptions: RippleGlobalOptions;

  constructor(
    elementRef: ElementRef,
    ngZone: NgZone,
    ruler: ViewportRuler,
    platform: Platform,
    @Optional() @Inject(MD_RIPPLE_GLOBAL_OPTIONS) globalOptions: RippleGlobalOptions
  ) {
    this._rippleRenderer = new RippleRenderer(elementRef, ngZone, ruler, platform);
    this._globalOptions = globalOptions ? globalOptions : {};

    this._updateRippleRenderer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['trigger'] && this.trigger) {
      this._rippleRenderer.setTriggerElement(this.trigger);
    }

    this._updateRippleRenderer();
  }

  ngOnDestroy() {
    // Set the trigger element to null to cleanup all listeners.
    this._rippleRenderer.setTriggerElement(null);
  }

  /** Launches a manual ripple at the specified position. */
  launch(pageX: number, pageY: number, config = this.rippleConfig): RippleRef {
    return this._rippleRenderer.fadeInRipple(pageX, pageY, config);
  }

  /** Fades out all currently showing ripple elements. */
  fadeOutAll() {
    this._rippleRenderer.fadeOutAll();
  }

  /** Ripple configuration from the directive's input values. */
  get rippleConfig(): RippleConfig {
    return {
      centered: this.centered,
      speedFactor: this.speedFactor * (this._globalOptions.baseSpeedFactor || 1),
      radius: this.radius,
      color: this.color
    };
  }

  /** Updates the ripple renderer with the latest ripple configuration. */
  _updateRippleRenderer() {
    this._rippleRenderer.rippleDisabled = this._globalOptions.disabled || this.disabled;
    this._rippleRenderer.rippleConfig = this.rippleConfig;
  }
}
