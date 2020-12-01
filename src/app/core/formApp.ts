import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IFormDomain} from 'domain/form/formDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IUtils} from 'utils/utils';
import {IForm} from '_types/forms';
import {IAppGraphQLSchema} from '_types/graphql';

export interface ICoreFormApp {
    getGraphQLSchema(): IAppGraphQLSchema;
}

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.form'?: IFormDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.utils'?: IUtils;
}

const _convertFormToGraphql = (form: IForm) => {
    const formattedForm = {...form};
    formattedForm.elements = Array.isArray(form.elements)
        ? form.elements.map(elemsWithDep => {
              return {
                  ...elemsWithDep,
                  elements: elemsWithDep.elements.map(el => ({
                      ...el,
                      settings: Object.entries(el.settings).map(([key, value]) => ({
                          key,
                          value
                      }))
                  }))
              };
          })
        : [];

    return formattedForm;
};

export default function({
    'core.domain.attribute': attributeDomain = null,
    'core.domain.form': formDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.utils': utils = null
}: IDeps = {}) {
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
                        async forms(_, {filters, pagination, sort}, ctx) {
                            // Convert elements settings to GraphlQL format
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

                            const formattedForms = {
                                ...forms,
                                list: forms.list.map(_convertFormToGraphql)
                            };

                            return formattedForms;
                        }
                    },
                    Mutation: {
                        async saveForm(_, {form}, ctx) {
                            const formattedForm = {...form};
                            formattedForm.elements = Array.isArray(form.elements)
                                ? form.elements.map(elemsWithDep => {
                                      return {
                                          ...elemsWithDep,
                                          elements: elemsWithDep.elements.map(el => {
                                              return {
                                                  ...el,
                                                  settings: el.settings.reduce(
                                                      (acc, cur) => ({
                                                          ...acc,
                                                          [cur.key]: cur.value
                                                      }),
                                                      {}
                                                  )
                                              };
                                          })
                                      };
                                  })
                                : [];

                            const savedForm = await formDomain.saveForm({form: formattedForm, ctx});

                            return _convertFormToGraphql(savedForm);
                        },
                        async deleteForm(_, {library, id}, ctx) {
                            return formDomain.deleteForm({library, id, ctx});
                        }
                    },
                    Form: {
                        library: (form: IForm, _, ctx) => libraryDomain.getLibraryProperties(form.library, ctx),
                        dependencyAttributes: (form: IForm, _, ctx) => {
                            return Promise.all(
                                form.dependencyAttributes.map(attr =>
                                    attributeDomain.getAttributeProperties({id: attr, ctx})
                                )
                            );
                        }
                    }
                }
            };
        }
    };
}
