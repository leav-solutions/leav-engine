// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IActiveLibrary} from '../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {initialActiveLibrary, useActiveLibrary} from './ActiveLibHook';

describe('ActiveLibHook', () => {
    const mockActiveLibrary: IActiveLibrary = {
        id: 'test',
        name: 'test',
        filter: 'test',
        gql: {
            searchableFields: 'test',
            query: 'test',
            type: 'test'
        },
        trees: []
    };
    test('should get empty library if no activeLibrary set', async () => {
        let givenActiveLibrary: any;

        const ComponentUsingNotification = () => {
            const [activeLibrary] = useActiveLibrary();

            givenActiveLibrary = activeLibrary;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenActiveLibrary).toEqual(initialActiveLibrary);
    });

    test('should get activeLibrary', async () => {
        let givenActiveLibrary: any;

        const ComponentUsingNotification = () => {
            const [activeLibrary, updateActiveLibrary] = useActiveLibrary();

            updateActiveLibrary(mockActiveLibrary);

            givenActiveLibrary = activeLibrary;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenActiveLibrary).toEqual(mockActiveLibrary);
    });
});
