export declare const MAT_DRAWER_DEFAULT_AUTOSIZE: InjectionToken<boolean>;

export declare function MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY(): boolean;

export declare class MatDrawer implements AfterContentInit, AfterContentChecked, OnDestroy {
    _animationEnd: Subject<AnimationEvent>;
    _animationStarted: Subject<AnimationEvent>;
    _animationState: 'open-instant' | 'open' | 'void';
    readonly _closedStream: Observable<void>;
    _container?: MatDrawerContainer | undefined;
    readonly _isFocusTrapEnabled: boolean;
    readonly _modeChanged: Subject<void>;
    readonly _openedStream: Observable<void>;
    readonly _width: number;
    autoFocus: boolean;
    readonly closedStart: Observable<void>;
    disableClose: boolean;
    mode: MatDrawerMode;
    onPositionChanged: EventEmitter<void>;
    opened: boolean;
    readonly openedChange: EventEmitter<boolean>;
    readonly openedStart: Observable<void>;
    position: 'start' | 'end';
    constructor(_elementRef: ElementRef<HTMLElement>, _focusTrapFactory: FocusTrapFactory, _focusMonitor: FocusMonitor, _platform: Platform, _ngZone: NgZone, _doc: any,
    _container?: MatDrawerContainer | undefined);
    _animationDoneListener(event: AnimationEvent): void;
    _animationStartListener(event: AnimationEvent): void;
    close(): Promise<MatDrawerToggleResult>;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    open(openedVia?: FocusOrigin): Promise<MatDrawerToggleResult>;
    toggle(isOpen?: boolean, openedVia?: FocusOrigin): Promise<MatDrawerToggleResult>;
    static ngAcceptInputType_autoFocus: boolean | string;
    static ngAcceptInputType_disableClose: boolean | string;
    static ngAcceptInputType_opened: boolean | string;
}

export declare const matDrawerAnimations: {
    readonly transformDrawer: AnimationTriggerMetadata;
};

export declare class MatDrawerContainer implements AfterContentInit, DoCheck, OnDestroy {
    _allDrawers: QueryList<MatDrawer>;
    _backdropOverride: boolean | null;
    _content: MatDrawerContent;
    readonly _contentMarginChanges: Subject<{
        left: number | null;
        right: number | null;
    }>;
    _contentMargins: {
        left: number | null;
        right: number | null;
    };
    _drawers: QueryList<MatDrawer>;
    _userContent: MatDrawerContent;
    autosize: boolean;
    readonly backdropClick: EventEmitter<void>;
    readonly end: MatDrawer | null;
    hasBackdrop: any;
    readonly scrollable: CdkScrollable;
    readonly start: MatDrawer | null;
    constructor(_dir: Directionality, _element: ElementRef<HTMLElement>, _ngZone: NgZone, _changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, defaultAutosize?: boolean, _animationMode?: string | undefined);
    _closeModalDrawer(): void;
    _isShowingBackdrop(): boolean;
    _onBackdropClicked(): void;
    close(): void;
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    open(): void;
    updateContentMargins(): void;
    static ngAcceptInputType_autosize: boolean | string;
    static ngAcceptInputType_hasBackdrop: boolean | string;
}

export declare class MatDrawerContent extends CdkScrollable implements AfterContentInit {
    _container: MatDrawerContainer;
    constructor(_changeDetectorRef: ChangeDetectorRef, _container: MatDrawerContainer, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone);
    ngAfterContentInit(): void;
}

export declare type MatDrawerMode = 'over' | 'push' | 'side';

export declare type MatDrawerToggleResult = 'open' | 'close';

export declare class MatSidenav extends MatDrawer {
    fixedBottomGap: number;
    fixedInViewport: boolean;
    fixedTopGap: number;
    static ngAcceptInputType_autoFocus: boolean | string;
    static ngAcceptInputType_disableClose: boolean | string;
    static ngAcceptInputType_fixedBottomGap: number | string;
    static ngAcceptInputType_fixedInViewport: boolean | string;
    static ngAcceptInputType_fixedTopGap: number | string;
    static ngAcceptInputType_opened: boolean | string;
}

export declare class MatSidenavContainer extends MatDrawerContainer {
    _allDrawers: QueryList<MatSidenav>;
    _content: MatSidenavContent;
    static ngAcceptInputType_autosize: boolean | string;
    static ngAcceptInputType_hasBackdrop: boolean | string;
}

export declare class MatSidenavContent extends MatDrawerContent {
    constructor(changeDetectorRef: ChangeDetectorRef, container: MatSidenavContainer, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone);
}

export declare class MatSidenavModule {
}

export declare function throwMatDuplicatedDrawerError(position: string): void;
