import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter} from 'react-router-dom';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import SideBarMenu from './SideBarMenu';

jest.mock(
    './SideBarLibraryList',
    () =>
        function SideBarLibraryList() {
            return <>SideBarLibraryList</>;
        }
);

describe('SideBarMenu', () => {
    const mockCache = new InMemoryCache();

    mockCache.writeQuery({
        query: getActiveLibrary,
        data: {
            activeLibId: 'testLibId',
            activeLibQueryName: 'testLibQueryName',
            activeLibName: 'testLibName',
            activeLibFilterName: 'testLibFilterName'
        }
    });

    test('should show activeLib content', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProvider cache={mockCache}>
                    <BrowserRouter>
                        <SideBarMenu visible={true} hide={jest.fn()} />
                    </BrowserRouter>
                </MockedProvider>
            );
        });

        expect(comp.find('Men.Item'));
        expect(comp.text()).toContain('testLibName');
    });
});
