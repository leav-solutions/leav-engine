import {act, renderHook} from '_ui/_tests/testUtils';
import {AttributeType} from '_ui/_gqlTypes';
import {type AttributesPropertiesById, type IItemData} from '../_types';
import {getSelectedKeys} from './getValueKeys';
import {useOptimisticSplitValues} from './useOptimisticSplitValues';

const attribute = {
    id: 'status',
    label: 'Status',
    type: AttributeType.simple,
    required: false,
    multiple_values: false,
    permissions: {edit_value: true},
};

const attributesProperties: AttributesPropertiesById = {status: attribute};

const _buildItem = (itemId: string, value: string | null): IItemData =>
    ({
        libraryId: 'my_library',
        key: itemId,
        itemId,
        propertiesById: {status: value === null ? [] : [{id_value: 'v1', valuePayload: value}]},
    }) as unknown as IItemData;

/** What a split cell reads, on the row the hook actually hands to the table. */
const _selectedKeysOf = (items: IItemData[], itemId: string) =>
    getSelectedKeys(
        items.find(item => item.itemId === itemId)!,
        attribute,
    );

describe('useOptimisticSplitValues', () => {
    it('hands back the very array it was given while no write is in flight', () => {
        const data = [_buildItem('record_1', 'draft')];
        const {result} = renderHook(() => useOptimisticSplitValues(data, attributesProperties));

        // Referential identity, not just equality: an untouched table must give antd nothing to diff.
        expect(result.current.items).toBe(data);
        expect(_selectedKeysOf(result.current.items, 'record_1')).toEqual(['draft']);
    });

    it('merges the overlay into the touched row, and into that row only', () => {
        const data = [_buildItem('record_1', 'draft'), _buildItem('record_2', 'draft')];
        const {result} = renderHook(() => useOptimisticSplitValues(data, attributesProperties));

        act(() => result.current.setOptimisticKeys(data[0], attribute.id, ['published']));

        expect(_selectedKeysOf(result.current.items, 'record_1')).toEqual(['published']);
        expect(result.current.items[0]).not.toBe(data[0]);
        // The untouched row keeps its identity: this is what lets its cells bail out of the re-render.
        expect(result.current.items[1]).toBe(data[1]);
    });

    it('reconciles: drops the overlay entry once fresh data matches the expected keys', () => {
        const item = _buildItem('record_1', 'draft');
        const {result, rerender} = renderHook(({data}) => useOptimisticSplitValues(data, attributesProperties), {
            initialProps: {data: [item]},
        });

        act(() => result.current.setOptimisticKeys(item, attribute.id, ['published']));
        expect(_selectedKeysOf(result.current.items, 'record_1')).toEqual(['published']);

        // Fresh data confirms the write: the overlay entry is dropped, reads fall back through to it.
        const freshData = [_buildItem('record_1', 'published')];
        rerender({data: freshData});

        expect(result.current.items).toBe(freshData);
        expect(_selectedKeysOf(result.current.items, 'record_1')).toEqual(['published']);
    });

    it('keeps the overlay entry while fresh data has not caught up yet', () => {
        const item = _buildItem('record_1', 'draft');
        const {result, rerender} = renderHook(({data}) => useOptimisticSplitValues(data, attributesProperties), {
            initialProps: {data: [item]},
        });

        act(() => result.current.setOptimisticKeys(item, attribute.id, ['published']));

        // Same (stale) server data comes back — the overlay must survive.
        rerender({data: [item]});

        expect(_selectedKeysOf(result.current.items, 'record_1')).toEqual(['published']);
    });

    it('reconciles one attribute without dropping the other pending write of the same record', () => {
        const twoAttributes: AttributesPropertiesById = {status: attribute, state: {...attribute, id: 'state'}};
        const item = {
            ...(_buildItem('record_1', 'draft') as IItemData),
            propertiesById: {status: [{id_value: 'v1', valuePayload: 'draft'}], state: []},
        } as unknown as IItemData;

        const {result, rerender} = renderHook(({data}) => useOptimisticSplitValues(data, twoAttributes), {
            initialProps: {data: [item]},
        });

        act(() => result.current.setOptimisticKeys(item, 'status', ['published']));
        act(() => result.current.setOptimisticKeys(item, 'state', ['open']));

        // Only `status` came back confirmed; `state` is still in flight.
        const freshItem = {
            ...item,
            propertiesById: {status: [{id_value: 'v1', valuePayload: 'published'}], state: []},
        } as unknown as IItemData;
        rerender({data: [freshItem]});

        expect(getSelectedKeys(result.current.items[0], twoAttributes.status)).toEqual(['published']);
        expect(getSelectedKeys(result.current.items[0], twoAttributes.state)).toEqual(['open']);
    });

    it('rollback: clearing the overlay entry falls back to the (unchanged) server data', () => {
        const data = [_buildItem('record_1', 'draft')];
        const {result} = renderHook(() => useOptimisticSplitValues(data, attributesProperties));

        act(() => result.current.setOptimisticKeys(data[0], attribute.id, ['published']));
        act(() => result.current.clearOptimisticKeys(data[0], attribute.id));

        expect(result.current.items).toBe(data);
        expect(_selectedKeysOf(result.current.items, 'record_1')).toEqual(['draft']);
    });
});
