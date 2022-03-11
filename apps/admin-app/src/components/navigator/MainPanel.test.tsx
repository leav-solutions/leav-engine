// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from '../../utils/testUtils';
import {AttributeFormat, AttributeType} from '../../_gqlTypes/globalTypes';
import MainPanel, {QUERY_LIBRARY_CONFIG} from './MainPanel';
import {ActionTypes, initialState} from './NavigatorReducer';

const lang = ['fr'];
export const DATAMOCK = [
    {
        request: {
            query: QUERY_LIBRARY_CONFIG,
            variables: {
                id: 'test',
                lang
            }
        },
        result: {
            data: {
                libraries: {
                    list: [
                        {
                            id: '1',
                            label: {
                                fr: 'l1'
                            },
                            gqlNames: {
                                query: 'q1',
                                filter: 'f1'
                            },
                            attributes: [
                                {
                                    id: 'a1',
                                    type: '',
                                    format: '',
                                    label: {
                                        fr: 'labela1'
                                    }
                                },
                                {
                                    id: 'a2',
                                    type: '',
                                    format: '',
                                    label: {
                                        fr: 'labela2'
                                    }
                                }
                            ]
                        },
                        {
                            id: '2',
                            label: {
                                fr: 'l2'
                            },
                            gqlNames: {
                                query: 'q2',
                                filter: 'f2'
                            },
                            attributes: [
                                {
                                    id: 'a1',
                                    type: '',
                                    format: '',
                                    label: {
                                        fr: 'labela1'
                                    }
                                },
                                {
                                    id: 'a2',
                                    type: '',
                                    format: '',
                                    label: {
                                        fr: 'labela2'
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
];
const errorText = 'too bad';
const ERRORMOCKS = [
    {
        request: {
            query: QUERY_LIBRARY_CONFIG,
            variables: {
                id: 'test',
                lang
            }
        },
        error: new Error(errorText)
    }
];
describe('<MainPanel />', () => {
    describe('Query states', () => {
        const state = {
            ...initialState,
            selectedRoot: 'test',
            lang
        };
        const dispatch = () => undefined;
        test('loading renders a loader', async () => {
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={[]} addTypename={false}>
                        <MainPanel state={state} dispatch={dispatch} />
                    </MockedProvider>
                );
            });
            expect(wrapper.find('Loading')).toHaveLength(1);
        });
        test('error state', async () => {
            let wrapper;
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={ERRORMOCKS} addTypename={false}>
                        <MainPanel state={state} dispatch={dispatch} />
                    </MockedProvider>
                );
            });
            wrapper.update();
            expect(wrapper.find('[data-testid="error"]').text()).toContain(errorText);
        });
        test('data state trigger dispatch', async () => {
            let wrapper;
            const mockDispatch = jest.fn(() => undefined);
            await act(async () => {
                wrapper = mount(
                    <MockedProvider mocks={DATAMOCK} addTypename={false}>
                        <MainPanel state={state} dispatch={mockDispatch} />
                    </MockedProvider>
                );
            });
            await act(async () => {
                wrapper.update();
            });
            await wait(1);
            expect(mockDispatch.mock.calls.length).toBe(1);
            const mockCall = mockDispatch.mock.calls[0];
            expect(mockCall.length).toBe(1);
            // @ts-ignore : mockCall may be empty, handled on previous expect
            const firstArg = mockCall[0];
            expect(firstArg).toHaveProperty('type');
            // @ts-ignore : firstArg may not have type property, handled on previous expect
            expect(firstArg.type).toBe(ActionTypes.SET_ROOT_INFOS);
        });
    });
    test('Renders elements', async () => {
        const dispatch = () => undefined;
        const state = {
            ...initialState,
            selectedRoot: 'test',
            selectedRootQuery: 'querytest',
            selectedRootAttributes: [
                {
                    id: 'a1',
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    system: false,
                    linked_library: null,
                    linked_tree: null,
                    multiple_values: false,
                    permissions_conf: null,
                    versions_conf: null,
                    metadata_fields: null,
                    label: {
                        fr: 'labela1'
                    },
                    description: {
                        fr: 'description'
                    }
                }
            ],
            lang
        };
        let wrapper;
        await act(async () => {
            wrapper = shallow(<MainPanel state={state} dispatch={dispatch} />);
        });
        expect(wrapper.find('TopPanel')).toHaveLength(1);
        expect(wrapper.find('FiltersPanel')).toHaveLength(1);
        expect(wrapper.find('ListPanel')).toHaveLength(1);
    });
});
