import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
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
                        <DetailNavigation />
                    </MockedProviderWithFragments>
                </MockStateNavigation>
            );
        });

        expect(comp.find('RecordPreview')).toHaveLength(1);
    });
});
