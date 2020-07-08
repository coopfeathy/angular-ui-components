/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  SkipSelf,
  ViewContainerRef,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  isDevMode,
  Self,
} from '@angular/core';
import {
  coerceBooleanProperty,
  coerceNumberProperty,
  coerceElement,
  BooleanInput
} from '@angular/cdk/coercion';
import {Observable, Observer, Subject, merge} from 'rxjs';
import {startWith, take, map, takeUntil, switchMap, tap} from 'rxjs/operators';
import {
  CdkDragDrop,
  CdkDragEnd,
  CdkDragEnter,
  CdkDragExit,
  CdkDragMove,
  CdkDragStart,
  CdkDragRelease,
} from '../drag-events';
import {CDK_DRAG_HANDLE, CdkDragHandle} from './drag-handle';
import {CDK_DRAG_PLACEHOLDER, CdkDragPlaceholder} from './drag-placeholder';
import {CDK_DRAG_PREVIEW, CdkDragPreview} from './drag-preview';
import {CDK_DRAG_PARENT} from '../drag-parent';
import {DragRef, Point} from '../drag-ref';
import {CDK_DROP_LIST, CdkDropListInternal as CdkDropList} from './drop-list';
import {DragDrop} from '../drag-drop';
import {CDK_DRAG_CONFIG, DragDropConfig, DragStartDelay, DragAxis} from './config';

/** Element that can be moved inside a CdkDropList container. */
@Directive({
  selector: '[cdkDrag]',
  exportAs: 'cdkDrag',
  host: {
    'class': 'cdk-drag',
    '[class.cdk-drag-disabled]': 'disabled',
    '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
  },
  providers: [{provide: CDK_DRAG_PARENT, useExisting: CdkDrag}]
})
export class CdkDrag<T = any> implements AfterViewInit, OnChanges, OnDestroy {
  private _destroyed = new Subject<void>();

  /** Reference to the underlying drag instance. */
  _dragRef: DragRef<CdkDrag<T>>;

  // TODO: Remove cast once https://github.com/angular/angular/pull/37506 is available.
  /** Elements that can be used to drag the draggable item. */
  @ContentChildren(CDK_DRAG_HANDLE as any, {descendants: true}) _handles: QueryList<CdkDragHandle>;

  // TODO: Remove cast once https://github.com/angular/angular/pull/37506 is available.
  /** Element that will be used as a template to create the draggable item's preview. */
  @ContentChild(CDK_DRAG_PREVIEW as any) _previewTemplate: CdkDragPreview;

  // TODO: Remove cast once https://github.com/angular/angular/pull/37506 is available.
  /** Template for placeholder element rendered to show where a draggable would be dropped. */
  @ContentChild(CDK_DRAG_PLACEHOLDER as any) _placeholderTemplate: CdkDragPlaceholder;

  /** Arbitrary data to attach to this drag instance. */
  @Input('cdkDragData') data: T;

  /** Locks the position of the dragged element along the specified axis. */
  @Input('cdkDragLockAxis') lockAxis: DragAxis;

  /**
   * Selector that will be used to determine the root draggable element, starting from
   * the `cdkDrag` element and going up the DOM. Passing an alternate root element is useful
   * when trying to enable dragging on an element that you might not have access to.
   */
  @Input('cdkDragRootElement') rootElementSelector: string;

  /**
   * Node or selector that will be used to determine the element to which the draggable's
   * position will be constrained. If a string is passed in, it'll be used as a selector that
   * will be matched starting from the element's parent and going up the DOM until a match
   * has been found.
   */
  @Input('cdkDragBoundary') boundaryElement: string | ElementRef<HTMLElement> | HTMLElement;

  /**
   * Amount of milliseconds to wait after the user has put their
   * pointer down before starting to drag the element.
   */
  @Input('cdkDragStartDelay') dragStartDelay: DragStartDelay;

  /**
   * Sets the position of a `CdkDrag` that is outside of a drop container.
   * Can be used to restore the element's position for a returning user.
   */
  @Input('cdkDragFreeDragPosition') freeDragPosition: {x: number, y: number};

