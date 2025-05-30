// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {mockCommonFormElementProps, mockFormElementDivider} from '_ui/__mocks__/common/form';
import FormDivider from './FormDivider';

describe('FormDivider', () => {
    test('Render divider', async () => {
        render(<FormDivider {...mockCommonFormElementProps} element={mockFormElementDivider} formIdToLoad="edition" />);

        expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    test('Render divider with title', async () => {
        render(
            <FormDivider
                {...mockCommonFormElementProps}
                element={{...mockFormElementDivider, settings: {title: 'divider title'}}}
                formIdToLoad="edition"
            />
        );

        expect(screen.getByText('divider title')).toBeInTheDocument();
    });
});
