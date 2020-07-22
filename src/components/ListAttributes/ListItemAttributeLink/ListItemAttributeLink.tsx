import {useLazyQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Accordion, Checkbox, Icon, Loader, Radio} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLibraryDetailExtendsQuery} from '../../../queries/libraries/getLibraryDetailExtendQuery';
import {checkTypeIsLink, localizedLabel} from '../../../utils';
import {IAttribute, IAttributesChecked} from '../../../_types/types';
import {ListingAttributes} from '../ListAttributes';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import {SmallText, Text, Wrapper} from '../StyledComponents';

const CustomAccordion = styled(Accordion)`
    width: 100%;
`;

const CustomAccordionTitle = styled(Accordion.Title)`
    width: 100%;
`;

const CustomAccordionContent = styled(Accordion.Content)`
    width: 100%;
`;

const WrapperContent = styled.div`
    border-left: 3px solid #2185d0;
`;

interface IListItemAttributeLink {
    attribute: IAttribute;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    depth: number;
    itemClick: () => void;
    attributeChecked?: IAttributesChecked;
    handleCheckboxChange: (newChecked: boolean) => void;
    handleRadioChange: () => void;
    originAttributeId?: string;
}

const ListItemAttributeLink = ({
    attribute,
    stateListAttribute,
    dispatchListAttribute,
    depth,
    itemClick,
    attributeChecked,
    handleCheckboxChange,
    handleRadioChange,
    originAttributeId
}: IListItemAttributeLink) => {
    const currentAccordion = stateListAttribute.accordionsActive?.find(
        accordionActive => accordionActive?.id === attribute.id && accordionActive.library === attribute.linkedLibrary
    );
    const [linkedAttributes, setLinkedAttribute] = useState<IAttribute[]>([]);

    const [getRecord, {called, loading, data, error}] = useLazyQuery(getLibraryDetailExtendsQuery, {
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
    };

    const isAccordionActive = currentAccordion?.id === attribute.id && currentAccordion?.depth === depth;

    return (
        <Wrapper>
            <CustomAccordion>
                <CustomAccordionTitle active={isAccordionActive} index={attribute.id} onClick={changeCurrentAccordion}>
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
                        <Checkbox
                            checked={attributeChecked?.checked}
                            onChange={(event, data) => handleCheckboxChange(data.checked ?? false)}
                        />
                    )}

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

export default ListItemAttributeLink;
