import {makeGraphQlCall} from '../e2eUtils';

describe('Forms', () => {
    const libraryId = 'forms_test_library';
    const libraryId2 = 'forms_test_library2';
    const fieldAttributeId = 'forms_test_attribute';
    const formName = 'test_form';

    beforeAll(async () => {
        // Create libraries
        await makeGraphQlCall(`mutation {
            l1: saveLibrary(library: {
                id: "${libraryId}",
                label: {fr: "Test lib"}
            }) { id },
            l2: saveLibrary(library: {
                id: "${libraryId2}",
                label: {fr: "Test lib"}
            }) { id },
            a: saveAttribute(
                attribute: {
                    id: "${fieldAttributeId}",
                    type: simple,
                    format: text,
                    label: {fr: "Test attr simple"}
                }
            ) {
                id
            }
        }`);
    });

    test('Create and update form', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName}"
                    library: "${libraryId}"
                    label: { fr: "Formulaire édition" }
                    elements: [
                        {
                            elements: [
                                {
                                    id: "some_container"
                                    containerId: "__root"
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
                    label: { fr: "Formulaire édition" }
                    elements: [
                        {
                            elements: [
                                {
                                    id: "some_container"
                                    containerId: "__root"
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
                    label: { fr: "Formulaire édition" }
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
});
