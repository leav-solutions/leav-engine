import React from 'react';
import {List} from 'semantic-ui-react';
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
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import {ListItem} from '../StyledComponents';

interface IAttributeProps {
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    attribute: IAttribute;
    depth: number;
    originAttributeData?: IOriginAttributeData;
    treeData?: ITreeData;
}

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
            <ListItem>
                <List.Content verticalAlign="middle">
                    <AttributeLink
                        attribute={attribute}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        depth={depth}
                        type="library"
                        originAttributeData={originAttributeData}
                    />
                </List.Content>
            </ListItem>
        );
    }

    if (attribute.type === AttributeType.tree && !isSame && depthLimitation) {
        return (
            <ListItem>
                <List.Content verticalAlign="middle">
                    <AttributeLink
                        attribute={attribute}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        depth={depth}
                        type="tree"
                        originAttributeData={originAttributeData}
                    />
                </List.Content>
            </ListItem>
        );
    }

    if (attribute.format === AttributeFormat.extended) {
        return (
            <ListItem>
                <List.Content verticalAlign="middle">
                    <AttributeExtended
                        attribute={attribute}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        previousDepth={depth}
                    />
                </List.Content>
            </ListItem>
        );
    }

    const handleClick = () => {
        const newAttributesChecked: IAttributesChecked[] = attributeUpdateSelection({
            attribute: attribute,
            attributesChecked: stateListAttribute.attributesChecked,
            useCheckbox: !!stateListAttribute.useCheckbox,
            depth: depth,
            originAttributeData: originAttributeData,
            treeData
        });

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: newAttributesChecked
        });
    };

    return (
        <ListItem onClick={handleClick}>
            <List.Content verticalAlign="middle">
                <ListItemAttribute
                    attribute={attribute}
                    stateListAttribute={stateListAttribute}
                    dispatchListAttribute={dispatchListAttribute}
                    treeData={treeData}
                />
            </List.Content>
        </ListItem>
    );
}
export default Attribute;
