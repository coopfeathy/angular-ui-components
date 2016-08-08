import {
    addProviders,
    inject,
    async,
    TestComponentBuilder,
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import {Component, DebugElement, ViewEncapsulation} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdSlider, MdSliderModule} from './slider';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {TestGestureConfig} from './test-gesture-config';

describe('MdSlider', () => {
  let builder: TestComponentBuilder;
  let gestureConfig: TestGestureConfig;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSliderModule],
      declarations: [
        StandardSlider,
        DisabledSlider,
        SliderWithMinAndMax,
        SliderWithValue,
        SliderWithStep,
      ],
    });

    addProviders([
      {provide: HAMMER_GESTURE_CONFIG, useFactory: () => {
        gestureConfig = new TestGestureConfig();
        return gestureConfig;
      }}
    ]);

    TestBed.compileComponents();
  }));

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let trackFillElement: HTMLElement;
    let trackFillDimensions: ClientRect;
    let sliderTrackElement: HTMLElement;
    let sliderDimensions: ClientRect;
    let thumbElement: HTMLElement;
    let thumbDimensions: ClientRect;

    beforeEach(async(() => {
      builder.createAsync(StandardSlider).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.componentInstance;

        trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
        trackFillDimensions = trackFillElement.getBoundingClientRect();
        sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
        sliderDimensions = sliderTrackElement.getBoundingClientRect();

        thumbElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-thumb-position');
        thumbDimensions = thumbElement.getBoundingClientRect();
      });
    }));

    it('should set the default values', () => {
      expect(sliderInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the value on a click', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchClickEvent(sliderTrackElement, 0.19);
      // The expected value is 19 from: percentage * difference of max and min.
      expect(sliderInstance.value).toBe(19);
    });

    it('should update the value on a slide', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.89, gestureConfig);
      // The expected value is 89 from: percentage * difference of max and min.
      expect(sliderInstance.value).toBe(89);
    });

    it('should set the value as min when sliding before the track', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, -1.33, gestureConfig);
      expect(sliderInstance.value).toBe(0);
    });

    it('should set the value as max when sliding past the track', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 1.75, gestureConfig);
      expect(sliderInstance.value).toBe(100);
    });

    it('should update the track fill on click', () => {
      expect(trackFillDimensions.width).toBe(0);
      dispatchClickEvent(sliderTrackElement, 0.39);

      trackFillDimensions = trackFillElement.getBoundingClientRect();
      thumbDimensions = thumbElement.getBoundingClientRect();

      // The thumb and track fill positions are relative to the viewport, so to get the thumb's
      // offset relative to the track, subtract the offset on the track fill.
      let thumbPosition = thumbDimensions.left - trackFillDimensions.left;
      // The track fill width should be equal to the thumb's position.
      expect(Math.round(trackFillDimensions.width)).toBe(Math.round(thumbPosition));
    });

    it('should update the thumb position on click', () => {
      expect(thumbDimensions.left).toBe(sliderDimensions.left);
      // 50% is used here because the click event that is dispatched truncates the position and so
      // a value had to be used that would not be truncated.
      dispatchClickEvent(sliderTrackElement, 0.5);

      thumbDimensions = thumbElement.getBoundingClientRect();
      // The thumb position should be at 50% of the slider's width + the offset of the slider.
      // Both the thumb and the slider are affected by this offset.
      expect(thumbDimensions.left).toBe(sliderDimensions.width * 0.5 + sliderDimensions.left);
    });

    it('should update the track fill on slide', () => {
      expect(trackFillDimensions.width).toBe(0);
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.86, gestureConfig);

      trackFillDimensions = trackFillElement.getBoundingClientRect();
      thumbDimensions = thumbElement.getBoundingClientRect();

      // The thumb and track fill positions are relative to the viewport, so to get the thumb's
      // offset relative to the track, subtract the offset on the track fill.
      let thumbPosition = thumbDimensions.left - trackFillDimensions.left;
      // The track fill width should be equal to the thumb's position.
      expect(Math.round(trackFillDimensions.width)).toBe(Math.round(thumbPosition));
    });

    it('should update the thumb position on slide', () => {
      expect(thumbDimensions.left).toBe(sliderDimensions.left);
      // The slide event also truncates the position passed in, so 50% is used here as well to
      // ensure the ability to calculate the expected position.
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.5, gestureConfig);

      thumbDimensions = thumbElement.getBoundingClientRect();
      expect(thumbDimensions.left).toBe(sliderDimensions.width * 0.5 + sliderDimensions.left);
    });

    it('should add the md-slider-active class on click', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-active');

      dispatchClickEvent(sliderNativeElement, 0.23);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-active');
    });

    it('should remove the md-slider-active class on blur', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');

      dispatchClickEvent(sliderNativeElement, 0.95);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-active');

      // Call the `onBlur` handler directly because we cannot simulate a focus event in unit tests.
      sliderInstance.onBlur();
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-active');
    });

    it('should add and remove the md-slider-sliding class when sliding', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-sliding');

      dispatchSlideStartEvent(sliderNativeElement, 0, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-sliding');

      dispatchSlideEndEvent(sliderNativeElement, 0.34, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-sliding');
    });
  });

  describe('disabled slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;

    beforeEach(async(() => {
      builder.createAsync(DisabledSlider).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.componentInstance;
      });
    }));

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTruthy();
    });

    it('should not change the value on click when disabled', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchClickEvent(sliderNativeElement, 0.63);
      expect(sliderInstance.value).toBe(0);
    });

    it('should not change the value on slide when disabled', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchSlideEvent(sliderNativeElement, sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(0);
    });

    it('should not add the md-slider-active class on click when disabled', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-active');

      dispatchClickEvent(sliderNativeElement, 0.43);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-active');
    });

    it('should not add the md-slider-sliding class on slide when disabled', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-sliding');

      dispatchSlideStartEvent(sliderNativeElement, 0.46, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-sliding');
    });
  });

  describe('slider with set min and max', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let sliderDimensions: ClientRect;
    let trackFillElement: HTMLElement;
    let thumbElement: HTMLElement;

    beforeEach(async(() => {
      builder.createAsync(SliderWithMinAndMax).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
        sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
        sliderDimensions = sliderTrackElement.getBoundingClientRect();
        trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
        thumbElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-thumb-position');
      });
    }));

    it('should set the default values from the attributes', () => {
      expect(sliderInstance.value).toBe(4);
      expect(sliderInstance.min).toBe(4);
      expect(sliderInstance.max).toBe(6);
    });

    it('should set the correct value on click', () => {
      dispatchClickEvent(sliderTrackElement, 0.09);
      // Computed by multiplying the difference between the min and the max by the percentage from
      // the click and adding that to the minimum.
      let value = Math.round(4 + (0.09 * (6 - 4)));
      expect(sliderInstance.value).toBe(value);
    });

    it('should set the correct value on slide', () => {
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.62, gestureConfig);
      // Computed by multiplying the difference between the min and the max by the percentage from
      // the click and adding that to the minimum.
      let value = Math.round(4 + (0.62 * (6 - 4)));
      expect(sliderInstance.value).toBe(value);
    });

    it('should snap the thumb and fill to the nearest value on click', () => {
      dispatchClickEvent(sliderTrackElement, 0.68);
      fixture.detectChanges();

      let trackFillDimensions = trackFillElement.getBoundingClientRect();
      let thumbDimensions = thumbElement.getBoundingClientRect();
      let thumbPosition = thumbDimensions.left - trackFillDimensions.left;

      // The closest snap is halfway on the slider.
      expect(thumbDimensions.left).toBe(sliderDimensions.width * 0.5 + sliderDimensions.left);
      expect(Math.round(trackFillDimensions.width)).toBe(Math.round(thumbPosition));
    });

    it('should snap the thumb and fill to the nearest value on slide', () => {
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.74, gestureConfig);
      fixture.detectChanges();

      dispatchSlideEndEvent(sliderNativeElement, 0.74, gestureConfig);
      fixture.detectChanges();

      let trackFillDimensions = trackFillElement.getBoundingClientRect();
      let thumbDimensions = thumbElement.getBoundingClientRect();
      let thumbPosition = thumbDimensions.left - trackFillDimensions.left;

      // The closest snap is at the halfway point on the slider.
      expect(thumbDimensions.left).toBe(sliderDimensions.left + sliderDimensions.width * 0.5);
      expect(Math.round(trackFillDimensions.width)).toBe(Math.round(thumbPosition));

    });
  });

  describe('slider with set value', () => {
    let fixture: ComponentFixture<SliderWithValue>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;

    beforeEach(async(() => {
      builder.createAsync(SliderWithValue).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
        sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      });
    }));

    it('should set the default value from the attribute', () => {
      expect(sliderInstance.value).toBe(26);
    });

    it('should set the correct value on click', () => {
      dispatchClickEvent(sliderTrackElement, 0.92);
      // On a slider with default max and min the value should be approximately equal to the
      // percentage clicked. This should be the case regardless of what the original set value was.
      expect(sliderInstance.value).toBe(92);
    });

    it('should set the correct value on slide', () => {
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.32, gestureConfig);
      expect(sliderInstance.value).toBe(32);
    });
  });

  describe('slider with set step', () => {
    let fixture: ComponentFixture<SliderWithStep>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let sliderDimensions: ClientRect;
    let trackFillElement: HTMLElement;
    let thumbElement: HTMLElement;

    beforeEach(async(() => {
      builder.createAsync(SliderWithStep).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
        sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
        sliderDimensions = sliderTrackElement.getBoundingClientRect();
        trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
        thumbElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-thumb-position');
      });
    }));

    it('should set the correct step value on click', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchClickEvent(sliderTrackElement, 0.13);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(25);
    });

    it('should snap the thumb and fill to a step on click', () => {
      dispatchClickEvent(sliderNativeElement, 0.66);
      fixture.detectChanges();

      let trackFillDimensions = trackFillElement.getBoundingClientRect();
      let thumbDimensions = thumbElement.getBoundingClientRect();
      let thumbPosition = thumbDimensions.left - trackFillDimensions.left;

      // The closest step is at 75% of the slider.
      expect(thumbDimensions.left).toBe(sliderDimensions.width * 0.75 + sliderDimensions.left);
      expect(Math.round(trackFillDimensions.width)).toBe(Math.round(thumbPosition));
    });

    it('should set the correct step value on slide', () => {
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.07, gestureConfig);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(0);
    });

    it('should snap the thumb and fill to a step on slide', () => {
      dispatchSlideEvent(sliderTrackElement, sliderNativeElement, 0, 0.88, gestureConfig);
      fixture.detectChanges();

      dispatchSlideEndEvent(sliderNativeElement, 0.88, gestureConfig);
      fixture.detectChanges();

      let trackFillDimensions = trackFillElement.getBoundingClientRect();
      let thumbDimensions = thumbElement.getBoundingClientRect();
      let thumbPosition = thumbDimensions.left - trackFillDimensions.left;

      // The closest snap is at the end of the slider.
      expect(thumbDimensions.left).toBe(sliderDimensions.width + sliderDimensions.left);
      expect(Math.round(trackFillDimensions.width)).toBe(Math.round(thumbPosition));
    });
  });
});

