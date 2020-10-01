import {MockedProvider, MockedResponse, wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {deleteFormQuery} from '../../../../../queries/forms/deleteFormMutation';
import {getFormsQuery} from '../../../../../queries/forms/getFormsQuery';
import {mockFormLight} from '../../../../../__mocks__/forms';
import FormsTab from './FormsTab';

jest.mock('./FormsList', () => {
    return function FormsList() {
        return <div>FormsList</div>;
    };
});

jest.mock('./EditFormModal', () => {
    return function EditFormModal() {
        return <div>EditFormModal</div>;
    };
});

describe('FormsTab', () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: getFormsQuery,
                variables: {
                    library: 'my_lib'
                }
            },
            result: {
                data: {
                    forms: {__typename: 'FormsList', totalCount: 1, list: [{...mockFormLight, __typename: 'Form'}]}
                }
            }
        }
    ];

    test('Display list of forms', async () => {
        let comp;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks}>
                    <FormsTab libraryId="my_lib" />
                </MockedProvider>
            );
        });

        expect(comp.find('FormsList')).toHaveLength(1);
        expect(comp.find('FormsList').prop('loading')).toBe(true);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('FormsList').prop('loading')).toBe(false);
    });

    test('Error state', async () => {
        const errorMock = [
            {
                request: {
                    query: getFormsQuery,
                    variables: {
                        library: 'my_lib'
                    }
                },
                error: new Error('boom!')
            }
        ];

        let comp;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={errorMock}>
                    <FormsTab libraryId="my_lib" />
                </MockedProvider>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('div.error')).toHaveLength(1);
    });

    test('On filters update, re run query with filters', async () => {
        let filteredQueryCalled = false;
        const mocksWithCount: MockedResponse[] = [
            {
                request: {
                    query: getFormsQuery,
                    variables: {
                        library: 'my_lib'
                    }
                },
                result: {
                    data: {
                        forms: {
                            __typename: 'FormsList',
                            totalCount: 1,
                            list: {...mockFormLight, __typename: 'Form'}
                        }
                    }
                }
            },
            {
                request: {
                    query: getFormsQuery,
                    variables: {
                        library: 'my_lib',
                        id: '%foo%'
                    }
                },
                result: () => {
                    filteredQueryCalled = true;
                    return {
                        data: {
                            forms: {
                                __typename: 'FormsList',
                                totalCount: 1,
                                list: {...mockFormLight, __typename: 'Form'}
                            }
                        }
                    };
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocksWithCount}>
                    <FormsTab libraryId="my_lib" />
                </MockedProvider>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        const filtersChangeFunc: any = comp.find('FormsList').prop('onFiltersChange');

        if (!!filtersChangeFunc) {
            await act(async () => {
                await filtersChangeFunc({name: 'id', value: 'foo'});
                await wait(0);
            });
        }

        comp.update();
        expect(filteredQueryCalled).toBe(true);
    });

    describe('Edition', () => {
        let comp;
        beforeAll(async () => {
            await act(async () => {
                comp = mount(
                    <MockedProvider mocks={mocks}>
                        <FormsTab libraryId="my_lib" />
                    </MockedProvider>
                );
            });

            await act(async () => {
                await wait(0);
                comp.update();
            });
        });

        test('On click on a form from the list, open form edition with form ID', async () => {
            const rowClickFunc: any = comp.find('FormsList').prop('onRowClick');

            if (!!rowClickFunc) {
                act(() => {
                    rowClickFunc('my_form');
                });
            }
            comp.update();

            expect(comp.find('EditFormModal')).toHaveLength(1);
            expect(comp.find('EditFormModal').prop('formId')).toBe('my_form');
        });

        test('On click on new form, open form edition for new form', async () => {
            const createFunc: any = comp.find('FormsList').prop('onCreate');

            if (!!createFunc) {
                act(() => {
                    createFunc();
                });
            }
            comp.update();

            expect(comp.find('EditFormModal')).toHaveLength(1);
            expect(comp.find('EditFormModal').prop('formId')).toBe(null);
        });
    });

    test('Delete form', async () => {
        let deleteMutationCalled = false;
        const mocksWithDelete: MockedResponse[] = [
            ...mocks,
            {
                request: {
                    query: deleteFormQuery,
                    variables: {
                        library: 'my_lib',
                        formId: 'my_form'
                    }
                },
                result: () => {
                    deleteMutationCalled = true;
                    return {
                        data: {
                            deleteForm: {
                                __typename: 'Form',
                                id: 'my_form',
                                library: {
                                    __typename: 'Library',
                                    id: 'my_lib'
                                }
                            }
                        }
                    };
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocksWithDelete}>
                    <FormsTab libraryId="my_lib" />
                </MockedProvider>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });
        const deleteFunc: any = comp.find('FormsList').prop('onDelete');

        if (!!deleteFunc) {
            await act(async () => {
                await deleteFunc('my_form');
            });
        }

        expect(deleteMutationCalled).toBe(true);
    });
});
