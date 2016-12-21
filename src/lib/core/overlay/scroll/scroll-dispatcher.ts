import {Injectable} from '@angular/core';
import {Scrollable} from './scrollable';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';


/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
@Injectable()
export class ScrollDispatcher {
  /** Subject for notifying that a registered scrollable reference element has been scrolled. */
  _scrolled: Subject<void> = new Subject<void>();

  /**
   * Map of all the scrollable references that are registered with the service and their
   * scroll event subscriptions.
   */
  scrollableReferences: WeakMap<Scrollable, Subscription> = new WeakMap();

  constructor() {
    // By default, notify a scroll event when the document is scrolled or the window is resized.
    Observable.fromEvent(window.document, 'scroll').subscribe(() => this._notify());
    Observable.fromEvent(window, 'resize').subscribe(() => this._notify());
  }

  /**
   * Registers a Scrollable with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event in its scrolled observable.
   *
   * @param scrollable Scrollable instance to be registered.
   */
  register(scrollable: Scrollable): void {
    const scrollSubscription = scrollable.elementScrolled().subscribe(() => this._notify());
    this.scrollableReferences.set(scrollable, scrollSubscription);
  }

  /**
   * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
   *
   * @param scrollable Scrollable instance to be deregistered.
   */
  deregister(scrollable: Scrollable): void {
    this.scrollableReferences.get(scrollable).unsubscribe();
    this.scrollableReferences.delete(scrollable);
  }

  /**
   * Returns an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event.
   */
  scrolled(): Observable<void> {
    // TODO: Add an event limiter that includes throttle with the leading and trailing events.
    return this._scrolled.asObservable();
  }

  /** Sends a notification that a scroll event has been fired. */
  _notify() {
    this._scrolled.next();
  }
}
