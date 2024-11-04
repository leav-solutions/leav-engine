// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount, ReactWrapper} from 'enzyme';
import {getLibsQuery} from 'queries/libraries/getLibrariesQuery';
import {act} from 'react-dom/test-utils';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {wait} from '../../utils/testUtils';
import RootSelector from './RootSelector';

const lang = ['fr', 'en'];
const dataMock = [
    {
        request: {
            query: getLibsQuery,
            variables: {}
        },
        result: {
            data: {
                libraries: {
                    totalCount: 3,
                    list: [
                        {
                            id: '1',
                            label: 'l1',
                            system: false,
                            behavior: LibraryBehavior.standard,
                            icon: null
                        },
                        {
                            id: '2',
                            label: 'l2',
                            system: false,
                            behavior: LibraryBehavior.standard,
                            icon: null
                        },
                        {
                            id: '3',
                            label: 'l3',
                            system: false,
                            behavior: LibraryBehavior.standard,
                            icon: null
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
        beforeEach(() => {
            jest.clearAllMocks();
        });

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
            const errorMocks = [
                {
                    request: {
                        query: getLibsQuery
                    },
                    error: new Error(errorText)
                }
            ];
            let wrapper: ReactWrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={errorMocks} addTypename={false}>
                        <RootSelector onSelect={onSelect} lang={lang} restrictToRoots={[]} />
                    </MockedProvider>
                );
            });

            await act(async () => {
                await wait(0);
                wrapper.update();
            });

            expect(wrapper.find('[data-testid="error"]').text()).toContain(errorText);
        });

        test('loaded data state', async () => {
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={dataMock} addTypename={false}>
                        <RootSelector onSelect={onSelect} lang={lang} restrictToRoots={[]} />
                    </MockedProvider>
                );
            });
            await act(async () => {
                await wait(0);
                wrapper.update();
            });
            const list = wrapper.find('RootSelectorElem');
            expect(list).toHaveLength(dataMock[0].result.data.libraries.list.length);
        });

        test('Handles restrictToRoots prop', async () => {
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={dataMock} addTypename={false}>
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
