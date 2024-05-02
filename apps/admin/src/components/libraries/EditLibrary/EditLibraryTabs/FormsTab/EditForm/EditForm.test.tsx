// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {getFormQuery} from '../../../../../../queries/forms/getFormQuery';
import {mockFormFull} from '../../../../../../__mocks__/forms';
import MockedProviderWithFragments from '../../../../../../__mocks__/MockedProviderWithFragments';
import EditForm from './EditForm';
import {formDataWithTypename} from './EditFormTabs/ContentTab/formBuilderReducer/_fixtures/fixtures';

jest.mock('./EditFormTabs', () => function EditFormTabs() {
        return <div>EditFormTabs</div>;
    });

describe('EditForm', () => {
    test('Loading and success', async () => {
        let comp;

        const mocks = [
            {
                request: {
                    query: getFormQuery,
                    variables: {library: 'test_lib', id: 'test_form'}
                },
                result: {
                    data: {
                        forms: {
                            __typename: 'FormsList',
                            totalCount: 1,
                            list: [formDataWithTypename]
                        }
                    }
                }
            }
        ];

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <EditForm formId="test_form" libraryId="test_lib" readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('Loading')).toHaveLength(0);
        expect(comp.find('EditFormTabs')).toHaveLength(1);
    });

    test('Error state', async () => {
        let comp;

        const mocks = [
            {
                request: {
                    query: getFormQuery,
                    variables: {library: 'test_lib', id: 'test_form_full'}
                },
                error: new Error('boom!')
            }
        ];

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <EditForm formId="test_form" libraryId="test_lib" readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('Loading')).toHaveLength(0);
        expect(comp.find('[data-test-id="error"]')).toHaveLength(1);
    });

    test("If no form ID, don't load data", async () => {
        let comp;

        let mockDataUsed = false;
        const mocks = [
            {
                request: {
                    query: getFormQuery,
                    variables: {library: 'test_lib', id: 'test_form_full'}
                },
                result: () => {
                    mockDataUsed = true;
                    return {
                        data: {
                            forms: {
                                __typename: 'FormsList',
                                totalCount: 1,
                                list: [
                                    {
                                        ...mockFormFull,
                                        __typename: 'Form'
                                    }
                                ]
                            }
                        }
                    };
                }
            }
        ];

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <EditForm formId={null} libraryId="test_lib" readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(0);
        expect(comp.find('EditFormTabs')).toHaveLength(1);
        expect(mockDataUsed).toBe(false);
    });
});
