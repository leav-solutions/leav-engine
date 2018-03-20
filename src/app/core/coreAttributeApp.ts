import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IAttributeDomain} from 'domain/attributeDomain';
import {IAttribute} from '_types/attribute';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(attributeDomain: IAttributeDomain): ICoreLibraryApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    # Application Attribute
                    type Attribute {
                        id: ID,
                        type: String,
                        format: String,
                        system: Boolean,
                        label: SystemTranslation,
                        linked_library: String
                    }

                    input AttributeInput {
                        id: ID!
                        type: String!
                        format: String
                        label: SystemTranslationInput,
                        linked_library: String
                    }

                    extend type Query {
                        attributes(id: ID): [Attribute]
                    }

                    extend type Mutation {
                        saveAttribute(attribute: AttributeInput): Attribute
                        deleteAttribute(id: ID): Attribute
                    }

                `,
                resolvers: {
                    Query: {
                        async attributes(parent, args) {
                            return attributeDomain.getAttributes();
                        }
                    },
                    Mutation: {
                        async saveAttribute(parent, {attribute}): Promise<IAttribute> {
                            return attributeDomain.saveAttribute(attribute);
                        },
                        async deleteAttribute(parent, {id}): Promise<IAttribute> {
                            return attributeDomain.deleteAttribute(id);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
