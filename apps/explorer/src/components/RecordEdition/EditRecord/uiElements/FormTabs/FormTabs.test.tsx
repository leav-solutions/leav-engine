// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TabsDirection} from '@leav/utils';
import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {mockFormElementTabs} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import FormTabs from './FormTabs';

jest.mock('hooks/LangHook/LangHook');

describe('Tabs', () => {
    test('Render Tabs', async () => {
        await act(async () => {
            render(<FormTabs record={mockRecordWhoAmI} element={mockFormElementTabs} recordValues={{}} />);
        });

        await act(async () => {
            expect(screen.getAllByRole('tab').length).toBe(2);
        });
    });

    test('Render vertical Tabs', async () => {
        render(
            <FormTabs
                record={mockRecordWhoAmI}
                recordValues={{}}
                element={{
                    ...mockFormElementTabs,
                    settings: {...mockFormElementTabs.settings, direction: TabsDirection.VERTICAL}
                }}
            />
        );

        await act(async () => {
            expect(screen.getByTestId('form-tabs')).toHaveClass('ant-tabs-left');
        });
    });
});
