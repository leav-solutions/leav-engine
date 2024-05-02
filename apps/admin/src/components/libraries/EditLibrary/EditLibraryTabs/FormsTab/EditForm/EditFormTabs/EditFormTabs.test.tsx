// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockFormFull} from '../../../../../../../__mocks__/forms';
import {EditFormContext} from '../hooks/useEditFormContext';
import EditFormTabs from './EditFormTabs';

jest.mock('../../../../../../../hooks/useLang');

jest.mock('./InfosTab', () => function InfosTab() {
        return <div>InfosTab</div>;
    });

jest.mock('./ContentTab', () => function ContentTab() {
        return <div>ContentTab</div>;
    });

describe('EditFormTabs', () => {
    const mockForm = {...mockFormFull};

    test('Display form edition for existing form', async () => {
        render(
            <EditFormContext.Provider
                value={{form: mockForm, library: 'test_lib', readonly: false, setForm: jest.fn()}}
            >
                <EditFormTabs />
            </EditFormContext.Provider>
        );

        expect(screen.getByTestId('header')).toHaveTextContent('Test Form');

        // Check number of panes
        expect(screen.getByText('forms.informations')).toBeInTheDocument();
        expect(screen.getByText('forms.content')).toBeInTheDocument();
    });

    test('Display form edition for new form', async () => {
        const comp = render(
            <EditFormContext.Provider value={{form: null, library: 'test_lib', readonly: false, setForm: jest.fn()}}>
                <EditFormTabs />
            </EditFormContext.Provider>
        );

        expect(screen.getByTestId('header')).toHaveTextContent('forms.new');

        // Check number of panes
        expect(screen.getByText('forms.informations')).toBeInTheDocument();
        expect(screen.queryByText('forms.content')).not.toBeInTheDocument();
    });
});
