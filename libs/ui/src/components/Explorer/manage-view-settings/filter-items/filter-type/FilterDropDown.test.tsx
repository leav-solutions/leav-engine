// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {FilterDropDown} from './FilterDropDown';
import {ExplorerFilter} from '../../../_types';
import {FunctionComponent, useReducer} from 'react';
import {IViewSettingsState, viewSettingsReducer} from '../../store-view-settings/viewSettingsReducer';
import {ViewSettingsContext} from '../../store-view-settings/ViewSettingsContext';
import {viewSettingsInitialState} from '../../store-view-settings/viewSettingsInitialState';
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

// Mock the useSharedTranslation hook
jest.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: jest.fn()
}));

const MockViewSettingsContextProvider: FunctionComponent<{
    viewMock: IViewSettingsState;
}> = ({viewMock, children}) => {
    const [view, dispatch] = useReducer(viewSettingsReducer, viewMock);
    return <ViewSettingsContext.Provider value={{view, dispatch}}>{children}</ViewSettingsContext.Provider>;
};

describe('FilterDropDown', () => {
    const mockFilter: ExplorerFilter = {
        id: 'test',
        attribute: {
            label: 'test filter',
            format: AttributeFormat.text,
            type: AttributeType.simple
        },
        field: 'test',
        value: null,
        condition: RecordFilterCondition.CONTAINS
    };

    // Mock translation function
    const mockT = jest.fn(key => key);

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup translation mock
        (useSharedTranslation as jest.Mock).mockReturnValue({
            t: mockT,
            i18n: {language: 'en'}
        });
    });

    test('should not show delete button when enableConfigureView is false', async () => {
        render(
            <MockViewSettingsContextProvider viewMock={{...viewSettingsInitialState, enableConfigureView: false}}>
                <FilterDropDown filter={mockFilter} />
            </MockViewSettingsContextProvider>
        );

        expect(screen.queryByText('global.delete')).not.toBeInTheDocument();
    });

    test('should show delete button when enableConfigureView is true', async () => {
        render(
            <MockViewSettingsContextProvider viewMock={viewSettingsInitialState}>
                <FilterDropDown filter={mockFilter} />
            </MockViewSettingsContextProvider>
        );

        expect(screen.getByText('global.delete')).toBeInTheDocument();
    });
});
