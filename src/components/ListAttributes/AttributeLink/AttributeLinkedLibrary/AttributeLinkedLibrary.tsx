import {DownOutlined, LinkOutlined, UpOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Button, Checkbox, Radio, Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import {getLibraryDetailExtendedQuery} from '../../../../queries/libraries/getLibraryDetailExtendQuery';
import {attributeUpdateSelection, checkTypeIsLink, localizedLabel} from '../../../../utils';
import {IAccordionActive, IAttribute, IOriginAttributeData} from '../../../../_types/types';
import {ListingAttributes} from '../../ListAttributes';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../../ListAttributesReducer';
import {
    CustomAccordion,
    CustomAccordionContent,
    RowAttribute,
    SmallText,
    TextAttribute,
    WrapperAttribute,
    WrapperContentAttribute
} from '../../StyledComponents';

interface IAttributeLinkedLibraryProps {
    attribute: IAttribute;
    currentAccordion?: IAccordionActive;
    changeCurrentAccordion: () => void;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    depth: number;
    isChecked: boolean;
    originAttributeData?: IOriginAttributeData;
}

function AttributeLinkedLibrary({
    attribute,
    currentAccordion,
    changeCurrentAccordion,
    stateListAttribute,
    dispatchListAttribute,
    depth,
    isChecked,
    originAttributeData
}: IAttributeLinkedLibraryProps): JSX.Element {
    const [linkedAttributes, setLinkedAttributes] = useState<IAttribute[]>([]);
    const [getLinkedAttributes, {called, loading, data, error}] = useLazyQuery(getLibraryDetailExtendedQuery, {
        variables: {
            libId: attribute.linkedLibrary
        }
    });

    useEffect(() => {
        if (currentAccordion?.id === attribute.id && !called) {
            getLinkedAttributes();
        }

        if (called && !loading) {
            const newAttributes = data?.libraries?.list[0]?.attributes.map(attr => {
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
                    originAttributeData: {id: attribute.id, type: attribute.type}
                };

                return linkedAttribute;
            });

            setLinkedAttributes(newAttributes);

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_NEW_ATTRIBUTES,
                newAttributes
            });
        }
    }, [loading, called, data, currentAccordion, attribute, getLinkedAttributes, dispatchListAttribute]);

    if (error) {
        return <>error</>;
    }

    const isAccordionActive = currentAccordion && currentAccordion?.depth === depth;

    const handleClick = () => {
        const newAttributesChecked = attributeUpdateSelection({
            attribute,
            attributesChecked: stateListAttribute.attributesChecked,
            useCheckbox: !!stateListAttribute.useCheckbox,
            depth: depth,
            originAttributeData
        });

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: newAttributesChecked
        });
    };

    const handleRadioChange = () => {
        if (stateListAttribute.changeSelected) {
            stateListAttribute.changeSelected(attribute.id);
        }
    };

    return (
        <WrapperAttribute>
            <CustomAccordion>
                <CustomAccordionContent
                    key={attribute.id}
                    header={
                        <>
                            <Button
                                icon={isAccordionActive ? <UpOutlined /> : <DownOutlined />}
                                loading={called && loading}
                                onClick={changeCurrentAccordion}
                                size="small"
                                shape="circle"
                            />
                            <RowAttribute onClick={handleClick}>
                                <TextAttribute>
                                    {stateListAttribute.lang &&
                                    localizedLabel(attribute.label, stateListAttribute.lang) ? (
                                        <span>
                                            {localizedLabel(attribute.label, stateListAttribute.lang)}
                                            <SmallText>{attribute.id}</SmallText>
                                        </span>
                                    ) : (
                                        attribute.id
                                    )}
                                    <span>
                                        <LinkOutlined />
                                    </span>
                                </TextAttribute>
                                {stateListAttribute.useCheckbox && (
                                    <Checkbox checked={isChecked} onChange={handleClick} />
                                )}
                            </RowAttribute>

                            {stateListAttribute.attributeSelection && (
                                <Radio
                                    checked={stateListAttribute.attributeSelection === attribute.id}
                                    onChange={handleRadioChange}
                                />
                            )}
                        </>
                    }
                >
                    {loading ? (
                        <Spin />
                    ) : (
                        <WrapperContentAttribute>
                            <ListingAttributes
                                attributes={linkedAttributes}
                                stateListAttribute={stateListAttribute}
                                dispatchListAttribute={dispatchListAttribute}
                                depth={depth + 1}
                                originAttributeData={{id: attribute.id, type: attribute.type}}
                            />
                        </WrapperContentAttribute>
                    )}
                </CustomAccordionContent>
            </CustomAccordion>
        </WrapperAttribute>
    );
}

export default AttributeLinkedLibrary;
