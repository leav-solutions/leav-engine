// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider, MockedResponse} from '@apollo/client/testing';
import {mount} from 'enzyme';
import {wait} from 'utils/testUtils';
import {act, render, screen} from '_tests/testUtils';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {mockAttrAdv} from '../../../../../__mocks__/attributes';
import {getMockCacheWithFragments} from '../../../../../__mocks__/MockedProviderWithFragments/getMockCacheWithFragments';
import InfosTab from './InfosTab';

jest.mock('../../../../../hooks/useLang');

jest.mock(
    './InfosForm',
    () =>
        function InfosForm() {
            return <div>InfosForm</div>;
        }
);
describe('InfosTab', () => {
    const variables = {
        attrData: {
            id: mockAttrAdv.id,
            label: {
                fr: mockAttrAdv.label?.fr ?? '',
                en: mockAttrAdv.label?.en ?? ''
            },
            description: {
                fr: mockAttrAdv.description?.fr ?? '',
                en: mockAttrAdv.description?.en ?? ''
            },
            readonly: false,
            type: mockAttrAdv.type,
            format: mockAttrAdv.format,
            multiple_values: mockAttrAdv.multiple_values,
            linked_library: null,
            linked_tree: null,
            reverse_link: null,
            versions_conf: {
                versionable: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.versionable : false,
                mode: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.mode : null,
                profile: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.profile : null
            }
        }
    };

    test('Render form', async () => {
        await act(async () => {
            render(<InfosTab />);
        });

        expect(screen.getByText('InfosForm')).toBeInTheDocument();
    });

    test('Save data on submit and run onPostSave', async () => {
        const onPostSave = jest.fn();

        let saveQueryCalled = false;
        const mocks = [
            {
                request: {
                    query: saveAttributeQuery,
                    variables
                },
                result: () => {
                    saveQueryCalled = true;
                    return {
                        data: {
                            saveAttribute: {
                                ...mockAttrAdv,
                                __typename: 'Attribute',
                                versions_conf: null
                            }
                        }
                    };
                }
            }
        ];

        const mockCache = getMockCacheWithFragments();

        mockCache.writeQuery({
            query: getAttributesQuery,
            variables: {id: 'advanced_attribute'},
            data: {
                attributes: {
                    __typename: 'AttributesList',
                    totalCount: 1,
                    list: [
                        {
                            ...mockAttrAdv,
                            __typename: 'Attribute',
                            versions_conf: null
                        }
                    ]
                }
            }
        });

        const comp = mount(
            <MockedProvider mocks={mocks} addTypename>
                <InfosTab onPostSave={onPostSave} />
            </MockedProvider>
        );
        const submitFunc: any = comp.find('InfosForm').prop('onSubmitInfos');

        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({...mockAttrAdv});
                await wait(0);
            });
        }

        expect(saveQueryCalled).toBe(true);
        expect(onPostSave).toBeCalled();
    });

    test('Pass saving errors to form', async () => {
        const mocksError = [
            {
                request: {
                    query: saveAttributeQuery,
                    variables
                },
                result: {
                    errors: [
                        {
                            message: 'Error',
                            extensions: {
                                code: 'VALIDATION_ERROR',
                                fields: {id: 'invalid id'}
                            }
                        }
                    ]
                }
            }
        ];

        const mockCache = getMockCacheWithFragments();

        mockCache.writeQuery({
            query: getAttributesQuery,
            variables: {id: 'advanced_attribute'},
            data: {
                attributes: {
                    __typename: 'AttributesList',
                    totalCount: 1,
                    list: [
                        {
                            ...mockAttrAdv,
                            __typename: 'Attribute',
                            versions_conf: null
                        }
                    ]
                }
            }
        });

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={(mocksError as unknown) as MockedResponse[]} cache={mockCache} addTypename>
                    <InfosTab />
                </MockedProvider>
            );
        });
        const submitFunc: any = comp.find('InfosForm').prop('onSubmitInfos');

        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({...mockAttrAdv});
                await wait(0);
            });

            await act(async () => {
                comp.update();
            });
        }

        expect(comp.find('InfosForm').prop('errors')).not.toBe(null);
    });
});
