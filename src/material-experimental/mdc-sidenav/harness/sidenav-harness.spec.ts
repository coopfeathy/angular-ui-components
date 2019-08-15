import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSidenavModule as MatMdcSidenavModule} from '../index';
import {MatSidenavHarness} from './sidenav-harness';
import {MatSidenavHarness as MatMdcSidenavHarness} from './mdc-sidenav-harness';

let fixture: ComponentFixture<SidenavHarnessTest>;
let loader: HarnessLoader;
let harness: typeof MatSidenavHarness;

describe('MatSidenavHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatSidenavModule, NoopAnimationsModule],
        declarations: [SidenavHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(SidenavHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = MatSidenavHarness;
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMdcSidenavModule, NoopAnimationsModule],
        declarations: [SidenavHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(SidenavHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      // Public APIs are the same as MatSidenavHarness, but cast
      // is necessary because of different private fields.
      harness = MatMdcSidenavHarness as any;
    });

    // TODO: enable after MDC sidenav is implemented
    // runTests();
  });
});

/** Shared tests to run on both the original and MDC-based sidenav. */
function runTests() {
  it('should load all sidenav harnesses', async () => {
    const sidenavs = await loader.getAllHarnesses(harness);
    expect(sidenavs.length).toBe(3);
  });

  it('should be able to get whether the sidenav is open', async () => {
    const sidenavs = await loader.getAllHarnesses(harness);

    expect(await sidenavs[0].isOpen()).toBe(false);
    expect(await sidenavs[1].isOpen()).toBe(false);
    expect(await sidenavs[2].isOpen()).toBe(true);

    fixture.componentInstance.threeOpened = false;
    fixture.detectChanges();

    expect(await sidenavs[0].isOpen()).toBe(false);
    expect(await sidenavs[1].isOpen()).toBe(false);
    expect(await sidenavs[2].isOpen()).toBe(false);
  });

  it('should be able to get the position of a sidenav', async () => {
    const sidenavs = await loader.getAllHarnesses(harness);

    expect(await sidenavs[0].getPosition()).toBe('start');
    expect(await sidenavs[1].getPosition()).toBe('end');
    expect(await sidenavs[2].getPosition()).toBe('start');
  });

  it('should be able to get the mode of a sidenav', async () => {
    const sidenavs = await loader.getAllHarnesses(harness);

    expect(await sidenavs[0].getMode()).toBe('over');
    expect(await sidenavs[1].getMode()).toBe('side');
    expect(await sidenavs[2].getMode()).toBe('push');
  });

  it('should be able to get whether a sidenav is fixed in the viewport', async () => {
    const sidenavs = await loader.getAllHarnesses(harness);

    expect(await sidenavs[0].isFixedInViewport()).toBe(false);
    expect(await sidenavs[1].isFixedInViewport()).toBe(false);
    expect(await sidenavs[2].isFixedInViewport()).toBe(true);
  });
}

@Component({
  template: `
    <mat-sidenav-container>
      <mat-sidenav id="one" [opened]="oneOpened" position="start">One</mat-sidenav>
      <mat-sidenav id="two" mode="side" position="end">Two</mat-sidenav>
      <mat-sidenav-content>Content</mat-sidenav-content>
    </mat-sidenav-container>

    <mat-sidenav-container>
      <mat-sidenav id="three" mode="push" [opened]="threeOpened" fixedInViewport>Three</mat-sidenav>
      <mat-sidenav-content>Content</mat-sidenav-content>
    </mat-sidenav-container>
  `
})
class SidenavHarnessTest {
  threeOpened = true;
}

