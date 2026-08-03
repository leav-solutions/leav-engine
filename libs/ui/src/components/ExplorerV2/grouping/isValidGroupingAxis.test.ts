import {AttributeType} from '_ui/_gqlTypes';
import {isValidGroupingAxis, isValidKanbanAxis} from './isValidGroupingAxis';

describe('isValidGroupingAxis', () => {
    it('accepts a tree attribute', () => {
        expect(isValidGroupingAxis({type: AttributeType.tree})).toBe(true);
    });

    it('accepts an attribute with an enabled, closed values list', () => {
        expect(
            isValidGroupingAxis({type: AttributeType.simple, values_list: {enable: true, allowFreeEntry: false}}),
        ).toBe(true);
    });

    it('rejects a values list that allows free entry (not finite)', () => {
        expect(
            isValidGroupingAxis({type: AttributeType.simple, values_list: {enable: true, allowFreeEntry: true}}),
        ).toBe(false);
    });

    it('rejects a disabled values list', () => {
        expect(
            isValidGroupingAxis({type: AttributeType.simple, values_list: {enable: false, allowFreeEntry: false}}),
        ).toBe(false);
    });

    it('rejects an attribute with neither a tree type nor a values list', () => {
        expect(isValidGroupingAxis({type: AttributeType.simple})).toBe(false);
    });

    it('accepts a link attribute with an enabled, closed values list', () => {
        expect(
            isValidGroupingAxis({
                type: AttributeType.advanced_link,
                values_list: {enable: true, allowFreeEntry: false},
            }),
        ).toBe(true);
    });
});

describe('isValidKanbanAxis (phase 1: the board only implements tree axes)', () => {
    it('accepts a tree attribute', () => {
        expect(isValidKanbanAxis({type: AttributeType.tree})).toBe(true);
    });

    it('rejects a closed values list, even though it is a valid grouping axis in general', () => {
        const closedListAttribute = {
            type: AttributeType.simple,
            values_list: {enable: true, allowFreeEntry: false},
        };

        expect(isValidGroupingAxis(closedListAttribute)).toBe(true);
        expect(isValidKanbanAxis(closedListAttribute)).toBe(false);
    });
});
