import {AttributeType} from '_ui/_gqlTypes';
import {type AttributeProperties} from '../_types';
import {getColumnSplitOptions} from './getColumnSplitOptions';

const _buildAttribute = (overrides: Partial<AttributeProperties> = {}): AttributeProperties =>
    ({
        id: 'status',
        type: AttributeType.simple,
        required: false,
        multiple_values: false,
        permissions: {edit_value: true},
        column_split_enabled: true,
        ...overrides,
    }) as AttributeProperties;

describe('getColumnSplitOptions', () => {
    it('returns no option when the attribute carries no values list', () => {
        expect(getColumnSplitOptions(_buildAttribute())).toEqual([]);
    });

    it('returns no option when the values list is empty', () => {
        expect(getColumnSplitOptions(_buildAttribute({valuesList: {values: []}}))).toEqual([]);
    });

    it('maps a standard attribute raw value to key, label and rawValue alike', () => {
        expect(getColumnSplitOptions(_buildAttribute({valuesList: {values: ['draft', 'published']}}))).toEqual([
            {key: 'draft', label: 'draft', rawValue: 'draft'},
            {key: 'published', label: 'published', rawValue: 'published'},
        ]);
    });

    it('maps a link attribute to the linked record identity, keeping its color', () => {
        // Merged then cast, rather than passed as `Partial<AttributeProperties>`: that union-typed
        // parameter resolves `valuesList` to the StandardAttribute variant, which has no `linkedValues`.
        const attribute = {
            ..._buildAttribute({type: AttributeType.advanced_link}),
            valuesList: {
                linkedValues: [
                    {id: 'rec1', whoAmI: {id: 'rec1', label: 'Record 1', color: '#f8e58c'}},
                    {id: 'rec2', whoAmI: {id: 'rec2', label: null, color: null}},
                ],
            },
        } as AttributeProperties;

        expect(getColumnSplitOptions(attribute)).toEqual([
            {key: 'rec1', label: 'Record 1', color: '#f8e58c', rawValue: 'rec1'},
            // Falls back to the id when the linked record has no label
            {key: 'rec2', label: 'rec2', color: null, rawValue: 'rec2'},
        ]);
    });

    it('returns no option for a tree attribute (lot 3 will read the linked tree root nodes)', () => {
        expect(getColumnSplitOptions(_buildAttribute({type: AttributeType.tree}))).toEqual([]);
    });
});
