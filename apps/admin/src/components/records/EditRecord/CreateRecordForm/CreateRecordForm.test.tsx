// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {createRecordQuery} from '../../../../queries/records/createRecordMutation';
import {saveValueBatchQuery} from '../../../../queries/values/saveValueBatchMutation';
import {mockAttrAdvMultiVal, mockAttrSimple} from '../../../../__mocks__/attributes';
import MockedLangContextProvider from '../../../../__mocks__/MockedLangContextProvider';
import CreateRecordForm from './CreateRecordForm';

jest.mock('../../../../hooks/useLang');

describe('RecordCreationModal', () => {
    const onSave = jest.fn();

    test('Render 2 attributes', async () => {
        const component = shallow(
            <CreateRecordForm
                attributes={{simple_attribute1: mockAttrSimple, simple_attribute2: mockAttrSimple}}
                onSave={onSave}
            />
        );

        expect(component.shallow().find('FormInput')).toHaveLength(2);
    });

    test('Add values on a multiple values field', async () => {
        const component = mount(
            <CreateRecordForm attributes={{advanced_attribute: mockAttrAdvMultiVal}} onSave={onSave} />
        );

        expect(component.find('FormInput[name="advanced_attribute"]')).toHaveLength(1);

        act(() => {
            component.find('Button[data-test-id="add_value_btn"]').simulate('click');
        });

        await wait(0);
        component.update();

        expect(component.find('FormInput[name="advanced_attribute"]')).toHaveLength(2);
    });

    test('Saves the values when submit called', async () => {
        const mocks = [
            {
                request: {
                    query: createRecordQuery,
                    variables: {library: 'products'}
                },
                result: {data: {createRecord: {id: '1234567'}}}
            },
            {
                request: {
                    query: saveValueBatchQuery,
                    variables: {
                        library: 'products',
                        recordId: '1234567',
                        version: null,
                        values: []
                    }
                },
                result: {
                    data: {
                        saveValueBatch: {
                            values: [],
                            errors: null
                        }
                    }
                }
            }
        ];

        const component = mount(
            <MockedLangContextProvider>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <CreateRecordForm
                        attributes={{simple_attribute1: mockAttrSimple, simple_attribute2: mockAttrSimple}}
                        onSave={onSave}
                    />
                </MockedProvider>
            </MockedLangContextProvider>
        );

        await act(async () => {
            await wait(0);
            const form = component.find('Form');
            form.simulate('submit');
        });

        await act(async () => {
            await wait(0);
            component.update();
        });

        expect(onSave).toHaveBeenCalled();
    });
});
