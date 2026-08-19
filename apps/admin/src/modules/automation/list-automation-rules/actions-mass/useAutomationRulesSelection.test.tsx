import {act, renderHook, waitFor} from '@testing-library/react';
import {type MockedResponse} from '@apollo/client/testing';
import {TestProviders} from '../../../../_tests/TestProviders';
import {type AutomationRulesFiltersInput, GetAutomationRulesDataDocument} from '../../../../_gqlTypes';
import {type AutomationRulesData} from '../get-automation-rules-data/useGetAutomationRulesData';
import {useAutomationRulesSelection} from './useAutomationRulesSelection';

const mockRule = (id: string): AutomationRulesData => ({
    id,
    name: `Rule ${id}`,
    version: '1',
    trigger: 'VALUE_SAVE',
    target: 'products',
    nb_actions: 1,
    active: false,
    modifiedAt: '',
    modifiedBy: '',
});

const mockRuleFromApi = (id: string) => ({
    id,
    label: `Rule ${id}`,
    version: '1',
    active: false,
    modifiedAt: 0,
    modifiedBy: null,
    trigger: {eventAction: 'VALUE_SAVE', eventTopic: {library: 'products', attribute: null}},
    pipeline: {steps: [{name: 'step'}]},
});

describe('useAutomationRulesSelection', () => {
    const visibleRules = [mockRule('1'), mockRule('2')];

    test('total <= pageSize: selectAllFiltered selects visibleRules without querying', async () => {
        const {result} = renderHook(
            () =>
                useAutomationRulesSelection({
                    total: 2,
                    pageSize: 10,
                    visibleRules,
                }),
            {wrapper: ({children}) => <TestProviders apolloMocks={[]}>{children}</TestProviders>},
        );

        await act(async () => {
            await result.current.selectAllFiltered();
        });

        expect(result.current.selectedRules).toEqual(visibleRules);
        expect(result.current.isAllFilteredSelected).toBe(false);
    });

    test('total > pageSize: selectAllFiltered queries all rules and flags isAllFilteredSelected', async () => {
        const mocks: readonly MockedResponse[] = [
            {
                request: {
                    query: GetAutomationRulesDataDocument,
                    variables: {filters: undefined, pagination: {limit: 25, offset: 0}},
                },
                result: {
                    data: {
                        automationRules: {
                            totalCount: 25,
                            list: [mockRuleFromApi('1'), mockRuleFromApi('2'), mockRuleFromApi('3')],
                        },
                    },
                },
            },
        ];

        const {result} = renderHook(
            () =>
                useAutomationRulesSelection({
                    total: 25,
                    pageSize: 10,
                    visibleRules,
                }),
            {wrapper: ({children}) => <TestProviders apolloMocks={mocks}>{children}</TestProviders>},
        );

        await act(async () => {
            await result.current.selectAllFiltered();
        });

        await waitFor(() => expect(result.current.selectedRules).toHaveLength(3));
        expect(result.current.isAllFilteredSelected).toBe(true);
    });

    test('a pageSize change does not clear the selection', () => {
        // Cross-page persistence relies on `preserveSelectedRowKeys` on the table's `rowSelection`
        // (see AutomationTable) to keep `selectedRows` complete across a page navigation; this hook
        // must not undo that by clearing on its own.
        const {result, rerender} = renderHook(
            ({pageSize}) =>
                useAutomationRulesSelection({
                    total: 2,
                    pageSize,
                    visibleRules,
                }),
            {
                initialProps: {pageSize: 10},
                wrapper: ({children}) => <TestProviders apolloMocks={[]}>{children}</TestProviders>,
            },
        );

        act(() => {
            result.current.selectRules(visibleRules);
        });
        expect(result.current.selectedRules).toEqual(visibleRules);

        rerender({pageSize: 20});

        expect(result.current.selectedRules).toEqual(visibleRules);
    });

    test('a filters change clears the selection', () => {
        const {result, rerender} = renderHook(
            ({filters}) =>
                useAutomationRulesSelection({
                    total: 2,
                    pageSize: 10,
                    filters,
                    visibleRules,
                }),
            {
                initialProps: {filters: undefined as AutomationRulesFiltersInput | undefined},
                wrapper: ({children}) => <TestProviders apolloMocks={[]}>{children}</TestProviders>,
            },
        );

        act(() => {
            result.current.selectRules(visibleRules);
        });
        expect(result.current.selectedRules).toEqual(visibleRules);

        rerender({filters: {label: 'foo'}});

        expect(result.current.selectedRules).toEqual([]);
    });
});
