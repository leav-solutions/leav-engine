import {IAppGraphQLSchema} from 'app/graphql/graphqlApp';
import {IFormDomain} from 'domain/form/formDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {GraphQLScalarType} from 'graphql';
import {IUtils} from 'utils/utils';
import {IForm} from '_types/forms';
import {validateFormFields, validateFormLayout} from './helpers/confValidation';

export interface ICoreFormApp {
    getGraphQLSchema(): IAppGraphQLSchema;
}

interface IDeps {
    'core.domain.form'?: IFormDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.utils'?: IUtils;
}

export default function({
    'core.domain.form': formDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.utils': utils = null
}: IDeps = {}) {
    return {
        getGraphQLSchema(): IAppGraphQLSchema {
            return {
                typeDefs: `
                    scalar FormLayout
                    scalar FormFields

                    type Form {
                        id: ID!,
                        library: Library!,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        dependencyAttributes: [Attribute],
                        layout: FormLayout,
                        fields: FormFields
                    }

                    input FormInput {
                        id: ID!,
                        library: ID!,
                        label: SystemTranslationInput,
                        dependencyAttributes: [ID!],
                        layout: FormLayout,
                        fields: FormFields
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
                        async forms(_, {filters, pagination, sort}) {
                            return formDomain.getFormsByLib(filters.library, {filters, pagination, sort});
                        }
                    },
                    Mutation: {
                        async saveForm(_, {form}, ctx) {
                            return formDomain.saveForm(form, ctx);
                        },
                        async deleteForm(_, {library, id}, ctx) {
                            return formDomain.deleteForm(library, id, ctx);
                        }
                    },
                    Form: {
                        library: (form: IForm) => libraryDomain.getLibraryProperties(form.library)
                    },
                    FormLayout: new GraphQLScalarType({
                        name: 'FormLayout',
                        description: 'Form Layout',
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: (ast, variables) => {
                            const parsedVal = utils.graphqlParseLiteral('JSON', ast, variables);
                            validateFormLayout(parsedVal);
                            return parsedVal;
                        }
                    }),
                    FormFields: new GraphQLScalarType({
                        name: 'FormFields',
                        description: 'Form fields',
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: (ast, variables) => {
                            const parsedVal = utils.graphqlParseLiteral('JSON', ast, variables);
                            validateFormFields(parsedVal);
                            return parsedVal;
                        }
                    })
                }
            };
        }
    };
}
