// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {EditFormContext} from '../../hooks/useEditFormContext';
import ContentTab from './ContentTab';
import {formData} from './formBuilderReducer/_fixtures/fixtures';

jest.mock('./BreadcrumbNavigator', () => {
    return function BreadcrumbNavigator() {
        return <div>BreadcrumbNavigator</div>;
    };
});

jest.mock('./DependencySettings', () => {
    return function DependencySettings() {
        return <div>DependencySettings</div>;
    };
});

jest.mock('./ElementsReserve', () => {
    return function ElementsReserve() {
        return <div>ElementsReserve</div>;
    };
});

jest.mock('./FormLayout', () => {
    return function FormLayout() {
        return <div>FormLayout</div>;
    };
});

describe('ContentTab', () => {
    test('Render form content editor', async () => {
        await act(async () => {
            render(
                <EditFormContext.Provider
                    value={{form: formData, library: 'test_lib', readonly: false, setForm: jest.fn()}}
                >
                    <ContentTab />
                </EditFormContext.Provider>
            );
        });

        expect(screen.getByText('FormLayout')).toBeInTheDocument();
        expect(screen.getByText('ElementsReserve')).toBeInTheDocument();
        expect(screen.getByText('DependencySettings')).toBeInTheDocument();
    });
});
