// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeType} from '_ui/_gqlTypes';

export const isLinkAttribute = (type: AttributeType) =>
    type === AttributeType.simple_link || type === AttributeType.advanced_link || type === AttributeType.tree;

export const isStandardAttribute = (type: AttributeType) =>
    type === AttributeType.simple || type === AttributeType.advanced;
