import {wait} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {mockAttrAdv} from '../../../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import InfosTab from './InfosTab';

jest.mock(
    './InfosForm',
    () =>
        function InfosForm() {
            return <div>Infos form</div>;
        }
);
describe('InfosTab', () => {
    const variables = {
        attrData: {
            id: mockAttrAdv.id,
            label: {
                fr: mockAttrAdv.label.fr,
                en: mockAttrAdv.label.en
            },
            type: mockAttrAdv.type,
            format: mockAttrAdv.format,
            linked_tree: mockAttrAdv.linked_tree,
            linked_library: mockAttrAdv.linked_library,
            multiple_values: mockAttrAdv.multiple_values,
            versions_conf: {
                versionable: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.versionable : false,
                mode: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.mode : null,
                trees: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.trees : null
            }
        }
    };
    test('Render form', async () => {
        const comp = shallow(<InfosTab />);

        expect(comp.find('InfosForm')).toHaveLength(1);
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

        const comp = mount(
            <MockedProviderWithFragments mocks={mocks} addTypename>
                <InfosTab onPostSave={onPostSave} />
            </MockedProviderWithFragments>
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

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocksError} addTypename>
                    <InfosTab />
                </MockedProviderWithFragments>
            );
        });
        const submitFunc: any = comp.find('InfosForm').prop('onSubmitInfos');

        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({...mockAttrAdv});
                await wait(0);
            });

            comp.update();
        }

        expect(comp.find('InfosForm').prop('errors')).not.toBe(null);
    });
});
