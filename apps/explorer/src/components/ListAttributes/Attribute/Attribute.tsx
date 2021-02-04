// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import {attributeUpdateSelection} from '../../../utils';
import {
    AttributeFormat,
    AttributeType,
    IAttribute,
    IAttributesChecked,
    IOriginAttributeData,
    ITreeData
} from '../../../_types/types';
import ListItemAttribute from '../AttributeBasic';
import AttributeExtended from '../AttributeExtended';
import AttributeLink from '../AttributeLink';
import {
    IListAttributeState,
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes
} from '../ListAttributesReducer';

interface IAttributeProps {
    stateListAttribute: IListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    attribute: IAttribute;
    depth: number;
    originAttributeData?: IOriginAttributeData;
    treeData?: ITreeData;
}

const Item = styled.div`
    padding: 1rem 0;
`;

function Attribute({
    stateListAttribute,
    dispatchListAttribute,
    attribute,
    depth,
    originAttributeData,
    treeData
}: IAttributeProps): JSX.Element {
    // avoid infinite recursion
    const isSame = stateListAttribute.accordionsActive?.find(
        accordionActive =>
            accordionActive?.id === attribute.id &&
            accordionActive.library === attribute.linkedLibrary &&
            accordionActive.depth + 1 === depth
    );

    const depthLimitation = depth < 1;

    if (attribute.linkedLibrary && !isSame && depthLimitation) {
        return (
            <Item>
                <AttributeLink
                    attribute={attribute}
                    stateListAttribute={stateListAttribute}
                    dispatchListAttribute={dispatchListAttribute}
                    depth={depth}
                    type="library"
                    originAttributeData={originAttributeData}
                />
            </Item>
        );
    }

    if (attribute.type === AttributeType.tree && !isSame && depthLimitation) {
        return (
            <Item>
                <AttributeLink
                    attribute={attribute}
                    stateListAttribute={stateListAttribute}
                    dispatchListAttribute={dispatchListAttribute}
                    depth={depth}
                    type="tree"
                    originAttributeData={originAttributeData}
                />
            </Item>
        );
    }

    if (attribute.format === AttributeFormat.extended) {
        return (
            <Item>
                <AttributeExtended
                    attribute={attribute}
                    stateListAttribute={stateListAttribute}
                    dispatchListAttribute={dispatchListAttribute}
                    previousDepth={depth}
                />
            </Item>
        );
    }

    const handleClick = () => {
        const newAttributesChecked: IAttributesChecked[] = attributeUpdateSelection({
            attribute,
            attributesChecked: stateListAttribute.attributesChecked,
            useCheckbox: !!stateListAttribute.useCheckbox,
            depth,
            originAttributeData,
            treeData
        });

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: newAttributesChecked
        });
    };

    return (
        <Item onClick={handleClick}>
            <ListItemAttribute
                attribute={attribute}
                stateListAttribute={stateListAttribute}
                dispatchListAttribute={dispatchListAttribute}
                treeData={treeData}
                depth={depth}
            />
        </Item>
    );
}
export default Attribute;
