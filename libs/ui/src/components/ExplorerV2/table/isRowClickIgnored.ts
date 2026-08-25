import {NO_ROW_CLICK_CLASSNAME} from '../_constants';

/**
 * Whether a click that reached the row must NOT trigger its onClick action, because it landed in a
 * cell that opted out (see `NO_ROW_CLICK_CLASSNAME`).
 *
 * Resolved from the DOM rather than from the event's React path on purpose: the opt-out is carried by the
 * `<td>`, and the click may have landed on the `<td>` itself, on the design system's inner
 * `.ant-table-cell` wrapper, or on the control inside it — `closest` covers the three identically.
 */
export const isRowClickIgnored = (target: EventTarget | null): boolean =>
    target instanceof Element && Boolean(target.closest(`.${NO_ROW_CLICK_CLASSNAME}`));
