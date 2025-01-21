import {AttributeType} from '_ui/_gqlTypes';

export const isLinkAttribute = (type: AttributeType) =>
    type === AttributeType.simple_link || type === AttributeType.advanced_link || type === AttributeType.tree;

export const isStandardAttribute = (type: AttributeType) =>
    type === AttributeType.simple || type === AttributeType.advanced;
