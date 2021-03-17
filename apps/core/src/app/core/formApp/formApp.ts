// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IFormDomain} from 'domain/form/formDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IForm, IFormDependentElements, IFormElement} from '_types/forms';
import {IAppGraphQLSchema} from '_types/graphql';
import {ILibrary} from '_types/library';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {
    IDeleteFormArgs,
    IFormDependentElementsForGraphQL,
    IFormElementForGraphQL,
    IFormForGraphql,
    IGetFormArgs,
    ISaveFormArgs
} from './_types';

export interface ICoreFormApp {
    getGraphQLSchema(): IAppGraphQLSchema;
}

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.form'?: IFormDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.utils'?: IUtils;
}

export default function ({
    'core.domain.attribute': attributeDomain = null,
    'core.domain.form': formDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.utils': utils = null
}: IDeps = {}) {
    /** Functions to convert form to GraphQL format */
    const _convertFormToGraphql = (form: IForm): IFormForGraphql => {
        return {
            ...form,
            elements: Array.isArray(form.elements) ? form.elements.map(_convertElementsForGraphql) : []
        };
    };

    const _convertElementsForGraphql = (elementsWithDep: IFormDependentElements): IFormDependentElementsForGraphQL => {
        return {
            ...elementsWithDep,
            elements: elementsWithDep.elements.map(_convertElementSettingsToArray)
        };
    };

    const _convertElementSettingsToArray = (element: IFormElement): IFormElementForGraphQL => ({
        ...element,
        settings: utils.objToNameValArray(element.settings, 'key')
    });

    /** Functions to convert form from GraphQL format to IForm*/
    const _convertFormFromGraphql = (form: IFormForGraphql): IForm => {
        const formattedForm: IForm = {...form};

        if (typeof form.elements !== 'undefined') {
            formattedForm.elements = Array.isArray(form.elements) ? form.elements.map(_convertElementsFromGraphql) : [];
        }

        return formattedForm;
    };

    const _convertElementsFromGraphql = (
        elementsWithDep: IFormDependentElementsForGraphQL
    ): IFormDependentElements => ({
        ...elementsWithDep,
        elements: elementsWithDep.elements.map(_convertElementSettingsToObject)
    });

    const _convertElementSettingsToObject = (element: IFormElementForGraphQL): IFormElement => ({
        ...element,
        settings: utils.nameValArrayToObj(element.settings, 'key')
    });

    return {
        getGraphQLSchema(): IAppGraphQLSchema {
            return {
                typeDefs: `
                    enum FormElementTypes {
                        layout
                        field
                    }

                    type Form {
                        id: ID!,
                        library: Library!,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        dependencyAttributes: [Attribute!],
                        elements: [FormElementsByDeps!]!
                    }

                    input FormInput {
                        id: ID!,
                        library: ID!,
                        label: SystemTranslation,
                        dependencyAttributes: [ID!],
                        elements: [FormElementsByDepsInput!]
                    }

                    type FormDependencyValue {
                        attribute: ID!,
                        value: TreeElement!
                    }

                    input FormDependencyValueInput {
                        attribute: ID!,
                        value: TreeElementInput!
                    }

                    type FormElementsByDeps {
                        dependencyValue: FormDependencyValue,
                        elements: [FormElement!]!
                    }

                    input FormElementsByDepsInput {
                        dependencyValue: FormDependencyValueInput,
                        elements: [FormElementInput!]!
                    }

                    type FormElementSettings {
                        key: String!,
                        value: Any!
                    }

                    input FormElementSettingsInput {
                        key: String!,
                        value: Any!
                    }

                    type FormElement {
                        id: ID!,
                        containerId: ID!,
                        order: Int!,
                        uiElementType: String!,
                        type: FormElementTypes!,
                        attribute: Attribute,
                        settings: [FormElementSettings!]!
                    }

                    input FormElementInput {
                        id: ID!,
                        containerId: ID!,
                        order: Int!,
                        uiElementType: String!,
                        type: FormElementTypes!,
                        settings: [FormElementSettingsInput!]!
                    }

                    type FormsList {
                        totalCount: Int!,
                        list: [Form!]!
                    }

                    input FormFiltersInput {
                        library: ID!,
                        id: ID,
                        label: String,
                        system: Boolean
                    }

                    enum FormsSortableFields {
                        id
                        library
                        system
                    }

                    input SortForms {
                        field: FormsSortableFields!
                        order: SortOrder
                    }

                    extend type Query {
                        forms(
                            filters: FormFiltersInput!,
                            pagination: Pagination,
                            sort: SortForms
                        ): FormsList
                    }

                    extend type Mutation {
                        saveForm(form: FormInput!): Form
                        deleteForm(library: ID!, id: ID!): Form
                    }
                `,
                resolvers: {
                    Query: {
                        async forms(
                            _,
                            {filters, pagination, sort}: IGetFormArgs,
                            ctx: IQueryInfos
                        ): Promise<IList<IFormForGraphql>> {
                            const forms = await formDomain.getFormsByLib({
                                library: filters.library,
                                params: {
                                    filters,
                                    pagination,
                                    sort,
                                    withCount: true
                                },
                                ctx
                            });

                            // Convert elements settings to GraphQL format
                            const formattedForms = {
                                ...forms,
                                list: forms.list.map(_convertFormToGraphql)
                            };

                            return formattedForms;
                        }
                    },
                    Mutation: {
                        async saveForm(_, {form}: ISaveFormArgs, ctx: IQueryInfos): Promise<IFormForGraphql> {
                            const formattedForm = _convertFormFromGraphql(form);

                            const savedForm = await formDomain.saveForm({form: formattedForm, ctx});
                            return _convertFormToGraphql(savedForm);
                        },
                        async deleteForm(_, {library, id}: IDeleteFormArgs, ctx: IQueryInfos) {
                            return formDomain.deleteForm({library, id, ctx});
                        }
                    },
                    Form: {
                        library: (form: IForm, _, ctx: IQueryInfos): Promise<ILibrary> =>
                            libraryDomain.getLibraryProperties(form.library, ctx),
                        dependencyAttributes: (form: IForm, _, ctx: IQueryInfos): Promise<IAttribute[]> => {
                            return Promise.all(
                                form.dependencyAttributes.map(attr =>
                                    attributeDomain.getAttributeProperties({id: attr, ctx})
                                )
                            );
                        }
                    },
                    FormElement: {
                        attribute: (formElement: IFormElementForGraphQL, _, ctx: IQueryInfos): Promise<IAttribute> => {
                            const attributeSettings = formElement.settings.filter(
                                setting => setting.key === 'attribute'
                            )[0];
                            const attributeId = attributeSettings?.value;

                            if (!attributeId) {
                                return null;
                            }

                            return attributeDomain.getAttributeProperties({id: attributeId, ctx});
                        }
                    }
                }
            };
        }
    };
}