  /** Whether starting to drag this element is disabled. */
  @Input('cdkDragDisabled')
  get disabled(): boolean {
    return this._disabled || (this.dropContainer && this.dropContainer.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._dragRef.disabled = this._disabled;
  }
  private _disabled: boolean;

  /**
   * Function that can be used to customize the logic of how the position of the drag item
   * is limited while it's being dragged. Gets called with a point containing the current position
   * of the user's pointer on the page and should return a point describing where the item should
   * be rendered.
   */
  @Input('cdkDragConstrainPosition') constrainPosition?: (point: Point, dragRef: DragRef) => Point;

  /** Class to be added to the preview element. */
  @Input('cdkDragPreviewClass') previewClass: string | string[];

  /** Emits when the user starts dragging the item. */
  @Output('cdkDragStarted') started: EventEmitter<CdkDragStart> = new EventEmitter<CdkDragStart>();

  /** Emits when the user has released a drag item, before any animations have started. */
  @Output('cdkDragReleased') released: EventEmitter<CdkDragRelease> =
      new EventEmitter<CdkDragRelease>();

  /** Emits when the user stops dragging an item in the container. */
  @Output('cdkDragEnded') ended: EventEmitter<CdkDragEnd> = new EventEmitter<CdkDragEnd>();

  /** Emits when the user has moved the item into a new container. */
  @Output('cdkDragEntered') entered: EventEmitter<CdkDragEnter<any>> =
      new EventEmitter<CdkDragEnter<any>>();

  /** Emits when the user removes the item its container by dragging it into another container. */
  @Output('cdkDragExited') exited: EventEmitter<CdkDragExit<any>> =
      new EventEmitter<CdkDragExit<any>>();

  /** Emits when the user drops the item inside a container. */
  @Output('cdkDragDropped') dropped: EventEmitter<CdkDragDrop<any>> =
      new EventEmitter<CdkDragDrop<any>>();

  /**
   * Emits as the user is dragging the item. Use with caution,
   * because this event will fire for every pixel that the user has dragged.
   */
  @Output('cdkDragMoved') moved: Observable<CdkDragMove<T>> =
      new Observable((observer: Observer<CdkDragMove<T>>) => {
        const subscription = this._dragRef.moved.pipe(map(movedEvent => ({
          source: this,
          pointerPosition: movedEvent.pointerPosition,
          event: movedEvent.event,
          delta: movedEvent.delta,
          distance: movedEvent.distance
        }))).subscribe(observer);

        return () => {
          subscription.unsubscribe();
        };
      });

  constructor(
      /** Element that the draggable is attached to. */
      public element: ElementRef<HTMLElement>,
      /** Droppable container that the draggable is a part of. */
      @Inject(CDK_DROP_LIST) @Optional() @SkipSelf() public dropContainer: CdkDropList,
      @Inject(DOCUMENT) private _document: any, private _ngZone: NgZone,
      private _viewContainerRef: ViewContainerRef,
      @Optional() @Inject(CDK_DRAG_CONFIG) config: DragDropConfig,
      @Optional() private _dir: Directionality, dragDrop: DragDrop,
      private _changeDetectorRef: ChangeDetectorRef,
      @Optional() @Self() private _selfHandle?: CdkDragHandle) {
    this._dragRef = dragDrop.createDrag(element, {
      dragStartThreshold: config && config.dragStartThreshold != null ?
          config.dragStartThreshold : 5,
      pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null ?
          config.pointerDirectionChangeThreshold : 5,
      zIndex: config?.zIndex
    });
    this._dragRef.data = this;

    if (config) {
      this._assignDefaults(config);
    }

    // Note that usually the container is assigned when the drop list is picks up the item, but in
    // some cases (mainly transplanted views with OnPush, see #18341) we may end up in a situation
    // where there are no items on the first change detection pass, but the items get picked up as
    // soon as the user triggers another pass by dragging. This is a problem, because the item would
    // have to switch from standalone mode to drag mode in the middle of the dragging sequence which
    // is too late since the two modes save different kinds of information. We work around it by
    // assigning the drop container both from here and the list.
    if (dropContainer) {
      this._dragRef._withDropContainer(dropContainer._dropListRef);
      dropContainer.addItem(this);
    }

    this._syncInputs(this._dragRef);
    this._handleEvents(this._dragRef);
  }

  /**
   * Returns the element that is being used as a placeholder
   * while the current element is being dragged.
   */
  getPlaceholderElement(): HTMLElement {
    return this._dragRef.getPlaceholderElement();
  }

  /** Returns the root draggable element. */
  getRootElement(): HTMLElement {
    return this._dragRef.getRootElement();
  }

  /** Resets a standalone drag item to its initial position. */
  reset(): void {
    this._dragRef.reset();
  }

  /**
   * Gets the pixel coordinates of the draggable outside of a drop container.
   */
  getFreeDragPosition(): {readonly x: number, readonly y: number} {
    return this._dragRef.getFreeDragPosition();
  }

  ngAfterViewInit() {
    // We need to wait for the zone to stabilize, in order for the reference
    // element to be in the proper place in the DOM. This is mostly relevant
    // for draggable elements inside portals since they get stamped out in
    // their original DOM position and then they get transferred to the portal.
    this._ngZone.onStable.asObservable()
      .pipe(take(1), takeUntil(this._destroyed))
      .subscribe(() => {
        this._updateRootElement();

        // Listen for any newly-added handles.
        this._handles.changes.pipe(
          startWith(this._handles),
          // Sync the new handles with the DragRef.
          tap((handles: QueryList<CdkDragHandle>) => {
            const childHandleElements = handles
              .filter(handle => handle._parentDrag === this)
              .map(handle => handle.element);

            // Usually handles are only allowed to be a descendant of the drag element, but if
            // the consumer defined a different drag root, we should allow the drag element
            // itself to be a handle too.
            if (this._selfHandle && this.rootElementSelector) {
              childHandleElements.push(this.element);
            }

            this._dragRef.withHandles(childHandleElements);
          }),
          // Listen if the state of any of the handles changes.
          switchMap((handles: QueryList<CdkDragHandle>) => {
            return merge(...handles.map(item => {
              return item._stateChanges.pipe(startWith(item));
            })) as Observable<CdkDragHandle>;
          }),
          takeUntil(this._destroyed)
        ).subscribe(handleInstance => {
          // Enabled/disable the handle that changed in the DragRef.
          const dragRef = this._dragRef;
          const handle = handleInstance.element.nativeElement;
          handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
        });

        if (this.freeDragPosition) {
          this._dragRef.setFreeDragPosition(this.freeDragPosition);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const rootSelectorChange = changes['rootElementSelector'];
    const positionChange = changes['freeDragPosition'];

    // We don't have to react to the first change since it's being
    // handled in `ngAfterViewInit` where it needs to be deferred.
    if (rootSelectorChange && !rootSelectorChange.firstChange) {
      this._updateRootElement();
    }

    // Skip the first change since it's being handled in `ngAfterViewInit`.
    if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
      this._dragRef.setFreeDragPosition(this.freeDragPosition);
    }
  }

  ngOnDestroy() {
    if (this.dropContainer) {
      this.dropContainer.removeItem(this);
    }

    this._destroyed.next();
    this._destroyed.complete();
    this._dragRef.dispose();
  }

  /** Syncs the root element with the `DragRef`. */
  private _updateRootElement() {
    const element = this.element.nativeElement;
    const rootElement = this.rootElementSelector ?
        getClosestMatchingAncestor(element, this.rootElementSelector) : element;

    if (rootElement && rootElement.nodeType !== this._document.ELEMENT_NODE) {
      throw Error(`cdkDrag must be attached to an element node. ` +
                  `Currently attached to "${rootElement.nodeName}".`);
    }

    this._dragRef.withRootElement(rootElement || element);
  }

  /** Gets the boundary element, based on the `boundaryElement` value. */
  private _getBoundaryElement() {
    const boundary = this.boundaryElement;

    if (!boundary) {
      return null;
    }

    if (typeof boundary === 'string') {
      return getClosestMatchingAncestor(this.element.nativeElement, boundary);
    }

    const element = coerceElement(boundary);

    if (isDevMode() && !element.contains(this.element.nativeElement)) {
      throw Error('Draggable element is not inside of the node passed into cdkDragBoundary.');
    }

    return element;
  }

  /** Syncs the inputs of the CdkDrag with the options of the underlying DragRef. */
  private _syncInputs(ref: DragRef<CdkDrag<T>>) {
    ref.beforeStarted.subscribe(() => {
      if (!ref.isDragging()) {
        const dir = this._dir;
        const dragStartDelay = this.dragStartDelay;
        const placeholder = this._placeholderTemplate ? {
          template: this._placeholderTemplate.templateRef,
          context: this._placeholderTemplate.data,
          viewContainer: this._viewContainerRef
        } : null;
        const preview = this._previewTemplate ? {
          template: this._previewTemplate.templateRef,
          context: this._previewTemplate.data,
          matchSize: this._previewTemplate.matchSize,
          viewContainer: this._viewContainerRef
        } : null;

        ref.disabled = this.disabled;
        ref.lockAxis = this.lockAxis;
        ref.dragStartDelay = (typeof dragStartDelay === 'object' && dragStartDelay) ?
            dragStartDelay : coerceNumberProperty(dragStartDelay);
        ref.constrainPosition = this.constrainPosition;
        ref.previewClass = this.previewClass;
        ref
          .withBoundaryElement(this._getBoundaryElement())
          .withPlaceholderTemplate(placeholder)
          .withPreviewTemplate(preview);

        if (dir) {
          ref.withDirection(dir.value);
        }
      }
    });
  }

  /** Handles the events from the underlying `DragRef`. */
  private _handleEvents(ref: DragRef<CdkDrag<T>>) {
    ref.started.subscribe(() => {
      this.started.emit({source: this});

      // Since all of these events run outside of change detection,
      // we need to ensure that everything is marked correctly.
      this._changeDetectorRef.markForCheck();
    });

    ref.released.subscribe(() => {
      this.released.emit({source: this});
    });

    ref.ended.subscribe(event => {
      this.ended.emit({source: this, distance: event.distance});

      // Since all of these events run outside of change detection,
      // we need to ensure that everything is marked correctly.
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container: event.container.data,
        item: this,
        currentIndex: event.currentIndex
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: event.container.data,
        item: this
      });
    });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        previousContainer: event.previousContainer.data,
        container: event.container.data,
        isPointerOverContainer: event.isPointerOverContainer,
        item: this,
        distance: event.distance
      });
    });
  }

  /** Assigns the default input values based on a provided config object. */
  private _assignDefaults(config: DragDropConfig) {
    const {
      lockAxis, dragStartDelay, constrainPosition, previewClass,
      boundaryElement, draggingDisabled, rootElementSelector
    } = config;

    this.disabled = draggingDisabled == null ? false : draggingDisabled;
    this.dragStartDelay = dragStartDelay || 0;

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }

    if (constrainPosition) {
      this.constrainPosition = constrainPosition;
    }

    if (previewClass) {
      this.previewClass = previewClass;
    }

    if (boundaryElement) {
      this.boundaryElement = boundaryElement;
    }

    if (rootElementSelector) {
      this.rootElementSelector = rootElementSelector;
    }
  }

  static ngAcceptInputType_disabled: BooleanInput;
}

/** Gets the closest ancestor of an element that matches a selector. */
function getClosestMatchingAncestor(element: HTMLElement, selector: string) {
  let currentElement = element.parentElement as HTMLElement | null;

  while (currentElement) {
    // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
    if (currentElement.matches ? currentElement.matches(selector) :
        (currentElement as any).msMatchesSelector(selector)) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return null;
}

