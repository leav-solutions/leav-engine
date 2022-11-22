// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render} from '_tests/testUtils';
import {mockLibraryPermissions} from '__mocks__/common/library';
import {IActiveLibrary} from '../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {initialActiveLibrary, useActiveLibrary} from './ActiveLibHook';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';

describe('ActiveLibHook', () => {
    const mockActiveLibrary: IActiveLibrary = {
        id: 'test',
        name: 'test',
        filter: 'test',
        attributes: [],
        gql: {
            searchableFields: 'test',
            query: 'test',
            type: 'test'
        },
        trees: [],
        permissions: mockLibraryPermissions
    };

    test('should get empty library if no activeLibrary set', async () => {
        let givenActiveLibrary: any;

        const ComponentUsingInfo = () => {
            const [activeLibrary] = useActiveLibrary();

            givenActiveLibrary = activeLibrary;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingInfo />);
        });

        expect(givenActiveLibrary).toEqual(initialActiveLibrary);
    });

    test('should get activeLibrary', async () => {
        let givenActiveLibrary;

        const ComponentUsingInfo = () => {
            const [activeLibrary, updateActiveLibrary] = useActiveLibrary();

            updateActiveLibrary(mockActiveLibrary);

            givenActiveLibrary = activeLibrary;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingInfo />);
        });

        expect(givenActiveLibrary).toEqual(mockActiveLibrary);
    });
});
