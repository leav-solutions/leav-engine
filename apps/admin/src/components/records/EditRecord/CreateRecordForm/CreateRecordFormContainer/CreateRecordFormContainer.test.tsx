// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {createRecordQuery} from '../../../../../queries/records/createRecordMutation';
import {getRecordDataQuery} from '../../../../../queries/records/recordDataQuery';
import {saveValueBatchQuery} from '../../../../../queries/values/saveValueBatchMutation';
import {IValue, RecordData} from '../../../../../_types/records';
import {mockAttrSimple} from '../../../../../__mocks__/attributes';
import {mockLibrary} from '../../../../../__mocks__/libraries';
import CreateRecordFormContainer from './CreateRecordFormContainer';

jest.mock(
    '../CreateRecordForm',
    () =>
        function CreateRecordForm() {
            return <div>CreateRecordForm</div>;
        }
);

jest.mock('../../../../../hooks/useLang');

describe('CreateRecordFormContainer', () => {
    test('Render form', async () => {
        const comp = mount(
            <MockedProvider>
                <CreateRecordFormContainer library={{...mockLibrary}} attributes={[{...mockAttrSimple}]} />
            </MockedProvider>
        );

        expect(comp.find('CreateRecordForm')).toHaveLength(1);
    });

    test('Calls onPostSave', async () => {
        const onPostSave = jest.fn();
        const attributes = [{...mockAttrSimple}];
        const recordDataQuery = getRecordDataQuery(attributes);
        const mocks = [
            {
                request: {
                    query: createRecordQuery,
                    variables: {library: 'products'}
                },
                result: {
                    data: {
                        createRecord: {
                            record: {
                                id: '1234567',
                                whoAmI: {
                                    __typename: 'RecordIdentity',
                                    id: '1234567',
                                    library: mockLibrary,
                                    label: null,
                                    color: null,
                                    preview: null
                                },
                                __typename: 'Record'
                            }
                        }
                    }
                }
            },
            {
                request: {
                    query: saveValueBatchQuery,
                    variables: {
                        library: 'products',
                        recordId: '1234567',
                        version: null,
                        values: [{attribute: 'simple_attribute', id_value: null, value: 'MyVal'}]
                    }
                },
                result: {
                    data: {
                        saveValueBatch: {
                            __typename: 'saveValueBatchResult',
                            values: [],
                            errors: null
                        }
                    }
                }
            },
            {
                request: {
                    query: recordDataQuery,
                    variables: {library: mockLibrary.id, id: '1234567', version: null, lang: ['fr', 'en']}
                },
                result: {
                    data: {
                        record: {
                            list: [
                                {
                                    id: '1234567',
                                    whoAmI: {
                                        id: '1234567',
                                        library: mockLibrary,
                                        label: null,
                                        color: null,
                                        preview: null
                                    },
                                    simple_attribute: {id_value: null, value: 'MyVal'},
                                    __typename: 'Record'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const comp = mount(
            <MockedProvider mocks={mocks}>
                <CreateRecordFormContainer
                    library={{...mockLibrary}}
                    attributes={[{...mockAttrSimple}]}
                    onPostSave={onPostSave}
                />
            </MockedProvider>
        );

        const saveFunc: (values: RecordData) => void = comp.find('CreateRecordForm').prop('onSave');

        if (!saveFunc) {
            return;
        }

        const valToSave: IValue = {
            id_value: null,
            value: 'MyVal',
            modified_at: null,
            created_at: null,
            raw_value: 'MyVal',
            version: null
        };

        await act(() =>
            saveFunc({
                simple_attribute: [valToSave]
            })
        );

        expect(onPostSave).toBeCalled();
    });
});
