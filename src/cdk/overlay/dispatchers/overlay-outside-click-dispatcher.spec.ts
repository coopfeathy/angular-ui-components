import {TestBed, inject, fakeAsync} from '@angular/core/testing';
import {Component, NgModule} from '@angular/core';
import {dispatchFakeEvent, dispatchMouseEvent} from '../../testing/private';
import {OverlayModule, Overlay} from '../index';
import {OverlayOutsideClickDispatcher} from './overlay-outside-click-dispatcher';
import {ComponentPortal} from '@angular/cdk/portal';

describe('OverlayOutsideClickDispatcher', () => {
  let outsideClickDispatcher: OverlayOutsideClickDispatcher;
  let overlay: Overlay;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, TestComponentModule],
    });

    inject([OverlayOutsideClickDispatcher, Overlay],
      (ocd: OverlayOutsideClickDispatcher, o: Overlay) => {
      outsideClickDispatcher = ocd;
      overlay = o;
    })();
  });

  it('should track overlays in order as they are attached and detached', () => {
    const overlayOne = overlay.create();
    const overlayTwo = overlay.create();

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);

    expect(outsideClickDispatcher._attachedOverlays.length)
      .withContext('Expected both overlays to be tracked.').toBe(2);
    expect(outsideClickDispatcher._attachedOverlays[0])
      .withContext('Expected one to be first.').toBe(overlayOne);
    expect(outsideClickDispatcher._attachedOverlays[1])
      .withContext('Expected two to be last.').toBe(overlayTwo);

    outsideClickDispatcher.remove(overlayOne);
    outsideClickDispatcher.add(overlayOne);

    expect(outsideClickDispatcher._attachedOverlays[0])
      .withContext('Expected two to now be first.').toBe(overlayTwo);
    expect(outsideClickDispatcher._attachedOverlays[1])
      .withContext('Expected one to now be last.').toBe(overlayOne);

    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch mouse click events to the attached overlays', () => {
    const overlayOne = overlay.create();
    overlayOne.attach(new ComponentPortal(TestComponent));
    const overlayTwo = overlay.create();
    overlayTwo.attach(new ComponentPortal(TestComponent));

    const overlayOneSpy = jasmine.createSpy('overlayOne mouse click event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayTwo mouse click event spy');

    overlayOne.outsidePointerEvents().subscribe(overlayOneSpy);
    overlayTwo.outsidePointerEvents().subscribe(overlayTwoSpy);

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);

    const button = document.createElement('button');
    document.body.appendChild(button);
    button.click();

    expect(overlayOneSpy).toHaveBeenCalled();
    expect(overlayTwoSpy).toHaveBeenCalled();

    button.remove();
    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch auxiliary button click events to the attached overlays', () => {
    const overlayOne = overlay.create();
    overlayOne.attach(new ComponentPortal(TestComponent));
    const overlayTwo = overlay.create();
    overlayTwo.attach(new ComponentPortal(TestComponent));

    const overlayOneSpy = jasmine.createSpy('overlayOne auxiliary click event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayTwo auxiliary click event spy');

    overlayOne.outsidePointerEvents().subscribe(overlayOneSpy);
    overlayTwo.outsidePointerEvents().subscribe(overlayTwoSpy);

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);

    const button = document.createElement('button');
    document.body.appendChild(button);
    dispatchFakeEvent(button, 'auxclick');

    expect(overlayOneSpy).toHaveBeenCalled();
    expect(overlayTwoSpy).toHaveBeenCalled();

    button.remove();
    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch mouse click events to the attached overlays even when propagation is stopped',
    () => {
      const overlayRef = overlay.create();
      overlayRef.attach(new ComponentPortal(TestComponent));
      const spy = jasmine.createSpy('overlay mouse click event spy');
      overlayRef.outsidePointerEvents().subscribe(spy);

      outsideClickDispatcher.add(overlayRef);

      const button = document.createElement('button');
      document.body.appendChild(button);
      button.addEventListener('click', event => event.stopPropagation());
      button.click();

      expect(spy).toHaveBeenCalled();

      button.remove();
      overlayRef.dispose();
    });

  it('should dispose of the global click event handler correctly', () => {
    const overlayRef = overlay.create();
    const body = document.body;

    spyOn(body, 'addEventListener');
    spyOn(body, 'removeEventListener');

    outsideClickDispatcher.add(overlayRef);
    expect(body.addEventListener).toHaveBeenCalledWith('click', jasmine.any(Function), true);

    overlayRef.dispose();
    expect(body.removeEventListener).toHaveBeenCalledWith('click', jasmine.any(Function), true);
  });

  it('should not add the same overlay to the stack multiple times', () => {
    const overlayOne = overlay.create();
    const overlayTwo = overlay.create();

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);
    outsideClickDispatcher.add(overlayOne);

    expect(outsideClickDispatcher._attachedOverlays).toEqual([overlayTwo, overlayOne]);

    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch the click event when click is on an element outside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = overlay.create();
    overlayRef.attach(portal);
    const button = document.createElement('button');
    document.body.appendChild(button);

    const spy = jasmine.createSpy('overlay mouse click spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    button.click();
    expect(spy).toHaveBeenCalled();

    button.remove();
    overlayRef.dispose();
  });

  it('should not dispatch the click event when click is on an element inside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = overlay.create();
    overlayRef.attach(portal);

    const spy = jasmine.createSpy('overlay mouse click event spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    overlayRef.overlayElement.click();
    expect(spy).not.toHaveBeenCalled();

    overlayRef.dispose();
  });

  it('should dispatch an event when a context menu is triggered outside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = overlay.create();
    overlayRef.attach(portal);
    const context = document.createElement('div');
    document.body.appendChild(context);

    const spy = jasmine.createSpy('overlay contextmenu spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    dispatchMouseEvent(context, 'contextmenu');
    expect(spy).toHaveBeenCalled();

    context.remove();
    overlayRef.dispose();
  });

  it('should not dispatch an event when a context menu is triggered inside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = overlay.create();
    overlayRef.attach(portal);

    const spy = jasmine.createSpy('overlay contextmenu spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    dispatchMouseEvent(overlayRef.overlayElement, 'contextmenu');
    expect(spy).not.toHaveBeenCalled();

    overlayRef.dispose();
  });

  it('should not throw an error when when closing out related components via the ' +
    'outsidePointerEvents emitter on background click', fakeAsync(() => {
      const firstOverlayRef = overlay.create();
      firstOverlayRef.attach(new ComponentPortal(TestComponent));
      const secondOverlayRef = overlay.create();
      secondOverlayRef.attach(new ComponentPortal(TestComponent));
      const thirdOverlayRef = overlay.create();
      thirdOverlayRef.attach(new ComponentPortal(TestComponent));

      const spy = jasmine.createSpy('background click handler spy').and.callFake(() => {
        // we close out both overlays from a single outside click event
        firstOverlayRef.detach();
        thirdOverlayRef.detach();
      });
      firstOverlayRef.outsidePointerEvents().subscribe(spy);
      secondOverlayRef.outsidePointerEvents().subscribe(spy);
      thirdOverlayRef.outsidePointerEvents().subscribe(spy);

      const backgroundElement = document.createElement('div');
      document.body.appendChild(backgroundElement);

      expect(() => backgroundElement.click()).not.toThrowError();

      expect(spy).toHaveBeenCalled();

      backgroundElement.remove();
      firstOverlayRef.dispose();
      secondOverlayRef.dispose();
      thirdOverlayRef.dispose();
    }
  ));
});


@Component({
  template: 'Hello'
})
class TestComponent { }


// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
@NgModule({
  exports: [TestComponent],
  declarations: [TestComponent],
  entryComponents: [TestComponent],
})
class TestComponentModule { }
