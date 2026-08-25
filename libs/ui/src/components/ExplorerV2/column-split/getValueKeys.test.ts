import {AttributeType, type PropertyValueFragment} from '_ui/_gqlTypes';
import {type AttributeProperties} from '../_types';
import {findValueIdForKey, getValueKeys} from './getValueKeys';

const _buildAttribute = (type: AttributeType): AttributeProperties =>
    ({
        id: 'attribute_id',
        type,
        required: false,
        multiple_values: true,
        permissions: {edit_value: true},
    }) as AttributeProperties;

describe('getValueKeys', () => {
    it('returns an empty array for undefined or empty values', () => {
        const attribute = _buildAttribute(AttributeType.simple);
        expect(getValueKeys(undefined, attribute)).toEqual([]);
        expect(getValueKeys([], attribute)).toEqual([]);
    });

    it('extracts the raw payload as the key for a standard attribute', () => {
        const attribute = _buildAttribute(AttributeType.simple);
        const values = [
            {id_value: 'v1', valuePayload: 'draft'},
            {id_value: 'v2', valuePayload: 'published'},
        ] as PropertyValueFragment[];

        expect(getValueKeys(values, attribute)).toEqual(['draft', 'published']);
    });

    it('keeps a falsy-but-valid standard value (e.g. boolean false)', () => {
        const attribute = _buildAttribute(AttributeType.simple);
        const values = [{id_value: 'v1', valuePayload: false}] as unknown as PropertyValueFragment[];

        expect(getValueKeys(values, attribute)).toEqual(['false']);
    });

    it('extracts the linked record id as the key for a link attribute', () => {
        const attribute = _buildAttribute(AttributeType.advanced_link);
        const values = [
            {id_value: 'v1', linkPayload: {id: 'rec1', whoAmI: {id: 'rec1', label: 'Record 1'}}},
        ] as unknown as PropertyValueFragment[];

        expect(getValueKeys(values, attribute)).toEqual(['rec1']);
    });

    it('extracts the node id (NOT the linked record id) as the key for a tree attribute', () => {
        const attribute = _buildAttribute(AttributeType.tree);
        const values = [
            {
                id_value: 'v1',
                treePayload: {id: 'node1', record: {id: 'rec1', whoAmI: {id: 'rec1', label: 'Node 1'}}},
            },
        ] as unknown as PropertyValueFragment[];

        expect(getValueKeys(values, attribute)).toEqual(['node1']);
    });
});

describe('findValueIdForKey', () => {
    it('finds the id_value of the value matching the given key', () => {
        const attribute = _buildAttribute(AttributeType.simple);
        const values = [
            {id_value: 'v1', valuePayload: 'draft'},
            {id_value: 'v2', valuePayload: 'published'},
        ] as PropertyValueFragment[];

        expect(findValueIdForKey(values, attribute, 'published')).toBe('v2');
    });

    it('returns null when no value matches', () => {
        const attribute = _buildAttribute(AttributeType.simple);
        const values = [{id_value: 'v1', valuePayload: 'draft'}] as PropertyValueFragment[];

        expect(findValueIdForKey(values, attribute, 'archived')).toBeNull();
    });

    it('returns null for undefined values', () => {
        expect(findValueIdForKey(undefined, _buildAttribute(AttributeType.simple), 'draft')).toBeNull();
    });
});
