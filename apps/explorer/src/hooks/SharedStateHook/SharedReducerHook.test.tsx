// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '@testing-library/react';
import React, {useEffect, useReducer} from 'react';
import {act} from 'react-dom/test-utils';
import {mockNavigationPath} from '__mocks__/Navigation/mockTreeElements';
import {
    mockSharedNavigationSelection,
    mockSharedNavigationSelectionWithNoSelected,
    mockSharedSearchSelection,
    mockSharedSelectedElement
} from '__mocks__/stateFilters/mockSharedSelection';
import {MockStateShared} from '__mocks__/stateShared/mockStateShared';
import {resetSharedSelection, setSharedSelection, toggleSharedElementSelected} from './SharedReducerActions';
import useStateShared from './SharedReducerHook';
import {sharedReducerInitialState} from './SharedReducerInitialState';
import {ISharedReducerState, sharedStateReducer, SharedStateSelectionType} from './SharedStateReducer';

describe('SharedStateReducer', () => {
    test('get initialise using sharedReducerInitialState', async () => {
        let givenStateShared: any;

        const Component = () => {
            const {stateShared} = useStateShared();

            givenStateShared = stateShared;

            return <></>;
        };

        await act(async () => {
            render(
                <MockStateShared>
                    <Component />
                </MockStateShared>
            );
        });

        expect(givenStateShared).toEqual(sharedReducerInitialState);
    });

    test('SET_SELECTION', async () => {
        let givenStateShared: ISharedReducerState = sharedReducerInitialState;

        const SetupComponent = ({children}: any) => {
            const [stateShared, dispatchShared] = useReducer(sharedStateReducer, sharedReducerInitialState);

            givenStateShared = stateShared;

            return (
                <MockStateShared stateShared={stateShared} dispatchShared={dispatchShared}>
                    {children}
                </MockStateShared>
            );
        };

        const Component = () => {
            const {dispatchShared: localDispatchShared} = useStateShared();

            useEffect(() => {
                localDispatchShared(setSharedSelection(mockSharedSearchSelection));
            }, []);

            return <></>;
        };

        await act(async () => {
            render(
                <SetupComponent>
                    <Component />
                </SetupComponent>
            );
        });

        expect(givenStateShared.selection).toEqual(mockSharedSearchSelection);
    });

    test('RESET_SELECTION', async () => {
        let givenStateShared: ISharedReducerState = sharedReducerInitialState;

        const SetupComponent = ({children}: any) => {
            const [stateShared, dispatchShared] = useReducer(sharedStateReducer, sharedReducerInitialState);

            givenStateShared = stateShared;

            return (
                <MockStateShared stateShared={{selection: mockSharedSearchSelection}} dispatchShared={dispatchShared}>
                    {children}
                </MockStateShared>
            );
        };

        const Component = () => {
            const {dispatchShared: localDispatchShared} = useStateShared();

            useEffect(() => {
                localDispatchShared(resetSharedSelection());
            }, []);

            return <></>;
        };

        await act(async () => {
            render(
                <SetupComponent>
                    <Component />
                </SetupComponent>
            );
        });

        expect(givenStateShared.selection).toEqual({...sharedReducerInitialState.selection, allSelected: null});
    });

    test('SET_SEARCH_ALL_SELECTED', async () => {
        let givenStateShared: ISharedReducerState = sharedReducerInitialState;

        const SetupComponent = ({children}: any) => {
            const [state, dispatch] = useReducer(sharedStateReducer, sharedReducerInitialState);

            givenStateShared = state;

            return (
                <MockStateShared stateShared={{selection: mockSharedSearchSelection}} dispatchShared={dispatch}>
                    {children}
                </MockStateShared>
            );
        };

        const Component = () => {
            const {dispatchShared} = useStateShared();

            useEffect(() => {
                dispatchShared(
                    setSharedSelection({
                        selected: [],
                        allSelected: true,
                        type: SharedStateSelectionType.search
                    })
                );
            }, []);

            return <></>;
        };

        await act(async () => {
            render(
                <SetupComponent>
                    <Component />
                </SetupComponent>
            );
        });

        expect(givenStateShared.selection).toEqual({...mockSharedSearchSelection, selected: [], allSelected: true});
    });

    test('TOGGLE_ELEMENT_SELECTED - remove element from selected', async () => {
        let givenStateShared: ISharedReducerState = sharedReducerInitialState;

        const SetupComponent = ({children}: any) => {
            const [state, dispatch] = useReducer(sharedStateReducer, {
                ...sharedReducerInitialState,
                selection: mockSharedNavigationSelection
            });

            givenStateShared = state;

            return (
                <MockStateShared stateShared={{selection: mockSharedNavigationSelection}} dispatchShared={dispatch}>
                    {children}
                </MockStateShared>
            );
        };

        const Component = () => {
            const {dispatchShared} = useStateShared();

            useEffect(() => {
                dispatchShared(
                    toggleSharedElementSelected(
                        SharedStateSelectionType.navigation,
                        mockSharedSelectedElement,
                        mockNavigationPath
                    )
                );
            }, []);

            return <></>;
        };

        await act(async () => {
            render(
                <SetupComponent>
                    <Component />
                </SetupComponent>
            );
        });

        expect(givenStateShared.selection).toEqual({...mockSharedNavigationSelection, selected: []});
    });

    test('TOGGLE_ELEMENT_SELECTED - add element from selected', async () => {
        let givenStateShared: ISharedReducerState = sharedReducerInitialState;

        const SetupComponent = ({children}: any) => {
            const [state, dispatch] = useReducer(sharedStateReducer, {
                ...sharedReducerInitialState,
                selection: mockSharedNavigationSelectionWithNoSelected
            });

            givenStateShared = state;

            return (
                <MockStateShared
                    stateShared={{selection: mockSharedNavigationSelectionWithNoSelected}}
                    dispatchShared={dispatch}
                >
                    {children}
                </MockStateShared>
            );
        };

        const Component = () => {
            const {dispatchShared} = useStateShared();

            useEffect(() => {
                dispatchShared(
                    toggleSharedElementSelected(
                        SharedStateSelectionType.navigation,
                        mockSharedSelectedElement,
                        mockNavigationPath
                    )
                );
            }, []);

            return <></>;
        };

        await act(async () => {
            render(
                <SetupComponent>
                    <Component />
                </SetupComponent>
            );
        });

        expect(givenStateShared.selection).toEqual({
            ...mockSharedNavigationSelectionWithNoSelected,
            selected: [mockSharedSelectedElement]
        });
    });
});
