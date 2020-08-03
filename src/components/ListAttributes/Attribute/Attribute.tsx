import React from 'react';
import {List} from 'semantic-ui-react';
import {AttributeFormat, IAttribute, IAttributesChecked, IExtendedData} from '../../../_types/types';
import ListItemAttribute from '../AttributeBasic';
import AttributeExtended from '../AttributeExtended';
import ListItemAttributeLink from '../AttributeLink';
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
    originAttributeId?: string;
}

function Attribute({
    stateListAttribute,
    dispatchListAttribute,
    attribute,
    depth,
    originAttributeId
}: IAttributeProps): JSX.Element {
    const itemClick = (extendedData?: IExtendedData) => {
        handleCheckboxChange(extendedData);
    };

    const handleCheckboxChange = (extendedData?: IExtendedData) => {
        if (stateListAttribute.useCheckbox) {
            let newAttributesChecked: IAttributesChecked[];

            const checkCurrentAttribute = (attributeChecked: IAttributesChecked) =>
                attributeChecked.id === attribute.id && attributeChecked.library === attribute.library;

            const hasCurrentAttribute = stateListAttribute.attributesChecked.some(attributeChecked =>
                extendedData?.path
                    ? checkCurrentAttribute(attributeChecked) &&
                      attributeChecked.extendedData?.path === extendedData?.path
                    : checkCurrentAttribute(attributeChecked)
            );
            if (hasCurrentAttribute) {
                newAttributesChecked = stateListAttribute.attributesChecked.reduce((acc, attributeChecked) => {
                    if (checkCurrentAttribute(attributeChecked)) {
                        const newChecked = attributeChecked?.checked ? false : true;
                        if (extendedData?.path) {
                            if (attributeChecked.extendedData?.path === extendedData?.path) {
                                return [...acc, {...attributeChecked, checked: newChecked, extendedData: extendedData}];
                            } else {
                                return [...acc, attributeChecked];
                            }
                        } else {
                            return [...acc, {...attributeChecked, checked: newChecked}];
                        }
                    }
                    return [...acc, attributeChecked];
                }, [] as IAttributesChecked[]);
            } else {
                newAttributesChecked = [
                    ...stateListAttribute.attributesChecked,
                    {
                        id: attribute.id,
                        library: attribute.library,
                        checked: true,
                        extendedData,
                        depth: extendedData?.path?.match(/,/g)?.length || 0
                    }
                ];
            }

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
                attributesChecked: newAttributesChecked
            });
        } else {
            const newAttributesChecked: IAttributesChecked[] = [
                ...stateListAttribute.attributesChecked.filter(ac => ac.id !== attribute.id),
                {id: attribute.id, library: attribute.library, depth, checked: true, extendedData}
            ];

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
                attributesChecked: newAttributesChecked
            });
        }
    };

    const handleRadioChange = () => {
        if (stateListAttribute.changeSelected) {
            stateListAttribute.changeSelected(attribute.id);
        }
    };

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
                    <ListItemAttributeLink
                        attribute={attribute}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        depth={depth}
                        itemClick={itemClick}
                        handleCheckboxChange={handleCheckboxChange}
                        handleRadioChange={handleRadioChange}
                        originAttributeId={originAttributeId}
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
                        itemClick={itemClick}
                        handleCheckboxChange={handleCheckboxChange}
                        handleRadioChange={handleRadioChange}
                    />
                </List.Content>
            </ListItem>
        );
    }

    return (
        <ListItem onClick={itemClick}>
            <List.Content verticalAlign="middle">
                <ListItemAttribute
                    attribute={attribute}
                    stateListAttribute={stateListAttribute}
                    dispatchListAttribute={dispatchListAttribute}
                    handleCheckboxChange={handleCheckboxChange}
                    handleRadioChange={handleRadioChange}
                />
            </List.Content>
        </ListItem>
    );
}
export default Attribute;
