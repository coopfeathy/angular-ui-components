import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {CdkMenuBar} from './menu-bar';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';
import {By} from '@angular/platform-browser';

describe('MenuBar', () => {
  describe('as radio group', () => {
    let fixture: ComponentFixture<MenuBarRadioGroup>;
    let menuBar: CdkMenuBar;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarRadioGroup);
      fixture.detectChanges();

      menuBar = fixture.debugElement.query(By.directive(CdkMenuBar)).injector.get(CdkMenuBar);

      menuItems = menuBar._allItems.toArray();
    }));

    it('should toggle menuitemradio items', () => {
      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();

      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeFalse();
      expect(menuItems[1].checked).toBeTrue();
    });
  });

  describe('as checkbox group', () => {
    let fixture: ComponentFixture<MenuBarCheckboxGroup>;
    let menuBar: CdkMenuBar;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarCheckboxGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarCheckboxGroup);

      menuBar = fixture.debugElement.query(By.directive(CdkMenuBar)).injector.get(CdkMenuBar);
      fixture.detectChanges();

      menuItems = menuBar._allItems.toArray();
    }));

    it('should toggle menuitemcheckbox', () => {
      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();

      menuItems[1].trigger();
      expect(menuItems[0].checked).toBeTrue(); // checkbox should not change

      menuItems[0].trigger();

      expect(menuItems[0].checked).toBeFalse();
      expect(menuItems[1].checked).toBeTrue();
    });
  });

  describe('checkbox change events', () => {
    let fixture: ComponentFixture<MenuBarCheckboxGroup>;
    let menu: CdkMenuBar;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarCheckboxGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarCheckboxGroup);

      menu = fixture.debugElement.query(By.directive(CdkMenuBar)).injector.get(CdkMenuBar);
      fixture.detectChanges();

      menuItems = menu._allItems.toArray();
    }));

    it('should emit on click', () => {
      const spy = jasmine.createSpy('cdkMenu change spy');
      fixture.debugElement
        .query(By.directive(CdkMenuBar))
        .injector.get(CdkMenuBar)
        .change.subscribe(spy);

      menuItems[0].trigger();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(menuItems[0]);
    });
  });

  describe('radiogroup change events', () => {
    let fixture: ComponentFixture<MenuBarRadioGroup>;
    let menu: CdkMenuBar;
    let menuItems: Array<CdkMenuItem>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarRadioGroup);

      menu = fixture.debugElement.query(By.directive(CdkMenuBar)).injector.get(CdkMenuBar);
      fixture.detectChanges();

      menuItems = menu._allItems.toArray();
    }));

    it('should emit on click', () => {
      const spy = jasmine.createSpy('cdkMenu change spy');
      fixture.debugElement
        .query(By.directive(CdkMenuBar))
        .injector.get(CdkMenuBar)
        .change.subscribe(spy);

      menuItems[0].trigger();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(menuItems[0]);
    });
  });
});

@Component({
  selector: 'menubar-as-radio-group',
  template: `
    <ul cdkMenuBar>
      <li role="none">
        <button checked="true" role="menuitemradio" cdkMenuItem>
          first
        </button>
      </li>
      <li role="none">
        <button role="menuitemradio" cdkMenuItem>
          second
        </button>
      </li>
    </ul>
  `,
})
class MenuBarRadioGroup {}

@Component({
  selector: 'menubar-as-checkbox-group',
  template: `
    <ul cdkMenuBar>
      <li role="none">
        <button checked="true" role="menuitemcheckbox" cdkMenuItem>
          first
        </button>
      </li>
      <li role="none">
        <button role="menuitemcheckbox" cdkMenuItem>
          second
        </button>
      </li>
    </ul>
  `,
})
class MenuBarCheckboxGroup {}
