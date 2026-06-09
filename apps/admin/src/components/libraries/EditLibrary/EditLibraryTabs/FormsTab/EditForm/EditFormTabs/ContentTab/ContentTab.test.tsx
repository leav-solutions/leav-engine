import React from 'react';
import {act, render, screen} from '../../../../../../../../_tests/testUtils';
import {EditFormModalButtonsContext} from '../../../EditFormModal/EditFormModalButtonsContext';
import {EditFormContext} from '../../hooks/useEditFormContext';
import ContentTab from './ContentTab';
import {formData} from './formBuilderReducer/_fixtures/fixtures';

vi.mock('./BreadcrumbNavigator', () => ({
    default: function BreadcrumbNavigator() {
        return <div>BreadcrumbNavigator</div>;
    },
}));

vi.mock('./DependencySettings', () => ({
    default: function DependencySettings() {
        return <div>DependencySettings</div>;
    },
}));

vi.mock('./ElementsReserve', () => ({
    default: function ElementsReserve() {
        return <div>ElementsReserve</div>;
    },
}));

vi.mock('./FormLayout', () => ({
    default: function FormLayout() {
        return <div>FormLayout</div>;
    },
}));

describe('ContentTab', () => {
    test('Render form content editor', async () => {
        await act(async () => {
            render(
                <EditFormModalButtonsContext.Provider value={{buttons: {}, setButton: vi.fn(), removeButton: vi.fn()}}>
                    <EditFormContext.Provider
                        value={{form: formData, library: 'test_lib', readonly: false, setForm: vi.fn()}}
                    >
                        <ContentTab />
                    </EditFormContext.Provider>
                </EditFormModalButtonsContext.Provider>,
            );
        });

        expect(screen.getByText('FormLayout')).toBeInTheDocument();
        expect(screen.getByText('ElementsReserve')).toBeInTheDocument();
        expect(screen.getByText('DependencySettings')).toBeInTheDocument();
    });
});
