import {AttributeCondition, TreeCondition} from '../../../_types/record';
import filterTypes from './filterTypes';

describe('filterTypes', () => {
    test('isAttributeFilter', async () => {
        const helper = filterTypes();

        expect(helper.isAttributeFilter({})).toBe(false);

        expect(
            helper.isAttributeFilter({
                attributes: [],
                condition: AttributeCondition.EQUAL,
                value: 'foo',
            }),
        ).toBe(true);

        expect(
            helper.isAttributeFilter({
                attributes: [],
                condition: TreeCondition.CLASSIFIED_IN,
                value: 'foo',
            }),
        ).toBe(false);
    });

    test('isClassifyingFilter', async () => {
        const helper = filterTypes();

        expect(helper.isClassifyingFilter({})).toBe(false);

        expect(
            helper.isClassifyingFilter({
                attributes: [],
                condition: TreeCondition.CLASSIFIED_IN,
                value: 'foo',
            }),
        ).toBe(true);

        expect(
            helper.isClassifyingFilter({
                attributes: [],
                condition: AttributeCondition.EQUAL,
                value: 'foo',
            }),
        ).toBe(false);
    });
});
