// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {gqlCreateRecord, makeGraphQlCall} from '../e2eUtils';

describe('Forms', () => {
    const libraryId = 'forms_test_library';
    const libraryId2 = 'forms_test_library2';
    const fieldAttributeId = 'forms_test_attribute';
    const formName = 'test_form';
    const formName2 = 'test_other_form';
    let recordId;

    beforeAll(async () => {
        // Create libraries
        await makeGraphQlCall(`mutation {
            l1: saveLibrary(library: {
                id: "${libraryId}",
                label: {en: "Test lib"}
            }) { id },
            l2: saveLibrary(library: {
                id: "${libraryId2}",
                label: {en: "Test lib"}
            }) { id },
            a: saveAttribute(
                attribute: {
                    id: "${fieldAttributeId}",
                    type: simple,
                    format: text,
                    label: {en: "Test attr simple"}
                }
            ) {
                id
            }
        }`);

        recordId = await gqlCreateRecord(libraryId);
    });

    test('Create and update form', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName}"
                    library: "${libraryId}"
                    label: { en: "Formulaire édition" }
                    elements: [
                        {
                            elements: [
                                {
                                    id: "some_container"
                                    containerId: "${FORM_ROOT_CONTAINER_ID}"
                                    order: 0
                                    type: layout
                                    uiElementType: "fields_container"
                                    settings: []
                                },
                                {
                                    id: "123456"
                                    containerId: "some_container"
                                    order: 0
                                    uiElementType: "input"
                                    type: field
                                    settings: [
                                        {
                                            key: "attribute"
                                            value: "${fieldAttributeId}"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ) {
                id
                label
                elements {
                    elements {
                        id
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveForm.id).toBe(formName);
        expect(typeof res.data.data.saveForm.elements[0].elements).toBe('object');
    });

    test('Send error if unknown attribute', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName}"
                    library: "${libraryId}"
                    label: { en: "Formulaire édition" }
                    elements: [
                        {
                            elements: [
                                {
                                    id: "some_container"
                                    containerId: "${FORM_ROOT_CONTAINER_ID}"
                                    order: 0
                                    type: layout
                                    uiElementType: "fields_container"
                                    settings: []
                                },
                                {
                                    id: "123456"
                                    containerId: "some_container"
                                    order: 0
                                    uiElementType: "input"
                                    type: field
                                    settings: [
                                        {
                                            key: "attribute"
                                            value: "forms_unknown_attribute"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ) {
                id
                label
                elements {
                    elements {
                        id
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors[0].extensions.fields.elements).toBeDefined();
    });

    test('Handle 2 forms with same id on different libraries', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName}"
                    library: "${libraryId2}"
                    label: { en: "Formulaire édition" }
                }
            ) {
                id
                label
                library {
                    id
                }
                elements {
                    elements {
                        id
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveForm.id).toBe(formName);
        expect(res.data.data.saveForm.library.id).toBe(libraryId2);
    });

    test('Get form by ID', async () => {
        const res = await makeGraphQlCall(`{
            forms(filters: { library: "${libraryId}", id: "${formName}" }) {
                list {
                    id
                    label
                    library {
                        id
                        label
                    }
                    dependencyAttributes {
                        id
                    }
                    elements {
                        elements {
                            id
                        }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.forms.list).toHaveLength(1);
        expect(res.data.data.forms.list[0].id).toBe(formName);
    });

    test('Preserve settings when saving content', async () => {
        // Create form with elements
        await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName2}"
                    library: "${libraryId}"
                    label: { en: "Formulaire édition" }
                    elements: [
                        {
                            elements: [
                                {
                                    id: "some_container"
                                    containerId: "${FORM_ROOT_CONTAINER_ID}"
                                    order: 0
                                    type: layout
                                    uiElementType: "fields_container"
                                    settings: []
                                }
                            ]
                        }
                    ]
                }
            ) {
                id
            }
        }`);

        // Update withouth sending elements
        await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName2}"
                    library: "${libraryId}"
                    label: { en: "Formulaire édition modifié" }
                }
            ) {
                id
            }
        }`);

        // Elements should still be there
        const res = await makeGraphQlCall(`{
            forms(filters: { library: "${libraryId}", id: "${formName2}" }) {
                list {
                    id
                    label
                    library {
                        id
                        label
                    }
                    dependencyAttributes {
                        id
                    }
                    elements {
                        elements {
                            id
                        }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.forms.list).toHaveLength(1);
        expect(res.data.data.forms.list[0].id).toBe(formName2);
        expect(res.data.data.forms.list[0].elements).toBeDefined();
        expect(res.data.data.forms.list[0].elements.length).toBeGreaterThanOrEqual(1);
    });

    test('Get form by record', async () => {
        await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName}_for_record_form"
                    library: "${libraryId}"
                    label: { en: "Formulaire édition" }
                    elements: [
                        {
                            elements: [
                                {
                                    id: "some_container"
                                    containerId: "${FORM_ROOT_CONTAINER_ID}"
                                    order: 0
                                    type: layout
                                    uiElementType: "fields_container"
                                    settings: []
                                },
                                {
                                    id: "123456"
                                    containerId: "some_container"
                                    order: 0
                                    uiElementType: "input"
                                    type: field
                                    settings: [
                                        {
                                            key: "attribute"
                                            value: "${fieldAttributeId}"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ) {
                id
                label
                elements {
                    elements {
                        id
                    }
                }
            }
        }`);

        const res = await makeGraphQlCall(`{
            recordForm(recordId: "${recordId}", libraryId: "${libraryId}", formId: "${formName}_for_record_form") {
                id
                label
                library { id label }
                system
                elements {
                    id
                    containerId
                    order
                    uiElementType
                    settings { key value }
                    values {
                        id_value

                        ...on Value {
                          value
                          raw_value
                        }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.recordForm.id).toBe(`${formName}_for_record_form`);
        expect(res.data.data.recordForm.elements.length).toBe(2);
    });
});
