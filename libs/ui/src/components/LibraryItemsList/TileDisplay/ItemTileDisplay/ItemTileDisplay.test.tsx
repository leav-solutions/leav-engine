// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '_ui/antdTheme';
import {IItem} from '_ui/types/search';
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import {mockRecord} from '_ui/__mocks__/common/record';
import ItemTileDisplay from './ItemTileDisplay';

describe('ItemTileDisplay', () => {
    const itemMock: IItem = {
        fields: {},
        whoAmI: {
            ...mockRecord,
            id: 'test'
        },
        index: 0
    };

    test('should call RecordPreview', async () => {
        render(
            <MockSearchContextProvider>
                <ItemTileDisplay item={itemMock} />
            </MockSearchContextProvider>
        );

        expect(screen.getByAltText('record preview')).toBeInTheDocument();
    });

    test('Show checkerboard if transparency is active', async () => {
        render(
            <MockSearchContextProvider state={{showTransparency: true}}>
                <ItemTileDisplay item={itemMock} />
            </MockSearchContextProvider>
        );

        expect(screen.getByAltText('record preview')).toHaveStyle(`background: ${themeVars.checkerBoard}`);
    });
});
