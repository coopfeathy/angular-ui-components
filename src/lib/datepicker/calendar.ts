/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Optional,
  Output,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW
} from '../core/keyboard/keycodes';
import {DateAdapter} from '../core/datetime/index';
import {MdDatepickerIntl} from './datepicker-intl';
import {createMissingDateImplError} from './datepicker-errors';
import {MD_DATE_FORMATS, MdDateFormats} from '../core/datetime/date-formats';
import {MATERIAL_COMPATIBILITY_MODE} from '../core';
import {first} from '../core/rxjs/index';
import {Subscription} from 'rxjs/Subscription';


/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-calendar, mat-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  host: {
    'class': 'mat-calendar',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCalendar<D> implements AfterContentInit, OnDestroy {
  private _intlChanges: Subscription;

  /** A date representing the period (month or year) to start the calendar in. */
  @Input() startAt: D;

  /** Whether the calendar should be started in month or year view. */
  @Input() startView: 'month' | 'year' = 'month';

  /** The currently selected date. */
  @Input() selected: D | null;

  /** The minimum selectable date. */
  @Input() minDate: D | null;

  /** The maximum selectable date. */
  @Input() maxDate: D | null;

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: D) => boolean;

  /** Emits when the currently selected date changes. */
  @Output() selectedChange = new EventEmitter<D>();

  /** Date filter for the month and year views. */
  _dateFilterForViews = (date: D) => {
    return !!date &&
        (!this.dateFilter || this.dateFilter(date)) &&
        (!this.minDate || this._dateAdapter.compareDate(date, this.minDate) >= 0) &&
        (!this.maxDate || this._dateAdapter.compareDate(date, this.maxDate) <= 0);
  }

  /**
   * The current active date. This determines which time period is shown and which date is
   * highlighted when using keyboard navigation.
   */
  get _activeDate(): D { return this._clampedActiveDate; }
  set _activeDate(value: D) {
    this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
  }
  private _clampedActiveDate: D;

  /** Whether the calendar is in month view. */
  _monthView: boolean;

  /** The label for the current calendar view. */
  get _periodButtonText(): string {
    return this._monthView ?
        this._dateAdapter.format(this._activeDate, this._dateFormats.display.monthYearLabel)
            .toLocaleUpperCase() :
        this._dateAdapter.getYearName(this._activeDate);
  }

  get _periodButtonLabel(): string {
    return this._monthView ? this._intl.switchToYearViewLabel : this._intl.switchToMonthViewLabel;
  }

  /** The label for the the previous button. */
  get _prevButtonLabel(): string {
    return this._monthView ? this._intl.prevMonthLabel : this._intl.prevYearLabel;
  }

  /** The label for the the next button. */
  get _nextButtonLabel(): string {
    return this._monthView ? this._intl.nextMonthLabel : this._intl.nextYearLabel;
  }

  constructor(private _elementRef: ElementRef,
              private _intl: MdDatepickerIntl,
              private _ngZone: NgZone,
              @Optional() @Inject(MATERIAL_COMPATIBILITY_MODE) public _isCompatibilityMode: boolean,
              @Optional() private _dateAdapter: DateAdapter<D>,
              @Optional() @Inject(MD_DATE_FORMATS) private _dateFormats: MdDateFormats,
              changeDetectorRef: ChangeDetectorRef) {

    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }

    if (!this._dateFormats) {
      throw createMissingDateImplError('MD_DATE_FORMATS');
    }

    this._intlChanges = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());
  }

  ngAfterContentInit() {
    this._activeDate = this.startAt || this._dateAdapter.today();
    this._focusActiveCell();
    this._monthView = this.startView != 'year';
  }

  ngOnDestroy() {
    this._intlChanges.unsubscribe();
  }

  /** Handles date selection in the month view. */
  _dateSelected(date: D): void {
    if (!this._dateAdapter.sameDate(date, this.selected)) {
      this.selectedChange.emit(date);
    }
  }

  /** Handles month selection in the year view. */
  _monthSelected(month: D): void {
    this._activeDate = month;
    this._monthView = true;
  }

  /** Handles user clicks on the period label. */
  _currentPeriodClicked(): void {
    this._monthView = !this._monthView;
  }

  /** Handles user clicks on the previous button. */
  _previousClicked(): void {
    this._activeDate = this._monthView ?
        this._dateAdapter.addCalendarMonths(this._activeDate, -1) :
        this._dateAdapter.addCalendarYears(this._activeDate, -1);
  }

  /** Handles user clicks on the next button. */
  _nextClicked(): void {
    this._activeDate = this._monthView ?
        this._dateAdapter.addCalendarMonths(this._activeDate, 1) :
        this._dateAdapter.addCalendarYears(this._activeDate, 1);
  }

  /** Whether the previous period button is enabled. */
  _previousEnabled(): boolean {
    if (!this.minDate) {
      return true;
    }
    return !this.minDate || !this._isSameView(this._activeDate, this.minDate);
  }

  /** Whether the next period button is enabled. */
  _nextEnabled(): boolean {
    return !this.maxDate || !this._isSameView(this._activeDate, this.maxDate);
  }

  /** Handles keydown events on the calendar body. */
  _handleCalendarBodyKeydown(event: KeyboardEvent): void {
    // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
    // disabled ones from being selected. This may not be ideal, we should look into whether
    // navigation should skip over disabled dates, and if so, how to implement that efficiently.
    if (this._monthView) {
      this._handleCalendarBodyKeydownInMonthView(event);
    } else {
      this._handleCalendarBodyKeydownInYearView(event);
    }
  }

  /** Focuses the active cell after the microtask queue is empty. */
  _focusActiveCell() {
    this._ngZone.runOutsideAngular(() => first.call(this._ngZone.onStable).subscribe(() => {
      this._elementRef.nativeElement.querySelector('.mat-calendar-body-active').focus();
    }));
  }

  /** Whether the two dates represent the same view in the current view mode (month or year). */
  private _isSameView(date1: D, date2: D): boolean {
    return this._monthView ?
        this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
        this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2) :
        this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
  }

  /** Handles keydown events on the calendar body when calendar is in month view. */
  private _handleCalendarBodyKeydownInMonthView(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 1);
        break;
      case UP_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -7);
        break;
      case DOWN_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 7);
        break;
      case HOME:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate,
            1 - this._dateAdapter.getDate(this._activeDate));
        break;
      case END:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate,
            (this._dateAdapter.getNumDaysInMonth(this._activeDate) -
             this._dateAdapter.getDate(this._activeDate)));
        break;
      case PAGE_UP:
        this._activeDate = event.altKey ?
            this._dateAdapter.addCalendarYears(this._activeDate, -1) :
            this._dateAdapter.addCalendarMonths(this._activeDate, -1);
        break;
      case PAGE_DOWN:
        this._activeDate = event.altKey ?
            this._dateAdapter.addCalendarYears(this._activeDate, 1) :
            this._dateAdapter.addCalendarMonths(this._activeDate, 1);
        break;
      case ENTER:
        if (this._dateFilterForViews(this._activeDate)) {
          this._dateSelected(this._activeDate);
          // Prevent unexpected default actions such as form submission.
          event.preventDefault();
        }
        return;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    this._focusActiveCell();
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /** Handles keydown events on the calendar body when calendar is in year view. */
  private _handleCalendarBodyKeydownInYearView(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 1);
        break;
      case UP_ARROW:
        this._activeDate = this._prevMonthInSameCol(this._activeDate);
        break;
      case DOWN_ARROW:
        this._activeDate = this._nextMonthInSameCol(this._activeDate);
        break;
      case HOME:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate,
            -this._dateAdapter.getMonth(this._activeDate));
        break;
      case END:
        this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate,
            11 - this._dateAdapter.getMonth(this._activeDate));
        break;
      case PAGE_UP:
        this._activeDate =
            this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -10 : -1);
        break;
      case PAGE_DOWN:
        this._activeDate =
            this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? 10 : 1);
        break;
      case ENTER:
        this._monthSelected(this._activeDate);
        break;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    this._focusActiveCell();
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /**
   * Determine the date for the month that comes before the given month in the same column in the
   * calendar table.
   */
  private _prevMonthInSameCol(date: D): D {
    // Determine how many months to jump forward given that there are 2 empty slots at the beginning
    // of each year.
    let increment = this._dateAdapter.getMonth(date) <= 4 ? -5 :
        (this._dateAdapter.getMonth(date) >= 7 ? -7 : -12);
    return this._dateAdapter.addCalendarMonths(date, increment);
  }

  /**
   * Determine the date for the month that comes after the given month in the same column in the
   * calendar table.
   */
  private _nextMonthInSameCol(date: D): D {
    // Determine how many months to jump forward given that there are 2 empty slots at the beginning
    // of each year.
    let increment = this._dateAdapter.getMonth(date) <= 4 ? 7 :
        (this._dateAdapter.getMonth(date) >= 7 ? 5 : 12);
    return this._dateAdapter.addCalendarMonths(date, increment);
  }
}
