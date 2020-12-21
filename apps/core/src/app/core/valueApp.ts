// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {GraphQLScalarType} from 'graphql';
import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema} from '_types/graphql';
import {IValue, IValueVersion} from '_types/value';
import {AttributeTypes} from '../../_types/attribute';
import {IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreValueApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.utils'?: IUtils;
}

export default function ({
    'core.domain.value': valueDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.app.graphql': graphqlApp = null,
    'core.utils': utils = null
}: IDeps = {}): ICoreValueApp {
    const _convertVersionToGqlFormat = (version: IValueVersion) => {
        const versionsNames = Object.keys(version);
        const formattedVersion = [];

        for (const versName of versionsNames) {
            formattedVersion.push({
                name: versName,
                value: {
                    library: version[versName].library,
                    id: version[versName].id
                }
            });
        }

        return formattedVersion;
    };

    const _convertVersionFromGqlFormat = (version: any): IValueVersion => {
        return Array.isArray(version) && version.length
            ? version.reduce((formattedVers, valVers) => {
                  formattedVers[valVers.name] = valVers.value;

                  return formattedVers;
              }, {})
            : null;
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar ValueVersion
                    scalar ValueMetadata

                    input ValueVersionInput {
                        name: String!,
                        value: TreeElementInput!
                    }

                    interface GenericValue {
                        id_value: ID,
                        modified_at: Int,
                        created_at: Int,
                        version: ValueVersion,
                        attribute: ID,
                        metadata: ValueMetadata
                    }

                    type Value implements GenericValue {
                        id_value: ID,
                        value: Any,
                        raw_value: Any,
                        modified_at: Int,
                        created_at: Int,
                        version: ValueVersion,
                        attribute: ID,
                        metadata: ValueMetadata
                    }

                    type saveValueBatchResult {
                        values: [Value!],
                        errors: [ValueBatchError!]
                    }

                    type ValueBatchError {
                        type: String!,
                        attribute: String!,
                        input: String,
                        message: String!
                    }

                    input ValueMetadataInput {
                        name: String!,
                        value: String
                    }

                    type LinkValue implements GenericValue {
                        id_value: ID,
                        value: Record!,
                        modified_at: Int,
                        created_at: Int,
                        version: ValueVersion,
                        attribute: ID,
                        metadata: ValueMetadata
                    }

                    type TreeValue implements GenericValue {
                        id_value: ID!,
                        modified_at: Int!,
                        created_at: Int!
                        value: TreeNode!,
                        version: ValueVersion,
                        attribute: ID,
                        metadata: ValueMetadata
                    }

                    input ValueInput {
                        id_value: ID,
                        value: String,
                        metadata: [ValueMetadataInput],
                        version: [ValueVersionInput]
                    }

                    input ValueBatchInput {
                        attribute: ID,
                        id_value: ID,
                        value: String,
                        metadata: ValueMetadata
                    }

                    extend type Mutation {
                        # Save one value
                        saveValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): Value!
                        # Save values for several attributes at once.
                        # If deleteEmpty is true, empty values will be deleted
                        saveValueBatch(
                            library: ID,
                            recordId: ID,
                            version: [ValueVersionInput],
                            values: [ValueBatchInput],
                            deleteEmpty: Boolean
                        ): saveValueBatchResult!
                        deleteValue(library: ID!, recordId: ID!, attribute: ID!, valueId: ID): Value!
                    }
                `,
                resolvers: {
                    Mutation: {
                        async saveValue(parent, {library, recordId, attribute, value}, ctx): Promise<IValue> {
                            const valToSave = {
                                ...value,
                                version: _convertVersionFromGqlFormat(value.version),
                                metadata: utils.nameValArrayToObj(value.metadata)
                            };

                            const savedVal = await valueDomain.saveValue({
                                library,
                                recordId,
                                attribute,
                                value: valToSave,
                                ctx
                            });

                            const formattedVersion: any = savedVal.version
                                ? _convertVersionToGqlFormat(savedVal.version)
                                : null;

                            return {...savedVal, version: formattedVersion};
                        },
                        async saveValueBatch(parent, {library, recordId, version, values, deleteEmpty}, ctx) {
                            // Convert version
                            const versionToUse = _convertVersionFromGqlFormat(version);
                            const convertedValues = values.map(val => ({
                                ...val,
                                version: versionToUse,
                                metadata: utils.nameValArrayToObj(val.metadata)
                            }));

                            const savedValues = await valueDomain.saveValueBatch({
                                library,
                                recordId,
                                values: convertedValues,
                                ctx,
                                keepEmpty: deleteEmpty
                            });

                            const res = {
                                ...savedValues,
                                values: savedValues.values.map(val => ({
                                    ...val,
                                    version:
                                        Array.isArray(val.version) && val.version.length
                                            ? _convertVersionToGqlFormat(val.version)
                                            : null
                                }))
                            };

                            return res;
                        },
                        async deleteValue(parent, {library, recordId, attribute, valueId}, ctx): Promise<IValue> {
                            return valueDomain.deleteValue({
                                library,
                                recordId,
                                attribute,
                                valueId,
                                ctx
                            });
                        }
                    },
                    ValueVersion: new GraphQLScalarType({
                        name: 'ValueVersion',
                        description: `Value version, object looking like:
                            {versionTreeName: {library: "tree_element_library", id: "tree_element_id"}`,
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: ast => ast
                    }),
                    GenericValue: {
                        __resolveType: async (fieldValue, _, ctx) => {
                            const attribute = Array.isArray(fieldValue)
                                ? fieldValue[0].attribute
                                : fieldValue.attribute;

                            const attrProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});

                            switch (attrProps.type) {
                                case AttributeTypes.SIMPLE:
                                case AttributeTypes.ADVANCED:
                                    return 'Value';
                                case AttributeTypes.SIMPLE_LINK:
                                case AttributeTypes.ADVANCED_LINK:
                                    return 'LinkValue';
                                case AttributeTypes.TREE:
                                    return 'TreeValue';
                            }
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
