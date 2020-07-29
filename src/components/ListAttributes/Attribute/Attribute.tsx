import React, {useEffect, useState} from 'react';
import {List} from 'semantic-ui-react';
import {AttributeFormat, IAttribute, IAttributesChecked} from '../../../_types/types';
import AttributeExtends from '../AttributeExtends';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import ListItemAttribute from '../ListItemAttribute';
import ListItemAttributeLink from '../ListItemAttributeLink';
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
    const [attributeChecked, setAttributeChecked] = useState(
        stateListAttribute.attributesChecked.find(ac => ac.id === attribute.id && ac.library === attribute.library)
    );

    useEffect(() => {
        setAttributeChecked(
            stateListAttribute.attributesChecked.find(ac => ac.id === attribute.id && ac.library === attribute.library)
        );
    }, [setAttributeChecked, stateListAttribute.attributesChecked, attribute, depth]);

    const itemClick = () => {
        const newChecked = !attributeChecked?.checked;
        if (stateListAttribute.useCheckbox) {
            const restAttributesChecked = stateListAttribute.attributesChecked.filter(
                attributeChecked => attributeChecked.id !== attribute.id
            );
            const currentAttributeChecked = stateListAttribute.attributesChecked.find(
                attributeChecked => attributeChecked.id === attribute.id
            );

            const newAttributesChecked = currentAttributeChecked
                ? [...restAttributesChecked, {...currentAttributeChecked, checked: newChecked}]
                : restAttributesChecked;

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
                attributesChecked: newAttributesChecked
            });
        } else if (stateListAttribute.changeSelected) {
            handleRadioChange();
        }

        const newAttrsChecked: IAttributesChecked[] = [
            ...stateListAttribute.attributesChecked.filter(ac => ac.id !== attribute.id),
            {id: attribute.id, library: attribute.library, depth, checked: newChecked, originAttributeId}
        ];

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: newAttrsChecked
        });
    };

    const handleCheckboxChange = (newChecked: boolean, path?: string) => {
        if (stateListAttribute.useCheckbox) {
            const restAttributesChecked = stateListAttribute.attributesChecked.filter(
                attributeChecked => attributeChecked.id !== attribute.id
            );
            const currentAttributeChecked = stateListAttribute.attributesChecked.find(
                attributeChecked => attributeChecked.id === attribute.id
            );

            const newAttributesChecked = currentAttributeChecked
                ? [...restAttributesChecked, {...currentAttributeChecked, checked: newChecked}]
                : restAttributesChecked;

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
                attributesChecked: newAttributesChecked
            });
        }

        const newAttrsChecked: IAttributesChecked[] = [
            ...stateListAttribute.attributesChecked.filter(ac => ac.id !== attribute.id),
            {id: attribute.id, library: attribute.library, depth, checked: newChecked}
        ];

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: newAttrsChecked
        });
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
                        attributeChecked={attributeChecked}
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
                    <AttributeExtends
                        attribute={attribute}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        attributeChecked={attributeChecked}
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
                    attributeChecked={attributeChecked}
                    handleCheckboxChange={handleCheckboxChange}
                    handleRadioChange={handleRadioChange}
                />
            </List.Content>
        </ListItem>
    );
}
export default Attribute;
