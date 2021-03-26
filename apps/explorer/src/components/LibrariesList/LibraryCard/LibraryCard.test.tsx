// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {ILibrary} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryCard from './LibraryCard';

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn
}));

describe('LibraryCard', () => {
    const lib: ILibrary = {
        label: {
            en: 'label',
            fr: 'label'
        },
        id: 'id',
        gqlNames: {
            filter: 'IdFilter',
            query: 'Ids',
            searchableFields: 'IdSearchableFields'
        }
    };

    const mocks = [
        {
            request: {
                query: getLang
            },
            result: {
                data: {
                    lang: 'fr'
                }
            }
        }
    ];

    test('should display id', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <LibraryCard onUpdateFavorite={(s) => Promise.resolve()} lib={lib as ILibrary} active />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain('id');
    });
});
