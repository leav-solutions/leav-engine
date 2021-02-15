// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import {
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute,
    GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute
} from '../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {AttributeFormat, AttributeType} from '../../../_gqlTypes/globalTypes';
import {useAttributesSelectionListState} from '../reducer/attributesSelectionListStateContext';
import {ICommonAttributeComponentProps} from '../_types';
import ExtendedAttribute from './ExtendedAttribute';
import RecordLinkAttribute from './RecordLinkAttribute';
import StandardAttribute from './StandardAttribute';
import TreeLinkAttribute from './TreeLinkAttribute/TreeLinkAttribute';

const Item = styled.div`
    padding: 0.5rem 0;
`;

function Attribute({attribute, depth, path, library, parentAttribute}: ICommonAttributeComponentProps): JSX.Element {
    const {state} = useAttributesSelectionListState();

    const hasReachedMaxDepth =
        (attribute.format !== AttributeFormat.extended && depth) ||
        (attribute.format === AttributeFormat.extended && !state.canExpandExtendedAttributes);
    const attributePath = [path, attribute.id].filter(p => !!p).join('.');
    const commonProps = {
        library,
        depth,
        path: attributePath,
        parentAttribute
    };

    let attributeComp;
    if (hasReachedMaxDepth) {
        attributeComp = (
            <StandardAttribute
                attribute={attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute}
                {...commonProps}
            />
        );
    } else {
        switch (attribute.type) {
            case AttributeType.simple_link:
            case AttributeType.advanced_link:
                attributeComp = (
                    <RecordLinkAttribute
                        attribute={attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute}
                        {...commonProps}
                    />
                );
                break;
            case AttributeType.tree:
                attributeComp = (
                    <TreeLinkAttribute
                        attribute={attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute}
                        {...commonProps}
                    />
                );
                break;
            default: {
                attributeComp =
                    attribute.format === AttributeFormat.extended && !hasReachedMaxDepth ? (
                        <ExtendedAttribute
                            attribute={attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute}
                            {...commonProps}
                        />
                    ) : (
                        <StandardAttribute
                            attribute={attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute}
                            {...commonProps}
                        />
                    );
                break;
            }
        }
    }

    return <Item>{attributeComp}</Item>;
}
export default Attribute;
