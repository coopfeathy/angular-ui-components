import {
  Component,
  ComponentRef,
  ViewChild,
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationTransitionEvent,
  NgZone
} from '@angular/core';
import {
  BasePortalHost,
  ComponentPortal,
  TemplatePortal,
  PortalHostDirective,
  AnimationCurves,
  AnimationDurations,
} from '../core';
import {MdSnackBarConfig} from './snack-bar-config';
import {MdSnackBarContentAlreadyAttached} from './snack-bar-errors';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';



export type SnackBarState = 'initial' | 'visible' | 'complete' | 'void';

/**
 * Internal component that wraps user-provided snack bar content.
 */
@Component({
  moduleId: module.id,
  selector: 'snack-bar-container',
  templateUrl: 'snack-bar-container.html',
  styleUrls: ['snack-bar-container.css'],
  host: {
    'role': 'alert',
    '[@state]': 'animationState',
    '(@state.done)': 'markAsExited($event)'
  },
  animations: [
    trigger('state', [
      state('initial', style({transform: 'translateY(100%)'})),
      state('visible', style({transform: 'translateY(0%)'})),
      state('complete', style({transform: 'translateY(100%)'})),
      transition('visible => complete',
                 animate(`${AnimationDurations.EXITING} ${AnimationCurves.DECELERATION_CURVE}`)),
      transition('initial => visible, void => visible',
                 animate(`${AnimationDurations.ENTERING} ${AnimationCurves.ACCELERATION_CURVE}`)),
    ])
  ],
})
export class MdSnackBarContainer extends BasePortalHost {
  /** The portal host inside of this container into which the snack bar content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** Subject for notifying that the snack bar has exited from view. */
  private _onExit: Subject<any> = new Subject();

  /** The state of the snack bar animations. */
  animationState: SnackBarState = 'initial';

  /** The snack bar configuration. */
  snackBarConfig: MdSnackBarConfig;

  constructor(private _ngZone: NgZone) {
    super();
  }

  /** Attach a component portal as content to this snack bar container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throw new MdSnackBarContentAlreadyAttached();
    }

    return this._portalHost.attachComponentPortal(portal);
  }

  /** Attach a template portal as content to this snack bar container. */
  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    throw Error('Not yet implemented');
  }

  /** Begin animation of the snack bar exiting from view. */
  exit(): Observable<void> {
    this.animationState = 'complete';
    return this._onExit.asObservable();
  }

  /** Mark snack bar as exited from the view. */
  markAsExited(event: AnimationTransitionEvent) {
    if (event.fromState === 'visible' &&
        (event.toState === 'void' || event.toState === 'complete')) {
      this._ngZone.run(() => {
        this._onExit.next();
        this._onExit.complete();
      });
    }
  }

  /** Begin animation of snack bar entrance into view. */
  enter(): void {
    this.animationState = 'visible';
  }
}
