import {wait} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {mockAttrAdv, mockAttrAdvLink, mockAttrAdvMultiVal, mockAttrSimple} from '../../../../../__mocks__/attributes';
import EditRecordForm, {IEditRecordFormError} from './EditRecordForm';

jest.mock('./EditRecordFormLinks', () => {
    return function EditRecordFormLinks() {
        return <div>Links grid</div>;
    };
});

jest.mock('../../../../../hooks/useLang');

describe('EditRecordForm', () => {
    const onSave = jest.fn();
    const recordData = {
        simple_attribute: {
            attribute: 'simple_attribute',
            id_value: null,
            value: 'Val',
            raw_value: 'Val',
            modified_at: 1234567890,
            created_at: 1234567890,
            version: null
        },
        advanced_attribute: {
            attribute: 'advanced_attribute',
            id_value: '98765',
            value: 'Adv Val',
            raw_value: 'Adv Val',
            modified_at: 1234567890,
            created_at: 1234567890,
            version: null
        }
    };

    const errors: IEditRecordFormError = {
        simple_attribute: {
            type: 'VALIDATION_ERROR',
            attribute: 'simple_attribute',
            input: 'some value',
            message: 'Invalid format'
        }
    };

    test('Display attributes', async () => {
        const comp = shallow(
            <EditRecordForm
                attributes={[{...mockAttrSimple}, {...mockAttrAdv}]}
                recordData={recordData}
                onSave={onSave}
            />
        ).dive();

        expect(comp.find('FormInput[name="simple_attribute"]')).toHaveLength(1);
        expect(comp.find('FormInput[name="advanced_attribute"]')).toHaveLength(1);
        expect(comp.find('FormButton[type="submit"]')).toHaveLength(1);
    });

    test('Call submit function', async () => {
        const comp = shallow(
            <EditRecordForm
                attributes={[{...mockAttrSimple}, {...mockAttrAdv}]}
                recordData={recordData}
                onSave={onSave}
            />
        ).dive();

        comp.find('Form').simulate('submit');
        await wait(0);

        expect(onSave).toBeCalled();
    });

    test('Display attributes with errors', async () => {
        const comp = shallow(
            <EditRecordForm
                attributes={[{...mockAttrSimple}, {...mockAttrAdv}]}
                recordData={recordData}
                onSave={onSave}
                errors={errors}
            />
        ).dive();

        expect(
            comp
                .find('FormInput[name="simple_attribute"]')
                .parent()
                .prop('error')
        ).toBe('Invalid format');
    });

    test('Disable system attributes', async () => {
        const comp = shallow(
            <EditRecordForm
                attributes={[{...mockAttrSimple}, {...mockAttrAdv, system: true}]}
                recordData={recordData}
                onSave={onSave}
            />
        ).dive();

        expect(comp.find('FormInput[name="advanced_attribute"]').prop('disabled')).toBe(true);
    });

    test("Don't display submit button in modals", async () => {
        const comp = shallow(
            <EditRecordForm
                attributes={[{...mockAttrSimple}, {...mockAttrAdv, system: true}]}
                recordData={recordData}
                onSave={onSave}
                inModal
            />
        ).dive();

        expect(comp.find('FormButton[type="submit"]')).toHaveLength(0);
    });

    test('Display multiple values', async () => {
        const recordDataMultiVal = {
            advanced_attribute: [
                {
                    attribute: 'advanced_attribute',
                    id_value: '98765',
                    value: 'Adv Val',
                    raw_value: 'Adv Val',
                    modified_at: 1234567890,
                    created_at: 1234567890,
                    version: null
                },
                {
                    attribute: 'advanced_attribute',
                    id_value: '98766',
                    value: 'Adv Val2',
                    raw_value: 'Adv Val2',
                    modified_at: 1234567890,
                    created_at: 1234567890,
                    version: null
                }
            ]
        };

        const comp = shallow(
            <EditRecordForm attributes={[{...mockAttrAdvMultiVal}]} recordData={recordDataMultiVal} onSave={onSave} />
        ).dive();

        expect(comp.find('FormInput[name="advanced_attribute"]')).toHaveLength(2);
    });

    test('Add new values on empty values', async () => {
        const recordDataMultiVal = {
            advanced_attribute: [
                {
                    attribute: 'advanced_attribute',
                    id_value: '98765',
                    value: 'Adv Val',
                    raw_value: 'Adv Val',
                    modified_at: 1234567890,
                    created_at: 1234567890,
                    version: null
                },
                {
                    attribute: 'advanced_attribute',
                    id_value: '98766',
                    value: 'Adv Val2',
                    raw_value: 'Adv Val2',
                    modified_at: 1234567890,
                    created_at: 1234567890,
                    version: null
                }
            ]
        };

        const comp = mount(
            <EditRecordForm attributes={[{...mockAttrAdvMultiVal}]} recordData={recordDataMultiVal} onSave={onSave} />
        );

        const addValBtn = comp.find('Button[data-test-id="add_value_btn"]');

        addValBtn.simulate('click');

        expect(comp.find('FormInput[name="advanced_attribute"]')).toHaveLength(3);
    });

    test('Display link values', async () => {
        const recordDataLinkAttribute = {
            adv_link_attribute: [
                {
                    attribute: 'adv_link_attribute',
                    id_value: '98765',
                    value: {
                        id: '1',
                        whoAmI: {
                            id: '1',
                            library: {
                                id: 'test_lib',
                                label: {
                                    fr: 'Test Lib'
                                }
                            },
                            label: 'TestLabel',
                            color: null,
                            preview: null
                        }
                    },
                    raw_value: null,
                    modified_at: 1234567890,
                    created_at: 1234567890,
                    version: null
                },
                {
                    attribute: 'adv_link_attribute',
                    id_value: '98766',
                    value: {
                        id: '2',
                        whoAmI: {
                            id: '2',
                            library: {
                                id: 'test_lib',
                                label: {
                                    fr: 'Test Lib'
                                }
                            },
                            label: 'TestLabel2',
                            color: null,
                            preview: null
                        }
                    },
                    raw_value: null,
                    modified_at: 1234567890,
                    created_at: 1234567890,
                    version: null
                }
            ]
        };

        const comp = shallow(
            <EditRecordForm attributes={[{...mockAttrAdvLink}]} recordData={recordDataLinkAttribute} onSave={onSave} />
        ).dive();

        expect(comp.find('EditRecordFormLinks')).toHaveLength(1);
    });
});
