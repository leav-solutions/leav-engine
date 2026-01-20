// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from '_ui/_utils';
import {getEmbeddedFields} from '_ui/_queries/attributes/getAttributeWithEmbeddedFields';

export interface IEmbeddedField {
    id: string;
    label: Record<string, string>;
    embedded_fields?: IEmbeddedField[];
}

export const recordHistoryLogAttributeFragment = (depthEmbeddedFields: number) => `
    attribute {
        id
        label
        type
        format
        multiple_values
        ... on StandardAttribute {
            ${getEmbeddedFields(depthEmbeddedFields)}
        }
    }
`;

const RecordHistoryLogEntryFragment = (depthAttributeEmbeddedFields: number) => `
    logs {
        action
        time
        topic {
            ${recordHistoryLogAttributeFragment(depthAttributeEmbeddedFields)}
        }
        user {
            id
            whoAmI { # Don't know why, but frontend need that to load record !
                id
                library {
                    id
                }
            }
            properties(attributeIds: ["email"]) {
                attributeId
                values {
                ... on Value {
                        payload
                    }
                }
            }
        }
        before {
            asString
        }
        after {
            asString
        }
    }
`;

export const getRecordHistoryQuery = (depthAttributeEmbeddedFields: number = 0) => gqlUnchecked`
    query getRecordHistory($record: LogTopicRecordFilterInput!, $attributeId: String, $actions: [LogAction!], $pagination: Pagination) {
        logs(filters: {
            topic: {
                record: $record,
                    attribute: $attributeId
            },
            actions: $actions,
        }, pagination: $pagination) {
            total
            ${RecordHistoryLogEntryFragment(depthAttributeEmbeddedFields)}
        }
    }
`;
