// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {GraphQLScalarType} from 'graphql';
import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {IValue, IValueVersion} from '_types/value';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {IGraphqlApp} from '../graphql/graphqlApp';
export interface ICoreValueApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}
interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.record'?: IRecordDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.utils'?: IUtils;
}
export default function ({
    'core.domain.value': valueDomain = null,
    'core.domain.record': recordDomain = null,
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
                value: version[versName]
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

    const _getUser = async (userId: string, ctx: IQueryInfos): Promise<IRecord> => {
        const res = await recordDomain.find({
            params: {
                library: 'users',
                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: userId}]
            },
            ctx
        });

        return res.list[0] ? res.list[0] : null;
    };

    const commonValueResolvers = {
        attribute: (value: IValue, _, ctx: IQueryInfos): Promise<IAttribute> => {
            return attributeDomain.getAttributeProperties({id: value.attribute, ctx});
        },
        created_by: async (value: IValue, _, ctx: IQueryInfos): Promise<IRecord> => {
            return typeof value.created_by === 'undefined' ? null : _getUser(value.created_by, ctx);
        },
        modified_by: async (value: IValue, _, ctx: IQueryInfos): Promise<IRecord> => {
            return typeof value.modified_by === 'undefined' ? null : _getUser(value.modified_by, ctx);
        }
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar ValueVersion
                    scalar ValueMetadata

                    input ValueVersionInput {
                        name: String!,
                        value: String!
                    }
                    interface GenericValue {
                        id_value: ID,
                        modified_at: Int,
                        created_at: Int,
                        modified_by: User,
                        created_by: User,
                        version: ValueVersion,
                        attribute: Attribute,
                        metadata: ValueMetadata
                    }
                    type Value implements GenericValue {
                        id_value: ID,
                        value: Any,
                        raw_value: Any,
                        modified_at: Int,
                        created_at: Int,
                        modified_by: User,
                        created_by: User,
                        version: ValueVersion,
                        attribute: Attribute,
                        metadata: ValueMetadata
                    }
                    type saveValueBatchResult {
                        values: [GenericValue!],
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
                        modified_by: User,
                        created_by: User,
                        version: ValueVersion,
                        attribute: Attribute,
                        metadata: ValueMetadata
                    }
                    type TreeValue implements GenericValue {
                        id_value: ID!,
                        modified_at: Int!,
                        created_at: Int!
                        modified_by: User,
                        created_by: User,
                        value: TreeNode!,
                        version: ValueVersion,
                        attribute: Attribute,
                        metadata: ValueMetadata
                    }
                    type DateRangeValue {
                        from: String
                        to: String
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
                        saveValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): GenericValue!
                        # Save values for several attributes at once.
                        # If deleteEmpty is true, empty values will be deleted
                        saveValueBatch(
                            library: ID,
                            recordId: ID,
                            version: [ValueVersionInput],
                            values: [ValueBatchInput],
                            deleteEmpty: Boolean
                        ): saveValueBatchResult!
                        deleteValue(library: ID!, recordId: ID!, attribute: ID!, value: ValueInput): GenericValue!
                    }
                `,
                resolvers: {
                    Mutation: {
                        async saveValue(_, {library, recordId, attribute, value}, ctx): Promise<IValue> {
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
                        async deleteValue(parent, {library, recordId, attribute, value}, ctx): Promise<IValue> {
                            return valueDomain.deleteValue({
                                library,
                                recordId,
                                attribute,
                                value,
                                ctx
                            });
                        }
                    },
                    ValueVersion: new GraphQLScalarType({
                        name: 'ValueVersion',
                        description: `Value version, object looking like:
                            {versionTreeName: "nodeId"}`,
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
                    },
                    Value: commonValueResolvers,
                    LinkValue: {
                        ...commonValueResolvers,
                        value: parent => ({
                            ...parent.value,
                            // Add attribute on value as it might be useful for nested resolvers like ancestors
                            attribute: parent.attribute
                        })
                    },
                    TreeValue: {
                        ...commonValueResolvers,
                        value: parent => ({
                            ...parent.value,
                            // Add attribute and treeId on value as it might be useful for nested resolvers like ancestors
                            attribute: parent.attribute,
                            treeId: parent.treeId
                        })
                    }
                }
            };
            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
            return fullSchema;
        }
    };
}
