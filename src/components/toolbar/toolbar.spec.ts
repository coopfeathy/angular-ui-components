import {Component} from '@angular/core';
import {
  inject,
  TestComponentBuilder,
  TestBed,
  async,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MdToolbarModule} from './toolbar';

describe('MdToolbar', () => {
  let builder: TestComponentBuilder;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdToolbarModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should apply class based on color attribute', (done: () => void) => {
    return builder.createAsync(TestApp).then((fixture) => {
      let testComponent = fixture.debugElement.componentInstance;
      let toolbarDebugElement = fixture.debugElement.query(By.css('md-toolbar'));

      testComponent.toolbarColor = 'primary';
      fixture.detectChanges();

      expect(toolbarDebugElement.nativeElement.classList.contains('md-primary')).toBe(true);

      testComponent.toolbarColor = 'accent';
      fixture.detectChanges();

      expect(toolbarDebugElement.nativeElement.classList.contains('md-primary')).toBe(false);
      expect(toolbarDebugElement.nativeElement.classList.contains('md-accent')).toBe(true);

      testComponent.toolbarColor = 'warn';
      fixture.detectChanges();

      expect(toolbarDebugElement.nativeElement.classList.contains('md-accent')).toBe(false);
      expect(toolbarDebugElement.nativeElement.classList.contains('md-warn')).toBe(true);

      done();
    });
  });

});

@Component({
  selector: 'test-app',
  template: `
    <md-toolbar [color]="toolbarColor">
      <span>Test Toolbar</span>
    </md-toolbar>`
})
class TestApp {
  toolbarColor: string;
}
