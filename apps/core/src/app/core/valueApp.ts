// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IKeyValue, objectToNameValueArray} from '@leav/utils';
import {type ConvertVersionFromGqlFormatFunc} from 'app/helpers/convertVersionFromGqlFormat';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type IValueDomain} from 'domain/value/valueDomain';
import isEmptyValue from '../../domain/value/helpers/isEmptyValue';
import {type IUtils} from 'utils/utils';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IQueryInfos} from '_types/queryInfos';
import {
    type ISaveValue,
    type IBaseValue,
    type IStandardValue,
    type ITreeValue,
    type IValue,
    type IValueVersion,
} from '_types/value';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {EMPTY_VALUE} from '../../infra/value/valueRepo';
import {type IGraphqlAppModule} from 'app/graphql/graphqlApp';
import {type ISaveValueBulkTask} from '../../domain/value/tasks/saveValueBulk';

export type ICoreValueApp = IGraphqlAppModule;

interface IDeps {
    'core.domain.value': IValueDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.value.tasks.saveValueBulk': ISaveValueBulkTask;
    'core.app.helpers.convertVersionFromGqlFormat': ConvertVersionFromGqlFormatFunc;
    'core.utils': IUtils;
}

export default function ({
    'core.domain.value': valueDomain,
    'core.domain.record': recordDomain,
    'core.domain.value.tasks.saveValueBulk': saveValueBulkTask,
    'core.domain.attribute': attributeDomain,
    'core.app.helpers.convertVersionFromGqlFormat': convertVersionFromGqlFormat,
    'core.utils': utils,
}: IDeps): ICoreValueApp {
    const _convertVersionToGqlFormat = (version: IValueVersion) => {
        const versionsNames = Object.keys(version);
        const formattedVersion = [];
        for (const versName of versionsNames) {
            formattedVersion.push({
                treeId: versName,
                treeNode: {id: version[versName], treeId: versName},
            });
        }
        return formattedVersion;
    };

    const _prepareInputValue = (value: any): ISaveValue => {
        const valueToSave = {
            ...value,
            payload: value.payload ?? value.value,
            version: convertVersionFromGqlFormat(value.version),
            metadata: utils.nameValArrayToObj(value.metadata),
        };

        valueToSave.payload = isEmptyValue(valueToSave) ? EMPTY_VALUE : valueToSave.payload;

        return valueToSave;
    };

    const _getUser = async (userId: string, ctx: IQueryInfos): Promise<IRecord> => {
        const res = await recordDomain.find({
            params: {
                library: 'users',
                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: userId}],
            },
            ctx,
        });

        return res.list[0] ? res.list[0] : null;
    };

    const commonValueResolvers = {
        attribute: (value: IValue, _, ctx: IQueryInfos): Promise<IAttribute> =>
            attributeDomain.getAttributeProperties({id: value.attribute, ctx}),
        created_by: async (value: IValue, _, ctx: IQueryInfos): Promise<IRecord> =>
            typeof value.created_by === 'undefined' ? null : _getUser(value.created_by, ctx),
        modified_by: async (value: IValue, _, ctx: IQueryInfos): Promise<IRecord> =>
            typeof value.modified_by === 'undefined' ? null : _getUser(value.modified_by, ctx),
        metadata: (value: IValue, _, ctx: IQueryInfos): Array<{name: string; value: IStandardValue}> =>
            value.metadata ? objectToNameValueArray(value.metadata as IKeyValue<IStandardValue>) : [],
        version: (value: IValue, _, ctx: IQueryInfos): Array<{treeId: string; treeNode: {id: string}}> =>
            value?.version
                ? objectToNameValueArray(value.version).map(v => ({
                      treeId: v.name,
                      treeNode: {id: v.value, treeId: v.name},
                  }))
                : [],
    };

    const _getLinkValuePayload = (parent: IValue) => {
        if (parent.payload === null) {
            return null;
        }

        return {
            ...parent.payload,
            // Add attribute on value as it might be useful for nested resolvers like ancestors
            attribute: parent.attribute,
        };
    };

    const _getTreeValuePayload = (parent: ITreeValue) => {
        if (parent.payload === null) {
            return null;
        }

        return {
            ...parent.payload,
            // Add attribute and treeId on value as it might be useful for nested resolvers like ancestors
            attribute: parent.attribute,
            treeId: parent.treeId,
        };
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type ValueVersion {
                        treeId: String!,
                        treeNode: TreeNode
                    }

                    input ValueVersionInput {
                        treeId: String!,
                        treeNodeId: String!
                    }

                    type ValueMetadata {
                        name: String!,
                        value: Value
                    }

                    interface GenericValue {
                        id_value: ID,
                        modified_at: Int,
                        created_at: Int,
                        modified_by: Record,
                        created_by: Record,
                        version: [ValueVersion],
                        attribute: Attribute!,
                        metadata: [ValueMetadata],
                        isInherited: Boolean,
                        isCalculated: Boolean
                    }

                    type Value implements GenericValue {
                        id_value: ID,
                        value: Any @deprecated(reason: "Use payload instead"),
                        raw_value: Any @deprecated(reason: "Use raw_payload instead"),
                        """ it can be "\\__empty_value__" whatever the format """
                        payload: Any, 
                        """ it can be "\\__empty_value__" whatever the format """
                        raw_payload: Any,
                        modified_at: Int,
                        created_at: Int,
                        modified_by: Record,
                        created_by: Record,
                        version: [ValueVersion],
                        attribute: Attribute!,
                        metadata: [ValueMetadata],
                        isInherited: Boolean,
                        isCalculated: Boolean
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
                        value: Record @deprecated(reason: "Use payload instead"),
                        payload: Record,
                        modified_at: Int,
                        created_at: Int,
                        modified_by: Record,
                        created_by: Record,
                        version: [ValueVersion],
                        attribute: Attribute!,
                        metadata: [ValueMetadata],
                        isInherited: Boolean,
                        isCalculated: Boolean
                    }

                    type TreeValue implements GenericValue {
                        id_value: ID,
                        modified_at: Int,
                        created_at: Int
                        modified_by: Record,
                        created_by: Record,
                        value: TreeNode @deprecated(reason: "Use payload instead"),
                        payload: TreeNode,
                        version: [ValueVersion],
                        attribute: Attribute!,
                        metadata: [ValueMetadata],
                        isInherited: Boolean,
                        isCalculated: Boolean
                    }

                    type DateRangeValue {
                        from: String
                        to: String
                    }

                    input ValueInput {
                        id_value: ID,
                        value: String @deprecated(reason: "Use payload instead"),
                        """ Use "\\__empty_value__" to set an empty value """
                        payload: String,
                        metadata: [ValueMetadataInput],
                        version: [ValueVersionInput]
                    }

                    input ValueBatchInput {
                        attribute: ID,
                        id_value: ID,
                        value: String @deprecated(reason: "Use payload instead"),
                        """ Use "\\__empty_value__" to set an empty value """
                        payload: String, 
                        metadata: [ValueMetadataInput]
                    }

                    input MapValueInput {
                        before: ID,
                        after: ID
                    }

                    interface GenericValueOccurrences {
                        count: Int!
                    }

                    type TreeValueOccurrences implements GenericValueOccurrences {
                        value: TreeNode!
                        count: Int!
                    }

                    type ValuesOccurrences {
                        occurrences: [GenericValueOccurrences!]!
                        noValueCount: Int!
                    }

                    extend type Query {
                        countValuesOccurrences(
                            library: ID!,
                            """ Attribute should be tree and mono valued """
                            attribute: ID!,
                            """ Filters to apply on records, same filters as for records query """
                            recordFilters: [RecordFilterInput],
                            version: [ValueVersionInput],
                        ): ValuesOccurrences
                    }

                    extend type Mutation {
                        # Save one value
                        saveValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): [GenericValue!]!

                        # Save values for several attributes at once.
                        # If deleteEmpty is true, empty values will be deleted
                        """ Save multiple values for a single record """
                        saveValueBatch(
                            library: ID,
                            recordId: ID,
                            version: [ValueVersionInput],
                            values: [ValueBatchInput],
                            deleteEmpty: Boolean
                        ): saveValueBatchResult!

                        """ Save values in bulk for all records matching the filters """
                        saveValueBulk(libraryId: ID!, recordsFilters: [RecordFilterInput]!, attributeId: ID!, mapValues: [MapValueInput!]!): ID!

                        """ The returned values are the deleted ones """ 
                        deleteValue(library: ID!, recordId: ID!, attribute: ID!, value: ValueInput): [GenericValue!]!
                    }
                `,
                resolvers: {
                    Query: {
                        async countValuesOccurrences(
                            _,
                            {library, attribute, recordFilters, version},
                            ctx: IQueryInfos,
                        ): Promise<{
                            occurrences: Array<{value: IBaseValue; attribute: string; count: number}>;
                            noValueCount: number;
                        }> {
                            const formattedVersion =
                                Array.isArray(version) && version.length
                                    ? version.reduce((allVers, vers) => {
                                          allVers[vers.treeId] = vers.treeNodeId;
                                          return allVers;
                                      }, {})
                                    : null;

                            const occurrences = await valueDomain.countValuesOccurrences({
                                libraryId: library,
                                attributeId: attribute,
                                recordFilters,
                                options: {version: formattedVersion},
                                ctx,
                            });

                            const noValueOccurrence = occurrences.find(occ => occ.value == null);

                            return {
                                occurrences: occurrences
                                    .filter(occ => occ.value != null)
                                    .map(occ => ({...occ, attribute})), // add attribute for GenericRecordValueOccurrences.__resolveType
                                noValueCount: noValueOccurrence ? noValueOccurrence.count : 0,
                            };
                        },
                    },
                    Mutation: {
                        async saveValue(
                            _: never,
                            {library, recordId, attribute, value},
                            ctx: IQueryInfos,
                        ): Promise<IValue[]> {
                            return valueDomain.saveValue({
                                library,
                                recordId,
                                attribute,
                                value: _prepareInputValue(value),
                                ctx,
                            });
                        },
                        async saveValueBulk(
                            _: never,
                            {libraryId, recordsFilters, attributeId, mapValues},
                            ctx: IQueryInfos,
                        ): Promise<string> {
                            return saveValueBulkTask.saveValueBulk({
                                libraryId,
                                recordsFilters,
                                attributeId,
                                mapValues,
                                ctx,
                            });
                        },
                        async saveValueBatch(
                            _: never,
                            {library, recordId, version, values, deleteEmpty},
                            ctx: IQueryInfos,
                        ) {
                            const savedValues = await valueDomain.saveValueBatch({
                                library,
                                recordId,
                                values: values.map(_prepareInputValue),
                                ctx,
                                keepEmpty: !deleteEmpty,
                            });

                            return {
                                ...savedValues,
                                values: savedValues.values.map(val => ({
                                    ...val,
                                    version:
                                        Array.isArray(val.version) && val.version.length
                                            ? _convertVersionToGqlFormat(val.version)
                                            : null,
                                })),
                            };
                        },
                        async deleteValue(
                            _: never,
                            {library, recordId, attribute, value},
                            ctx: IQueryInfos,
                        ): Promise<IValue[]> {
                            const valToDelete =
                                value?.payload || value?.value
                                    ? {
                                          ...value,
                                          payload: value.payload ?? value.value,
                                      }
                                    : value;
                            return valueDomain.deleteValue({
                                library,
                                recordId,
                                attribute,
                                value: valToDelete,
                                ctx,
                            });
                        },
                    },
                    GenericValueOccurrences: {
                        __resolveType: async (fieldValue, ctx) => {
                            const attribute = Array.isArray(fieldValue)
                                ? fieldValue[0].attribute
                                : fieldValue.attribute;
                            const attrProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});
                            switch (attrProps.type) {
                                case AttributeTypes.TREE:
                                    return 'TreeValueOccurrences';
                                case AttributeTypes.SIMPLE_LINK:
                                case AttributeTypes.ADVANCED_LINK:
                                    return 'LinkValueOccurrences';
                                default:
                                    return null;
                            }
                        },
                    },
                    GenericValue: {
                        __resolveType: async (fieldValue, ctx: IQueryInfos) => {
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
                        },
                    },
                    Value: {
                        ...commonValueResolvers,
                        value: (parent: IStandardValue) => parent.payload,
                        raw_value: (parent: IStandardValue) => parent.raw_payload,
                    },
                    LinkValue: {
                        ...commonValueResolvers,
                        value: (parent: IValue) => _getLinkValuePayload(parent),
                        payload: (parent: IValue) => _getLinkValuePayload(parent),
                    },
                    TreeValue: {
                        ...commonValueResolvers,
                        value: (parent: ITreeValue) => _getTreeValuePayload(parent),
                        payload: (parent: ITreeValue) => _getTreeValuePayload(parent),
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
