// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibraryByIdWithAttributes} from 'queries/libraries/getLibraryByIdWithAttributes';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockAttrSimple} from '__mocks__/attributes';
import MainPanel from './MainPanel';
import {ActionTypes, initialState} from './NavigatorReducer';

const lang = ['fr'];
export const dataMock = [
    {
        request: {
            query: getLibraryByIdWithAttributes,
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
const errorMocks = [
    {
        request: {
            query: getLibraryByIdWithAttributes,
            variables: {
                id: 'test',
                lang
            }
        },
        error: new Error(errorText)
    }
];

jest.mock('./TopPanel', () => function TopPanel() {
        return <div>TopPanel</div>;
    });

jest.mock('./FiltersPanel', () => function FiltersPanel() {
        return <div>FiltersPanel</div>;
    });

jest.mock('./ListPanel', () => function ListPanel() {
        return <div>ListPanel</div>;
    });

describe('<MainPanel />', () => {
    describe('Query states', () => {
        const state = {
            ...initialState,
            selectedRoot: 'test',
            lang
        };
        const dispatch = () => undefined;
        test('loading renders a loader', async () => {
            render(<MainPanel state={state} dispatch={dispatch} />, {apolloMocks: dataMock});

            expect(screen.getByText(/loading/)).toBeInTheDocument();
        });

        test('error state', async () => {
            render(<MainPanel state={state} dispatch={dispatch} />, {apolloMocks: errorMocks});

            expect(await screen.findByText(errorText)).toBeInTheDocument();
        });

        test('data state trigger dispatch', async () => {
            const mockDispatch = jest.fn(() => undefined);
            render(<MainPanel state={state} dispatch={mockDispatch} />, {apolloMocks: dataMock});

            await waitFor(() => expect(mockDispatch.mock.calls.length).toBe(1));

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
            selectedRootAttributes: [
                {
                    ...mockAttrSimple,
                    id: 'a1',
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

        render(<MainPanel state={state} dispatch={dispatch} />, {apolloMocks: dataMock});

        expect(await screen.findByText('TopPanel')).toBeInTheDocument();
        expect(await screen.findByText('ListPanel')).toBeInTheDocument();
    });
});
