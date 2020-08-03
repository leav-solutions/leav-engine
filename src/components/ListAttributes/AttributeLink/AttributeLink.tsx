import {useLazyQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Icon, Loader, Radio} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLibraryDetailExtendedQuery} from '../../../queries/libraries/getLibraryDetailExtendQuery';
import {checkTypeIsLink, localizedLabel} from '../../../utils';
import {IAttribute, IExtendedData} from '../../../_types/types';
import {ListingAttributes} from '../ListAttributes';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import {
    CustomAccordion,
    CustomAccordionContent,
    CustomAccordionTitle,
    SmallText,
    Text,
    Wrapper
} from '../StyledComponents';

const WrapperContent = styled.div`
    border-left: 3px solid #2185d0;
`;

const Row = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 0.2rem;

    *:first-child > *:last-child {
        margin: 0 0.2rem;
    }
`;

interface IAttributeLink {
    attribute: IAttribute;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    depth: number;
    itemClick: () => void;
    handleCheckboxChange: (extendedData?: IExtendedData) => void;
    handleRadioChange: () => void;
    originAttributeId?: string;
}

const AttributeLink = ({
    attribute,
    stateListAttribute,
    dispatchListAttribute,
    depth,
    itemClick,
    handleCheckboxChange,
    handleRadioChange
}: IAttributeLink) => {
    const currentAccordion = stateListAttribute.accordionsActive?.find(
        accordionActive => accordionActive?.id === attribute.id && accordionActive.library === attribute.linkedLibrary
    );
    const [linkedAttributes, setLinkedAttribute] = useState<IAttribute[]>([]);

    const [getRecord, {called, loading, data, error}] = useLazyQuery(getLibraryDetailExtendedQuery, {
        variables: {
            libId: attribute.linkedLibrary
        }
    });

    useEffect(() => {
        if (currentAccordion?.id === attribute.id && !called) {
            getRecord();
        }

        if (called && !loading) {
            setLinkedAttribute(
                data?.libraries?.list[0]?.attributes.map(attr => {
                    const linkedAttribute: IAttribute = {
                        id: attr.id,
                        type: attr.type,
                        format: attr.format,
                        label: attr.label,
                        isLink: checkTypeIsLink(attr.type),
                        isMultiple: attr.multiple_values,
                        linkedLibrary: attr.linked_library,
                        linkedTree: attr.linked_tree,
                        library: attribute.linkedLibrary as string,
                        originAttributeId: attribute.id
                    };

                    return linkedAttribute;
                })
            );
        }
    }, [loading, called, data, currentAccordion, attribute, getRecord]);

    useEffect(() => {
        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_NEW_ATTRIBUTES,
            newAttributes: linkedAttributes
        });
    }, [dispatchListAttribute, linkedAttributes]);

    if (error) {
        return <>error</>;
    }

    const changeCurrentAccordion = () => {
        if (
            stateListAttribute.accordionsActive.find(
                accordionActive =>
                    accordionActive.id === attribute.id && accordionActive.library === attribute.linkedLibrary
            )
        ) {
            const restAccordionsActive = stateListAttribute.accordionsActive.filter(
                accordionActive =>
                    accordionActive.id !== attribute.id &&
                    accordionActive.library !== attribute.linkedLibrary &&
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
                    library: attribute.linkedLibrary as string,
                    depth
                }
            ];

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
                accordionsActive
            });
        }
    };

    const isAccordionActive = currentAccordion && currentAccordion?.depth === depth;

    const isChecked = stateListAttribute.attributesChecked.some(
        attributeChecked =>
            attributeChecked.id === attribute.id &&
            attributeChecked.library === attribute?.library &&
            attributeChecked?.checked
    );

    return (
        <Wrapper>
            <CustomAccordion>
                <CustomAccordionTitle active={isAccordionActive} index={attribute.id}>
                    <Button
                        icon={isAccordionActive ? 'angle up' : 'angle down'}
                        loading={called && loading}
                        onClick={changeCurrentAccordion}
                        compact
                        size="mini"
                        circular
                    />
                    <Row onClick={itemClick}>
                        <Text>
                            {stateListAttribute.lang && localizedLabel(attribute.label, stateListAttribute.lang) ? (
                                <span>
                                    {localizedLabel(attribute.label, stateListAttribute.lang)}{' '}
                                    <SmallText>{attribute.id}</SmallText>
                                </span>
                            ) : (
                                attribute.id
                            )}
                            <span>
                                <Icon name="linkify" />
                            </span>
                        </Text>
                        {stateListAttribute.useCheckbox && (
                            <Checkbox checked={isChecked} onChange={(event, data) => handleCheckboxChange()} />
                        )}
                    </Row>

                    {stateListAttribute.attributeSelection && (
                        <Radio
                            checked={stateListAttribute.attributeSelection === attribute.id}
                            onChange={handleRadioChange}
                        />
                    )}
                </CustomAccordionTitle>

                <CustomAccordionContent active={isAccordionActive}>
                    {loading ? (
                        <Loader />
                    ) : (
                        <WrapperContent>
                            <ListingAttributes
                                attributes={linkedAttributes}
                                stateListAttribute={stateListAttribute}
                                dispatchListAttribute={dispatchListAttribute}
                                depth={depth + 1}
                                originAttributeId={attribute.id}
                            />
                        </WrapperContent>
                    )}
                </CustomAccordionContent>
            </CustomAccordion>
        </Wrapper>
    );
};

export default AttributeLink;
