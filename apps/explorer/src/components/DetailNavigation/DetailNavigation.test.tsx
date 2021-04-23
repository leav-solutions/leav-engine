// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {MockStateNavigation} from '../../__mocks__/Navigation/mockState';
import {mockTreeRecord} from '../../__mocks__/Navigation/mockTreeElements';
import DetailNavigation from './DetailNavigation';

jest.mock(
    '../LibraryItemsList/LibraryItemsListTable/RecordPreview',
    () =>
        function RecordPreview() {
            return <div>RecordPreview</div>;
        }
);

describe('DetailNavigation', () => {
    test('should display preview', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStateNavigation stateNavigation={{recordDetail: mockTreeRecord}}>
                    <MockedProviderWithFragments>
                        <MockStore>
                            <DetailNavigation />
                        </MockStore>
                    </MockedProviderWithFragments>
                </MockStateNavigation>
            );

            await wait();

            comp.update();
        });

        expect(comp.find('RecordPreview')).toHaveLength(1);
    });
});
