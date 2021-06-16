// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import {AttributeFormat, AttributeType, IAttribute} from '../../../../_types/types';
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

        let comp: any;

        await act(async () => {
            render(
                <MockSearchContextProvider state={{attributes: attributesMock}}>
                    <ChooseTableColumns openChangeColumns setOpenChangeColumns={jest.fn()} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByText('AttributesSelectionList')).toBeInTheDocument();
    });
});
