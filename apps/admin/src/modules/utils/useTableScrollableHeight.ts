import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useMeasure} from '@uidotdev/usehooks';

const tableHeaderSelector = '.ant-table-header';
const paginationSelector = '.ant-table-pagination';

// Used until the header and the pagination are rendered and can be measured.
const fallbackHeaderHeight = 32;
const fallbackPaginationHeight = 48;

const getOuterHeight = (element: Element): number => {
    const {marginTop, marginBottom} = window.getComputedStyle(element);

    return element.getBoundingClientRect().height + parseFloat(marginTop) + parseFloat(marginBottom);
};

/**
 * Computes the `scroll.y` to give to a `KitTable` so that its body fills the container without
 * pushing the header and the pagination out of it.
 *
 * Both are measured instead of hardcoded: their height depends on the line size, on the pagination
 * options and on header labels wrapping onto several lines — a hardcoded value silently clips the
 * pagination as soon as it is off.
 */
export const useTableScrollableHeight = (withPagination: boolean) => {
    const [measureRef, {height}] = useMeasure();
    const containerElement = useRef<HTMLElement | null>(null);
    const [reservedHeight, setReservedHeight] = useState(
        fallbackHeaderHeight + (withPagination ? fallbackPaginationHeight : 0),
    );

    const containerRef = useCallback(
        (node: HTMLElement | null) => {
            containerElement.current = node;
            measureRef(node);
        },
        [measureRef],
    );

    useLayoutEffect(() => {
        const container = containerElement.current;
        if (!container) {
            return;
        }

        const observedElements = new Set<Element>();

        const measureReservedHeight = () => {
            const header = container.querySelector(tableHeaderSelector);
            const pagination = container.querySelector(paginationSelector);

            setReservedHeight(
                (header ? getOuterHeight(header) : fallbackHeaderHeight) +
                    (pagination ? getOuterHeight(pagination) : 0),
            );
        };

        // The header and the pagination are rendered by antd inside the container, so they only exist
        // after the first paint, and they resize on their own (label wrapping, pagination options).
        const resizeObserver = new ResizeObserver(measureReservedHeight);
        const observeReservedElements = () => {
            for (const selector of [tableHeaderSelector, paginationSelector]) {
                const element = container.querySelector(selector);
                if (element && !observedElements.has(element)) {
                    observedElements.add(element);
                    resizeObserver.observe(element);
                }
            }
            measureReservedHeight();
        };

        const mutationObserver = new MutationObserver(observeReservedElements);
        mutationObserver.observe(container, {childList: true, subtree: true});
        observeReservedElements();

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    const scrollHeight = useMemo(
        () => (height === null ? '100vh' : `${Math.max(0, Math.round(height - reservedHeight))}px`),
        [height, reservedHeight],
    );

    return {containerRef, scrollHeight};
};
