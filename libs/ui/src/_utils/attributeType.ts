import {AttributeType} from '_ui/_gqlTypes';

export const isLinkAttribute = (type: AttributeType) =>
    type === AttributeType.simple_link || type === AttributeType.advanced_link;

export const isTreeAttribute = (type: AttributeType) => type === AttributeType.tree;

export const isStandardAttribute = (type: AttributeType) =>
    type === AttributeType.simple || type === AttributeType.advanced;
