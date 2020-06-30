import {TestBed, inject} from '@angular/core/testing';
import {Component, NgModule} from '@angular/core';
import {OverlayModule, OverlayContainer, Overlay} from '../index';
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

  afterEach(inject([OverlayContainer], (overlayContainer: OverlayContainer) => {
    overlayContainer.ngOnDestroy();
  }));

  it('should track overlays in order as they are attached and detached', () => {
    const overlayOne = overlay.create();
    const overlayTwo = overlay.create();

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);

    expect(outsideClickDispatcher._attachedOverlays.length)
        .toBe(2, 'Expected both overlays to be tracked.');
    expect(outsideClickDispatcher._attachedOverlays[0])
      .toBe(overlayOne, 'Expected one to be first.');
    expect(outsideClickDispatcher._attachedOverlays[1])
      .toBe(overlayTwo, 'Expected two to be last.');

    outsideClickDispatcher.remove(overlayOne);
    outsideClickDispatcher.add(overlayOne);

    expect(outsideClickDispatcher._attachedOverlays[0])
        .toBe(overlayTwo, 'Expected two to now be first.');
    expect(outsideClickDispatcher._attachedOverlays[1])
        .toBe(overlayOne, 'Expected one to now be last.');

    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it(
    'should dispatch mouse click events to the attached overlays',
    () => {
    const overlayOne = overlay.create();
    const overlayTwo = overlay.create();
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

    button.parentNode!.removeChild(button);
    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it(
    'should dispatch mouse click events to the attached overlays even when propagation is stopped',
    () => {
    const overlayRef = overlay.create();
    const spy = jasmine.createSpy('overlay mouse click event spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    outsideClickDispatcher.add(overlayRef);

    const button = document.createElement('button');
    document.body.appendChild(button);
    button.addEventListener('click', event => event.stopPropagation());
    button.click();

    expect(spy).toHaveBeenCalled();

    button.parentNode!.removeChild(button);
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

  it(`should not dispatch click event when click on element
      included in excludeFromOutsideClick array`, () => {
    const overlayRef = overlay.create();
    const spy = jasmine.createSpy('overlay mouse click event spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    const overlayConfig = overlayRef.getConfig();
    expect(overlayConfig.excludeFromOutsideClick).toBeDefined();
    expect(overlayConfig.excludeFromOutsideClick!.length).toBe(0);

    overlayRef.attach(new ComponentPortal(TestComponent));

    const buttonShouldNotDetach = document.createElement('button');
    document.body.appendChild(buttonShouldNotDetach);
    overlayConfig.excludeFromOutsideClick!.push(buttonShouldNotDetach);
    buttonShouldNotDetach.click();

    expect(spy).not.toHaveBeenCalled();

    buttonShouldNotDetach.parentNode!.removeChild(buttonShouldNotDetach);
    overlayRef.dispose();
  });
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
