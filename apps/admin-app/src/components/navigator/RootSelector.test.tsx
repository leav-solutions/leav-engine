// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from '../../utils/testUtils';
import RootSelector, {QUERY} from './RootSelector';

const lang = ['fr', 'en'];
const DATAMOCK = [
    {
        request: {
            query: QUERY,
            variables: {lang}
        },
        result: {
            data: {
                libraries: {
                    list: [
                        {
                            id: '1',
                            label: 'l1'
                        },
                        {
                            id: '2',
                            label: 'l2'
                        },
                        {
                            id: '3',
                            label: 'l3'
                        }
                    ]
                }
            }
        }
    }
];

describe('<RootSelector/>', () => {
    const onSelect = () => undefined;

    describe('Query states', () => {
        test('loading renders a loader', async () => {
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={[]} addTypename={false}>
                        <RootSelector onSelect={onSelect} lang={lang} restrictToRoots={[]} />
                    </MockedProvider>
                );
            });
            expect(wrapper.find('Loading')).toHaveLength(1);
        });
        test('error state', async () => {
            const errorText = 'too bad';
            const ERRORMOCKS = [
                {
                    request: {
                        query: QUERY,
                        variables: {lang}
                    },
                    error: new Error(errorText)
                }
            ];
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={ERRORMOCKS} addTypename={false}>
                        <RootSelector onSelect={onSelect} lang={lang} restrictToRoots={[]} />
                    </MockedProvider>
                );
            });
            wrapper.update();
            expect(wrapper.find('[data-testid="error"]').text()).toContain(errorText);
        });
        test('loaded data state', async () => {
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={DATAMOCK} addTypename={false}>
                        <RootSelector onSelect={onSelect} lang={lang} restrictToRoots={[]} />
                    </MockedProvider>
                );
            });
            await act(async () => {
                await wait(0);
                wrapper.update();
            });
            const list = wrapper.find('RootSelectorElem');
            expect(list).toHaveLength(DATAMOCK[0].result.data.libraries.list.length);
        });
        test('Handles restrictToRoots prop', async () => {
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={DATAMOCK} addTypename={false}>
                        <RootSelector onSelect={onSelect} lang={lang} restrictToRoots={['1', '2']} />
                    </MockedProvider>
                );
            });
            await act(async () => {
                await wait(0);
                wrapper.update();
            });
            const list = wrapper.find('RootSelectorElem');
            expect(list).toHaveLength(2);
        });
    });
});
