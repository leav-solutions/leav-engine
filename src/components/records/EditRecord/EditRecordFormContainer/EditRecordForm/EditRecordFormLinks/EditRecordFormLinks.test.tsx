import {shallow} from 'enzyme';
import React from 'react';
import {mockAttrAdvLink, mockAttrTreeMultival} from '../../../../../../__mocks__/attributes';
import EditRecordFormLinks from './EditRecordFormLinks';

jest.mock('./EditRecordFormLinksElement', () => {
    return function EditRecordFormLinksElement() {
        return <div data-test-id="record_links_element" />;
    };
});

jest.mock('./EditRecordFormLinksTreeElement', () => {
    return function EditRecordFormLinksTreeElement() {
        return <div data-test-id="record_links_element" />;
    };
});

jest.mock('../../../../../../hooks/useLang');

describe('EditRecordFormLinks', () => {
    const linkValues = [
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
    ];

    const treeValues = [
        {
            attribute: 'adv_link_attribute',
            id_value: '98765',
            value: {
                record: {
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
                ancestors: [
                    {
                        record: {
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
                        }
                    }
                ]
            },
            raw_value: null,
            modified_at: 1234567890,
            created_at: 1234567890,
            version: null
        }
    ];

    const onChange = jest.fn();

    test('Display table with links values', async () => {
        const comp = shallow(
            <EditRecordFormLinks values={linkValues} attribute={{...mockAttrAdvLink}} onChange={onChange} />
        );

        expect(comp.find('[data-test-id="link_values"]')).toHaveLength(1);
        expect(comp.find('[data-test-id="link_values"] EditRecordFormLinksElement')).toHaveLength(2);
        expect(comp.find('[data-test-id="elements_count"]').text()).toContain('2');
    });

    test('Display table with tree links values', async () => {
        const comp = shallow(
            <EditRecordFormLinks values={treeValues} attribute={mockAttrTreeMultival} onChange={onChange} />
        );

        expect(comp.find('[data-test-id="link_values"] EditRecordFormLinksTreeElement')).toHaveLength(1);
    });

    test('Delete link', async () => {
        const comp = shallow(
            <EditRecordFormLinks values={linkValues} attribute={{...mockAttrAdvLink}} onChange={onChange} />
        );

        expect(comp.find('[data-test-id="link_values"] EditRecordFormLinksElement')).toHaveLength(2);

        const onDeleteFunc: (value) => void = comp
            .find('[data-test-id="link_values"] EditRecordFormLinksElement')
            .first()
            .prop('onDeleteLink');

        if (onDeleteFunc) {
            onDeleteFunc(linkValues[0]);
        }

        expect(onChange).toBeCalledWith({
            attribute: 'adv_link_attribute',
            id_value: '98765',
            value: null,
            raw_value: null,
            modified_at: 1234567890,
            created_at: 1234567890,
            version: null
        });
    });

    test("Don't display null values (= deleted)", async () => {
        const valuesWithNull = [
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
                value: null,
                raw_value: null,
                modified_at: 1234567890,
                created_at: 1234567890,
                version: null
            }
        ];

        const comp = shallow(
            <EditRecordFormLinks values={valuesWithNull} attribute={{...mockAttrAdvLink}} onChange={onChange} />
        );

        expect(comp.find('[data-test-id="link_values"] EditRecordFormLinksElement')).toHaveLength(1);
    });
});
