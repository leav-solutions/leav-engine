// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {getViewsQuery} from '../../../queries/views/getViewsQuery';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import ViewSelector from './ViewSelector';

jest.mock('./ViewSelectorField', () => function ViewSelectorField() {
        return <div>ViewSelectorField</div>;
    });

describe('ViewSelector', () => {
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: getViewsQuery,
                    variables: {
                        library: 'test_lib'
                    }
                },
                result: {
                    data: {
                        views: {
                            __typename: 'ViewsList',
                            totalCount: 0,
                            list: [
                                {
                                    __typename: 'View',
                                    id: '123456',
                                    label: {fr: 'Test View'}
                                },
                                {
                                    __typename: 'View',
                                    id: '123457',
                                    label: {fr: 'Test View 2'}
                                }
                            ]
                        }
                    }
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <ViewSelector library="test_lib" />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('ViewSelectorField')).toHaveLength(1);
    });
    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: getViewsQuery
                },
                error: new Error('Boom!')
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <ViewSelector library="test_lib" />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('[data-test-id="error"]')).toHaveLength(1);
    });
});
