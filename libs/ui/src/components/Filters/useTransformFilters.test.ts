// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';
import {ThroughConditionFilter} from '_ui/types';
import {type AttributesById, useTransformFilters} from './useTransformFilters';

/**
 * Characterization tests: lock the CURRENT behavior of useTransformFilters
 * (toValidFilters / toUIFilters) before refactoring the Filters type system.
 */

vi.mock('_ui/hooks', () => ({
    useLang: () => ({lang: ['fr', 'en']}),
}));

const t = ((key: string) => key) as any;

const getTransform = () => renderHook(() => useTransformFilters()).result.current;

// Strip the random uuid so we can assert on the meaningful shape.
const stripIds = <T extends {id?: unknown}>(filters: T[]): Array<Omit<T, 'id'>> =>
    filters.map(({id, ...rest}) => rest as Omit<T, 'id'>);

describe('useTransformFilters (characterization)', () => {
    describe('toValidFilters', () => {
        test('drops filters without a field', () => {
            const {toValidFilters} = getTransform();
            expect(toValidFilters([{field: null, condition: RecordFilterCondition.EQUAL, value: 'x'}] as any)).toEqual(
                [],
            );
        });

        test('keeps a regular field filter as-is', () => {
            const {toValidFilters} = getTransform();
            const input = [{field: 'title', condition: RecordFilterCondition.CONTAINS, value: 'x'}] as any;
            expect(toValidFilters(input)).toEqual([
                {field: 'title', condition: RecordFilterCondition.CONTAINS, value: 'x'},
            ]);
        });

        test('splits a dotted field into a through filter', () => {
            const {toValidFilters} = getTransform();
            const input = [{field: 'author.name', condition: RecordFilterCondition.CONTAINS, value: 'x'}] as any;
            expect(toValidFilters(input)).toEqual([
                {
                    field: 'author',
                    subField: 'name',
                    value: 'x',
                    hidden: false,
                    condition: ThroughConditionFilter.THROUGH,
                    subCondition: RecordFilterCondition.CONTAINS,
                },
            ]);
        });
    });

    describe('toUIFilters', () => {
        test('warns and skips when attribute is not in database', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            const {toUIFilters} = getTransform();
            const result = toUIFilters({
                filters: [{field: 'unknown', condition: RecordFilterCondition.EQUAL, value: 'x'}] as any,
                treeFilters: {},
                attributesDataById: {},
                t,
            });
            expect(result).toEqual([]);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown'));
            warn.mockRestore();
        });

        test('builds a standard text UI filter', () => {
            const {toUIFilters} = getTransform();
            const attributesDataById: AttributesById = {
                title: {
                    id: 'title',
                    label: {fr: 'Titre'},
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                } as any,
            };
            const result = toUIFilters({
                filters: [{field: 'title', condition: RecordFilterCondition.CONTAINS, value: 'x'}] as any,
                treeFilters: {},
                attributesDataById,
                t,
            });
            expect(stripIds(result)).toEqual([
                {
                    field: 'title',
                    value: 'x',
                    formattedValue: undefined,
                    hidden: false,
                    condition: RecordFilterCondition.CONTAINS,
                    attribute: {
                        id: 'title',
                        label: 'Titre',
                        type: AttributeType.simple,
                        format: AttributeFormat.text,
                        smartFilter: undefined,
                    },
                    withEmptyValues: false,
                },
            ]);
        });

        test('builds a link UI filter and carries smartFilter flag', () => {
            const {toUIFilters} = getTransform();
            const attributesDataById: AttributesById = {
                author: {
                    id: 'author',
                    label: {fr: 'Auteur'},
                    type: AttributeType.simple_link,
                    linked_library: {id: 'users'},
                    smart_filter: {enable: true},
                    permissions: {access_attribute: true},
                } as any,
            };
            const result = toUIFilters({
                filters: [{field: 'author', condition: RecordFilterCondition.EQUAL, value: 'rec1'}] as any,
                treeFilters: {},
                attributesDataById,
                t,
            });
            expect(stripIds(result)).toEqual([
                {
                    field: 'author',
                    value: 'rec1',
                    hidden: false,
                    condition: RecordFilterCondition.EQUAL,
                    attribute: {
                        id: 'author',
                        label: 'Auteur',
                        type: AttributeType.simple_link,
                        linkedLibrary: {id: 'users'},
                        smartFilter: {enable: true},
                    },
                },
            ]);
        });

        test('builds a tree UI filter from treeFilters when no explicit value', () => {
            const {toUIFilters} = getTransform();
            const attributesDataById: AttributesById = {
                categories: {
                    id: 'categories',
                    label: {fr: 'Catégories'},
                    type: AttributeType.tree,
                    linked_tree: {id: 'tree1'},
                    permissions: {access_attribute: true},
                } as any,
            };
            const result = toUIFilters({
                filters: [{field: 'categories', condition: RecordFilterCondition.EQUAL, value: null}] as any,
                treeFilters: {
                    categories: [{nodeId: 'n1', libraryId: 'libA', value: 'rec1', label: 'Node 1'}],
                },
                attributesDataById,
                t,
            });
            expect(stripIds(result)).toEqual([
                {
                    field: ['categories'],
                    value: ['rec1'],
                    formattedValue: ['Node 1'],
                    nodes: [{libraryId: 'libA', nodeId: 'n1'}],
                    hidden: false,
                    attribute: {
                        id: 'categories',
                        label: 'Catégories',
                        type: AttributeType.tree,
                        linkedTree: {id: 'tree1'},
                    },
                    condition: RecordFilterCondition.EQUAL,
                    withEmptyValues: false,
                },
            ]);
        });
    });
});
