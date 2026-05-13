import {TabsDirection} from '@leav/utils';
import {act, render, screen} from '_ui/_tests/testUtils';
import {mockCommonFormElementProps, mockFormElementTabs} from '_ui/__mocks__/common/form';
import FormTabs from './FormTabs';

describe('Tabs', () => {
    test('Render Tabs', async () => {
        render(<FormTabs {...mockCommonFormElementProps} element={mockFormElementTabs} />);

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
                    settings: {...mockFormElementTabs.settings, direction: TabsDirection.VERTICAL},
                }}
            />,
        );

        await act(async () => {
            expect(screen.getByTestId('form-tabs')).toHaveClass('ant-tabs-left');
        });
    });
});
