// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {act, render, screen} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {IItem} from '../../../../_types/types';
import ItemTileDisplay from './ItemTileDisplay';

describe('ItemTileDisplay', () => {
    const itemMock: IItem = {
        fields: {},
        whoAmI: {
            ...mockRecordWhoAmI,
            id: 'test'
        },
        index: 0
    };

    test('should call RecordPreview', async () => {
        await act(async () => {
            render(<ItemTileDisplay item={itemMock} />);
        });

        expect(screen.getByAltText('record preview')).toBeInTheDocument();
    });

    test('Show checkerboard if app is in transparency mode', async () => {
        await act(async () => {
            render(<ItemTileDisplay item={itemMock} />, {
                currentApp: {...mockApplicationDetails, settings: {showTransparency: true}}
            });
        });

        expect(screen.getByAltText('record preview')).toHaveStyle(`background: ${themeVars.checkerBoard}`);
    });
});
