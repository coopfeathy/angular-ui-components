import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  Directive,
  NgZone,
} from '@angular/core';
import {MdInkBar} from '../ink-bar';
import {MdRipple} from '../../core/ripple/ripple';
import {ViewportRuler} from '../../core/overlay/position/viewport-ruler';

/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  moduleId: module.id,
  selector: '[md-tab-nav-bar], [mat-tab-nav-bar]',
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.css'],
  host: {
    '[class.mat-tab-nav-bar]': 'true',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdTabNavBar {
  @ViewChild(MdInkBar) _inkBar: MdInkBar;

  /** Animates the ink bar to the position of the active link element. */
  updateActiveLink(element: HTMLElement) {
    this._inkBar.alignToElement(element);
  }
}

/**
 * Link inside of a `md-tab-nav-bar`.
 */
@Directive({
  selector: '[md-tab-link], [mat-tab-link]',
})
export class MdTabLink {
  private _isActive: boolean = false;

  /** Whether the link is active. */
  @Input()
  get active(): boolean { return this._isActive; }
  set active(value: boolean) {
    this._isActive = value;
    if (value) {
      this._mdTabNavBar.updateActiveLink(this._element.nativeElement);
    }
  }

  constructor(private _mdTabNavBar: MdTabNavBar, private _element: ElementRef) {}
}

/**
 * Simple directive that extends the ripple and matches the selector of the MdTabLink. This
 * adds the ripple behavior to nav bar labels.
 */
@Directive({
  selector: '[md-tab-link], [mat-tab-link]',
  host: {
    '[class.mat-tab-link]': 'true',
  },
})
export class MdTabLinkRipple extends MdRipple {
  constructor(elementRef: ElementRef, ngZone: NgZone, ruler: ViewportRuler) {
    super(elementRef, ngZone, ruler);
  }

}