// The transition has to be removed in order to test the updated positions without setTimeout.
@Component({
  template: `<md-slider></md-slider>`,
  styles: [`
    .md-slider-track-fill, .md-slider-thumb-position {
        transition: none !important;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
class StandardSlider { }

@Component({
  template: `<md-slider disabled></md-slider>`
})
class DisabledSlider { }

@Component({
  template: `<md-slider min="4" max="6"></md-slider>`,
  styles: [`
    .md-slider-track-fill, .md-slider-thumb-position {
        transition: none !important;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
class SliderWithMinAndMax { }

@Component({
  template: `<md-slider value="26"></md-slider>`
})
class SliderWithValue { }

@Component({
  template: `<md-slider step="25"></md-slider>`,
  styles: [`
    .md-slider-track-fill, .md-slider-thumb-position {
        transition: none !important;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
class SliderWithStep { }

/**
 * Dispatches a click event from an element.
 * Note: The mouse event truncates the position for the click.
 * @param element The element from which the event will be dispatched.
 * @param percentage The percentage of the slider where the click should occur. Used to find the
 * physical location of the click.
 */
function dispatchClickEvent(element: HTMLElement, percentage: number): void {
  let dimensions = element.getBoundingClientRect();
  let y = dimensions.top;
  let x = dimensions.left + (dimensions.width * percentage);

  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'click', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
  element.dispatchEvent(event);
}

/**
 * Dispatches a slide event from an element.
 * @param trackElement The track element from which the event location will be calculated.
 * @param containerElement The container element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the slide will begin.
 * @param endPercent The percentage of the slider where the slide will end.
 * @param gestureConfig The gesture config for the test to handle emitting the slide events.
 */
function dispatchSlideEvent(trackElement: HTMLElement, containerElement: HTMLElement,
                            startPercent: number, endPercent: number,
                            gestureConfig: TestGestureConfig): void {
  let dimensions = trackElement.getBoundingClientRect();
  let startX = dimensions.left + (dimensions.width * startPercent);
  let endX = dimensions.left + (dimensions.width * endPercent);

  gestureConfig.emitEventForElement('slidestart', containerElement, {
    // The actual event has a center with an x value that the slide listener is looking for.
    center: { x: startX },
    // The event needs a source event with a prevent default so we fake one.
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });

  gestureConfig.emitEventForElement('slide', containerElement, {
    center: { x: endX },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a slidestart event from an element.
 * @param element The element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the slide will begin.
 * @param gestureConfig The gesture config for the test to handle emitting the slide events.
 */
function dispatchSlideStartEvent(element: HTMLElement, startPercent: number,
                                 gestureConfig: TestGestureConfig): void {
  let dimensions = element.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * startPercent);

  gestureConfig.emitEventForElement('slidestart', element, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a slideend event from an element.
 * @param element The element from which the event will be dispatched.
 * @param endPercent The percentage of the slider where the slide will end.
 * @param gestureConfig The gesture config for the test to handle emitting the slide events.
 */
function dispatchSlideEndEvent(element: HTMLElement, endPercent: number,
                               gestureConfig: TestGestureConfig): void {
  let dimensions = element.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * endPercent);

  gestureConfig.emitEventForElement('slideend', element, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}
