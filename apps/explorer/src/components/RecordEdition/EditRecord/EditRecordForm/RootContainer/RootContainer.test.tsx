// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {getRecordPropertiesQuery} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import RootContainer from './RootContainer';

describe('RootContainer', () => {
    test('', async () => {
        let comp: any;

        const mocks = [
            {
                request: {
                    query: getRecordPropertiesQuery('record_libs', [])
                },
                result: {
                    data: {
                        record_libs: {
                            __typename: 'RecordLibs',
                            list: []
                        }
                    }
                }
            }
        ];

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <RootContainer record={mockRecordWhoAmI} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp);
    });
});
