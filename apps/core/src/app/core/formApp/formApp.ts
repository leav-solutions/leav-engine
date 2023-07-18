// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ConvertVersionFromGqlFormatFunc} from 'app/helpers/convertVersionFromGqlFormat';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IFormDomain} from 'domain/form/formDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IForm, IFormDependentElements, IFormElement, IRecordForm} from '_types/forms';
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
    IGetRecordFormArgs,
    ISaveFormArgs
} from './_types';

export interface ICoreFormApp {
    getGraphQLSchema(): IAppGraphQLSchema;
}

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.form'?: IFormDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.app.helpers.convertVersionFromGqlFormat'?: ConvertVersionFromGqlFormatFunc;
    'core.utils'?: IUtils;
}

export default function ({
    'core.domain.attribute': attributeDomain = null,
    'core.domain.form': formDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.app.helpers.convertVersionFromGqlFormat': convertVersionFromGqlFormat = null,
    'core.utils': utils = null
}: IDeps = {}) {
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

    const commonFormElementResolvers = {
        attribute: (formElement: IFormElement, _, ctx: IQueryInfos): Promise<IAttribute> => {
            const attributeId = formElement?.settings?.attribute;

            if (!attributeId) {
                return null;
            }

            return attributeDomain.getAttributeProperties({id: attributeId, ctx});
        },
        settings: (formElement: IFormElement, _, ctx: IQueryInfos) => {
            return Object.keys(formElement.settings ?? {}).map(async settingsKey => {
                const settingsValue =
                    settingsKey !== 'columns'
                        ? formElement.settings[settingsKey]
                        : await Promise.all(
                              formElement.settings[settingsKey].map(async columnId => {
                                  const columnAttributeProps = await attributeDomain.getAttributeProperties({
                                      id: columnId,
                                      ctx
                                  });
                                  return {
                                      id: columnAttributeProps.id,
                                      label: columnAttributeProps.label
                                  };
                              })
                          );

                return {
                    key: settingsKey,
                    value: settingsValue
                };
            });
        }
    };

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

                    type RecordForm {
                        id: ID!,
                        recordId: ID,
                        library: Library!,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        elements: [FormElementWithValues!]!,
                        dependencyAttributes: [Attribute!],
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
                        value: ID!
                    }

                    input FormDependencyValueInput {
                        attribute: ID!,
                        value: ID!
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

                    type FormElementWithValues {
                        id: ID!,
                        containerId: ID!,
                        order: Int!,
                        uiElementType: String!,
                        type: FormElementTypes!,
                        attribute: Attribute,
                        settings: [FormElementSettings!]!
                        values: [GenericValue!]
                        valueError: String
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

                        # Returns form specific to a record.
                        # Only relevant elements are present, dependencies and permissions are already applied
                        recordForm(
                            recordId: String,
                            libraryId: String!,
                            formId: String!,
                            version: [ValueVersionInput!],
                        ): RecordForm
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
                        ): Promise<IList<IForm>> {
                            return formDomain.getFormsByLib({
                                library: filters.library,
                                params: {
                                    filters,
                                    pagination,
                                    sort,
                                    withCount: true
                                },
                                ctx
                            });
                        },
                        async recordForm(
                            _,
                            {recordId, libraryId, formId, version}: IGetRecordFormArgs,
                            ctx: IQueryInfos
                        ): Promise<IRecordForm> {
                            const formattedVersion = convertVersionFromGqlFormat(version);
                            const recordForm = await formDomain.getRecordForm({
                                recordId,
                                libraryId,
                                formId,
                                version: formattedVersion,
                                ctx
                            });

                            return recordForm;
                        }
                    },
                    Mutation: {
                        async saveForm(_, {form}: ISaveFormArgs, ctx: IQueryInfos): Promise<IForm> {
                            const formattedForm = _convertFormFromGraphql(form);

                            return formDomain.saveForm({form: formattedForm, ctx});
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
                    RecordForm: {
                        library: (form: IForm, _, ctx: IQueryInfos): Promise<ILibrary> =>
                            libraryDomain.getLibraryProperties(form.library, ctx),
                        dependencyAttributes: (form: IForm, _, ctx: IQueryInfos): Promise<IAttribute[]> =>
                            Promise.all(
                                (form?.dependencyAttributes ?? []).map(depAttribute =>
                                    attributeDomain.getAttributeProperties({id: depAttribute, ctx})
                                )
                            )
                    },
                    FormElement: commonFormElementResolvers,
                    FormElementWithValues: commonFormElementResolvers
                }
            };
        }
    };
}
