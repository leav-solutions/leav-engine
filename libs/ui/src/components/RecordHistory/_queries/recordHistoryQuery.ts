import {gqlUnchecked} from '_ui/_utils';
import {getEmbeddedFields} from '_ui/_queries/attributes/getAttributeWithEmbeddedFields';

export interface IEmbeddedField {
    id: string;
    label: Record<string, string>;
    embedded_fields?: IEmbeddedField[];
}

export const recordHistoryLogAttributeFragment = (depthEmbeddedFields: number) => `
    attribute {
        ... on StandardAttribute {
            id
            label
            type
            format
            multiple_values
            ${getEmbeddedFields(depthEmbeddedFields)}
        }
        ... on LinkAttribute {
            id
            label
            type
            format
            multiple_values
        }
        ... on TreeAttribute {
            id
            label
            type
            format
            multiple_values
        }
        ... on LogUnknownEntity {
            id
            label
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
            ... on Record {
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
            ... on LogUnknownEntity {
                id
                label
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
