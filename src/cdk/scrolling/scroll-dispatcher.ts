/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injectable, NgZone, Optional, SkipSelf} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {of as observableOf} from 'rxjs/observable/of';
import {auditTime} from 'rxjs/operator/auditTime';
import {Scrollable} from './scrollable';


/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20;

/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
@Injectable()
export class ScrollDispatcher {
  constructor(private _ngZone: NgZone, private _platform: Platform) { }

  /** Subject for notifying that a registered scrollable reference element has been scrolled. */
  private _scrolled: Subject<void> = new Subject<void>();

  /** Keeps track of the global `scroll` and `resize` subscriptions. */
  _globalSubscription: Subscription | null = null;

  /** Keeps track of the amount of subscriptions to `scrolled`. Used for cleaning up afterwards. */
  private _scrolledCount = 0;

  /**
   * Map of all the scrollable references that are registered with the service and their
   * scroll event subscriptions.
   */
  scrollableReferences: Map<Scrollable, Subscription> = new Map();

  /**
   * Registers a Scrollable with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event in its scrolled observable.
   * @param scrollable Scrollable instance to be registered.
   */
  register(scrollable: Scrollable): void {
    const scrollSubscription = scrollable.elementScrolled().subscribe(() => this._scrolled.next());
    this.scrollableReferences.set(scrollable, scrollSubscription);
  }

  /**
   * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
   * @param scrollable Scrollable instance to be deregistered.
   */
  deregister(scrollable: Scrollable): void {
    const scrollableReference = this.scrollableReferences.get(scrollable);

    if (scrollableReference) {
      scrollableReference.unsubscribe();
      this.scrollableReferences.delete(scrollable);
    }
  }

  /**
   * Returns an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
   * to override the default "throttle" time.
   */
  scrolled(auditTimeInMs: number = DEFAULT_SCROLL_TIME): Observable<void> {
    return this._platform.isBrowser ? Observable.create(observer => {
      if (!this._globalSubscription) {
        this._addGlobalListener();
      }

      // In the case of a 0ms delay, use an observable without auditTime
      // since it does add a perceptible delay in processing overhead.
      const subscription = auditTimeInMs > 0 ?
        auditTime.call(this._scrolled, auditTimeInMs).subscribe(observer) :
        this._scrolled.subscribe(observer);

      this._scrolledCount++;

      return () => {
        subscription.unsubscribe();
        this._scrolledCount--;

        if (this._globalSubscription && !this.scrollableReferences.size && !this._scrolledCount) {
          this._globalSubscription.unsubscribe();
          this._globalSubscription = null;
        }
      };
    }) : observableOf<void>();
  }

  /** Returns all registered Scrollables that contain the provided element. */
  getScrollContainers(elementRef: ElementRef): Scrollable[] {
    const scrollingContainers: Scrollable[] = [];

    this.scrollableReferences.forEach((_subscription: Subscription, scrollable: Scrollable) => {
      if (this.scrollableContainsElement(scrollable, elementRef)) {
        scrollingContainers.push(scrollable);
      }
    });

    return scrollingContainers;
  }

  /** Returns true if the element is contained within the provided Scrollable. */
  scrollableContainsElement(scrollable: Scrollable, elementRef: ElementRef): boolean {
    let element = elementRef.nativeElement;
    let scrollableElement = scrollable.getElementRef().nativeElement;

    // Traverse through the element parents until we reach null, checking if any of the elements
    // are the scrollable's element.
    do {
      if (element == scrollableElement) { return true; }
    } while (element = element.parentElement);

    return false;
  }

  /** Sets up the global scroll and resize listeners. */
  private _addGlobalListener() {
    this._globalSubscription = this._ngZone.runOutsideAngular(() => {
      return fromEvent(window.document, 'scroll').subscribe(() => this._scrolled.next());
    });
  }
}

/** @docs-private */
export function SCROLL_DISPATCHER_PROVIDER_FACTORY(
    parentDispatcher: ScrollDispatcher, ngZone: NgZone, platform: Platform) {
  return parentDispatcher || new ScrollDispatcher(ngZone, platform);
}

/** @docs-private */
export const SCROLL_DISPATCHER_PROVIDER = {
  // If there is already a ScrollDispatcher available, use that. Otherwise, provide a new one.
  provide: ScrollDispatcher,
  deps: [[new Optional(), new SkipSelf(), ScrollDispatcher], NgZone, Platform],
  useFactory: SCROLL_DISPATCHER_PROVIDER_FACTORY
};
