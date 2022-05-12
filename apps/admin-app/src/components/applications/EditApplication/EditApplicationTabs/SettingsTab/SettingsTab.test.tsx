// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import EditApplicationContext from 'context/EditApplicationContext';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockEditApplicationContextValue} from '__mocks__/common/applications';
import SettingsTab from './SettingsTab';

jest.mock('jsoneditor-react', () => ({
    JsonEditor() {
        return <div>JsonEditor</div>;
    }
}));

describe('SettingsTab', () => {
    test('Render test', async () => {
        render(
            <EditApplicationContext.Provider
                value={{
                    ...mockEditApplicationContextValue,
                    application: {
                        ...mockEditApplicationContextValue.application,
                        settings: {
                            myField: 'myValue',
                            otherField: 'otherValue'
                        }
                    }
                }}
            >
                <SettingsTab />
            </EditApplicationContext.Provider>
        );

        expect(screen.getByText('JsonEditor')).toBeInTheDocument();
    });
});
