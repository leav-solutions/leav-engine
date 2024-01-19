// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttribute} from '_ui/types/search';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {act, render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import ChooseTableColumns from './ChooseTableColumns';

jest.mock(
    '../../../AttributesSelectionList',
    () =>
        function AttributesSelectionList() {
            return <div>AttributesSelectionList</div>;
        }
);

describe('ChooseTableColumns', () => {
    test('should render attributes', async () => {
        const attributesMock: IAttribute[] = [
            {
                id: 'test',
                library: 'test_library',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {
                    fr: 'test',
                    en: 'test'
                },
                isLink: false,
                isMultiple: false
            }
        ];

        await act(async () => {
            render(
                <MockSearchContextProvider state={{attributes: attributesMock}}>
                    <ChooseTableColumns visible onClose={jest.fn()} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByText('AttributesSelectionList')).toBeInTheDocument();
    });
});
