// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TabsDirection} from '@leav/utils';
import {act, render, screen} from '_ui/_tests/testUtils';
import {mockCommonFormElementProps, mockFormElementTabs} from '_ui/__mocks__/common/form';
import FormTabs from './FormTabs';

describe('Tabs', () => {
    test('Render Tabs', async () => {
        await act(async () => {
            render(<FormTabs {...mockCommonFormElementProps} element={mockFormElementTabs} formIdToLoad="edition" />);
        });

        await act(async () => {
            expect(screen.getAllByRole('tab').length).toBe(2);
        });
    });

    test('Render vertical Tabs', async () => {
        render(
            <FormTabs
                {...mockCommonFormElementProps}
                element={{
                    ...mockFormElementTabs,
                    settings: {...mockFormElementTabs.settings, direction: TabsDirection.VERTICAL}
                }}
                formIdToLoad="edition"
            />
        );

        await act(async () => {
            expect(screen.getByTestId('form-tabs')).toHaveClass('ant-tabs-left');
        });
    });
});
