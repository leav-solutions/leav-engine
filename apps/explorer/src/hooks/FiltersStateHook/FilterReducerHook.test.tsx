// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '@testing-library/react';
import React, {useEffect, useReducer} from 'react';
import {act} from 'react-dom/test-utils';
import {mockFilter, mockQueryFilter} from '__mocks__/common/filter';
import {MockStateFilters} from '__mocks__/stateFilters/mockStateFilters';
import {setFilters, setQueryFilters} from './FilterReducerAction';
import {filterReducerInitialState} from './FilterReducerInitialState';
import useStateFilters from './FiltersStateHook';
import {filterStateReducer} from './FiltersStateReducer';

describe('FilterReducerHook', () => {
    test('should get initial state', async () => {
        let result: any;
        const Component = () => {
            const {stateFilters} = useStateFilters();
            result = stateFilters;
            return <></>;
        };

        await act(async () => {
            render(
                <MockStateFilters>
                    <Component />
                </MockStateFilters>
            );
        });

        expect(result).toEqual(filterReducerInitialState);
    });

    test('SET_FILTERS', async () => {
        let result: any;

        const ParentComponent = () => {
            const [stateFilters, dispatchFilters] = useReducer(filterStateReducer, filterReducerInitialState);

            result = stateFilters;

            return (
                <MockStateFilters stateFilters={filterReducerInitialState} dispatchFilters={dispatchFilters}>
                    <Component />
                </MockStateFilters>
            );
        };

        const Component = () => {
            const {dispatchFilters} = useStateFilters();

            useEffect(() => {
                dispatchFilters(setFilters([mockFilter]));
            }, []);

            return <></>;
        };

        await act(async () => {
            render(<ParentComponent />);
        });

        expect(result).toEqual({...filterReducerInitialState, filters: [mockFilter]});
    });

    test('SET_QUERY_FILTERS', async () => {
        let result: any;

        const ParentComponent = () => {
            const [stateFilters, dispatchFilters] = useReducer(filterStateReducer, filterReducerInitialState);

            result = stateFilters;

            return (
                <MockStateFilters stateFilters={filterReducerInitialState} dispatchFilters={dispatchFilters}>
                    <Component />
                </MockStateFilters>
            );
        };

        const Component = () => {
            const {dispatchFilters} = useStateFilters();

            useEffect(() => {
                dispatchFilters(setQueryFilters([mockQueryFilter]));
            }, []);

            return <></>;
        };

        await act(async () => {
            render(<ParentComponent />);
        });

        expect(result).toEqual({...filterReducerInitialState, queryFilters: [mockQueryFilter]});
    });
});
