import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {IAttributeDomain} from 'domain/attributeDomain';
import {IAttribute, AttributeTypes, AttributeFormats} from '../../_types/attribute';

export interface ICoreAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    getGraphQLFormat(attribute: IAttribute): string;
}

export default function(attributeDomain: IAttributeDomain, graphqlApp: IGraphqlApp): ICoreAttributeApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const attributes = await attributeDomain.getAttributes();

            const baseSchema = {
                typeDefs: `
                    enum AttributeId {
                        ${attributes.map(attr => attr.id).join(' ')}
                    }

                    enum AttributeType {
                        ${Object.values(AttributeTypes).join(' ')}
                    }

                    enum AttributeFormat {
                        ${Object.values(AttributeFormats).join(' ')}
                    }

                    # Application Attribute
                    type Attribute {
                        id: ID,
                        type: AttributeType,
                        format: AttributeFormat,
                        system: Boolean,
                        label: SystemTranslation,
                        linked_library: String
                    }

                    input AttributeInput {
                        id: ID!
                        type: AttributeType!
                        format: AttributeFormat
                        label: SystemTranslationInput,
                        linked_library: String
                    }

                    extend type Query {
                        attributes(id: AttributeId): [Attribute]
                    }

                    extend type Mutation {
                        saveAttribute(attribute: AttributeInput): Attribute
                        deleteAttribute(id: AttributeId): Attribute
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
                            const savedAttr = await attributeDomain.saveAttribute(attribute);
                            graphqlApp.generateSchema();

                            return savedAttr;
                        },
                        async deleteAttribute(parent, {id}): Promise<IAttribute> {
                            const deletedAttr = await attributeDomain.deleteAttribute(id);
                            graphqlApp.generateSchema();

                            return deletedAttr;
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        getGraphQLFormat(attribute: IAttribute): string {
            if (attribute.id === 'id') {
                return 'ID';
            } else if (
                attribute.type === AttributeTypes.SIMPLE_LINK ||
                attribute.type === AttributeTypes.ADVANCED_LINK
            ) {
                return 'linkValue';
            } else {
                return 'Value';
            }
        }
    };
}
