import "@testing-library/jest-dom";

class ResizeObserver {
    cb: any;

    constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
    }
    observe() {
        this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }]);
    }
    unobserve() { }
    disconnect() { }
}

// @ts-ignore
global.ResizeObserver = ResizeObserver;

global.DOMRect = {
    // @ts-ignore
    fromRect: () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0
    })
};
