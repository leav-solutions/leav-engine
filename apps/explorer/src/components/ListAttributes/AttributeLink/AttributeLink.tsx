// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {IAttribute, IOriginAttributeData} from '../../../_types/types';
import {
    IListAttributeState,
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes
} from '../ListAttributesReducer';
import AttributeLinkedLibrary from './AttributeLinkedLibrary';
import AttributeLinkedTree from './AttributeLinkedTree';

interface IAttributeLink {
    attribute: IAttribute;
    stateListAttribute: IListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    depth: number;
    type: 'tree' | 'library';
    originAttributeData?: IOriginAttributeData;
}

const AttributeLink = ({
    attribute,
    stateListAttribute,
    dispatchListAttribute,
    depth,
    type,
    originAttributeData
}: IAttributeLink) => {
    const linkedId = type === 'library' ? attribute.linkedLibrary : attribute.linkedTree;
    const currentAccordion = stateListAttribute.accordionsActive?.find(
        accordionActive => accordionActive?.id === attribute.id && accordionActive.library === linkedId
    );

    const changeCurrentAccordion = () => {
        if (
            stateListAttribute.accordionsActive.some(
                accordionActive => accordionActive.id === attribute.id && accordionActive.library === linkedId
            )
        ) {
            const restAccordionsActive = stateListAttribute.accordionsActive.filter(
                accordionActive =>
                    accordionActive.id !== attribute.id &&
                    accordionActive.library !== linkedId &&
                    accordionActive.depth >= depth
            );

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
                accordionsActive: restAccordionsActive
            });
        } else {
            const accordionsActive = [
                ...stateListAttribute.accordionsActive?.filter(
                    accordionActive => accordionActive.id !== attribute.id && accordionActive.depth !== depth
                ),
                {
                    id: attribute.id,
                    library: linkedId as string,
                    depth
                }
            ];

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
                accordionsActive
            });
        }
    };

    const isChecked = stateListAttribute.attributesChecked.some(
        attributeChecked =>
            attributeChecked.id === attribute.id &&
            attributeChecked.library === attribute?.library &&
            attributeChecked?.checked
    );

    return type === 'library' ? (
        <AttributeLinkedLibrary
            attribute={attribute}
            currentAccordion={currentAccordion}
            changeCurrentAccordion={changeCurrentAccordion}
            stateListAttribute={stateListAttribute}
            dispatchListAttribute={dispatchListAttribute}
            depth={depth}
            isChecked={isChecked}
            originAttributeData={originAttributeData}
        />
    ) : (
        <AttributeLinkedTree
            attribute={attribute}
            currentAccordion={currentAccordion}
            changeCurrentAccordion={changeCurrentAccordion}
            stateListAttribute={stateListAttribute}
            dispatchListAttribute={dispatchListAttribute}
            depth={depth}
            isChecked={isChecked}
            originAttributeData={originAttributeData}
        />
    );
};

export default AttributeLink;
