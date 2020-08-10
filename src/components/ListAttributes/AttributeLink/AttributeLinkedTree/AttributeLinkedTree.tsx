import {useLazyQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Icon, Loader, Radio} from 'semantic-ui-react';
import styled from 'styled-components';
import {getTreeAttributesQuery} from '../../../../queries/trees/getTreeAttributesQuery';
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
    CustomAccordionTitle,
    RowAttribute,
    SmallText,
    TextAttribute,
    WrapperAttribute,
    WrapperContentAttribute
} from '../../StyledComponents';

const LibraryName = styled.div`
    font-weight: 300;
    opacity: 0.3;
    width: 100%;
    justify-content: space-around;
    display: flex;
`;

interface ITreeLinkedAttribute {
    attributes: IAttribute[];
    library: string;
    libraryTypeName: string;
}

interface IAttributeLinkedTreeProps {
    attribute: IAttribute;
    currentAccordion?: IAccordionActive;
    changeCurrentAccordion: () => void;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    depth: number;
    isChecked: boolean;
    originAttributeData?: IOriginAttributeData;
}

function AttributeLinkedTree({
    attribute,
    currentAccordion,
    changeCurrentAccordion,
    stateListAttribute,
    dispatchListAttribute,
    depth,
    isChecked,
    originAttributeData
}: IAttributeLinkedTreeProps): JSX.Element {
    const [linkedAttributes, setLinkedAttributes] = useState<ITreeLinkedAttribute[]>([]);

    const [getLinkedAttributes, {called, loading, data, error}] = useLazyQuery(getTreeAttributesQuery, {
        variables: {
            treeId: attribute.linkedTree
        }
    });

    useEffect(() => {
        if (currentAccordion?.id === attribute.id && !called) {
            getLinkedAttributes();
        }

        if (called && !loading) {
            const newLinkedAttributes: ITreeLinkedAttribute[] = data?.trees?.list[0]?.libraries?.map(library => {
                return {
                    library: library.id,
                    libraryTypeName: library.gqlNames.type,
                    attributes: library.attributes.map(attr => ({
                        id: attr.id,
                        type: attr.type,
                        format: attr.format,
                        label: attr.label,
                        isLink: checkTypeIsLink(attr.type),
                        isMultiple: attr.multiple_values,
                        linkedLibrary: attr.linked_library,
                        linkedTree: attr.linked_tree,
                        library: library.id,
                        originAttributeData: {id: attribute.id, type: attribute.type}
                    }))
                };
            });

            setLinkedAttributes(newLinkedAttributes);

            const newAttributes: IAttribute[] = newLinkedAttributes
                .map(lib => {
                    return lib.attributes;
                })
                .flat();

            dispatchListAttribute({
                type: ListAttributeReducerActionTypes.SET_NEW_ATTRIBUTES,
                newAttributes
            });
        }
    }, [
        loading,
        called,
        data,
        currentAccordion,
        attribute,
        getLinkedAttributes,
        setLinkedAttributes,
        dispatchListAttribute
    ]);

    if (error) {
        return <>error</>;
    }

    const isAccordionActive = currentAccordion && currentAccordion?.depth === depth;

    const handleClick = () => {
        const newAttributesChecked = attributeUpdateSelection({
            attribute,
            attributesChecked: stateListAttribute.attributesChecked,
            useCheckbox: !!stateListAttribute.useCheckbox,
            depth,
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
                <CustomAccordionTitle active={isAccordionActive} index={attribute.id}>
                    <Button
                        icon={isAccordionActive ? 'angle up' : 'angle down'}
                        loading={called && loading}
                        onClick={changeCurrentAccordion}
                        compact
                        size="mini"
                        circular
                    />
                    <RowAttribute onClick={handleClick}>
                        <TextAttribute>
                            {stateListAttribute.lang && localizedLabel(attribute.label, stateListAttribute.lang) ? (
                                <span>
                                    {localizedLabel(attribute.label, stateListAttribute.lang)}
                                    <SmallText>{attribute.id}</SmallText>
                                </span>
                            ) : (
                                attribute.id
                            )}
                            <span>
                                <Icon name="tree" />
                            </span>
                        </TextAttribute>
                        {stateListAttribute.useCheckbox && <Checkbox checked={isChecked} onChange={handleClick} />}
                    </RowAttribute>

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
                        <WrapperContentAttribute>
                            {linkedAttributes.map(linkedAttribute => (
                                <div key={linkedAttribute.library}>
                                    <LibraryName>{linkedAttribute.library}</LibraryName>
                                    <ListingAttributes
                                        attributes={linkedAttribute.attributes}
                                        stateListAttribute={stateListAttribute}
                                        dispatchListAttribute={dispatchListAttribute}
                                        depth={depth + 1}
                                        originAttributeData={{id: attribute.id, type: attribute.type}}
                                        treeData={{
                                            attributeTreeId: attribute.id,
                                            libraryTypeName: linkedAttribute.libraryTypeName
                                        }}
                                    />
                                </div>
                            ))}
                        </WrapperContentAttribute>
                    )}
                </CustomAccordionContent>
            </CustomAccordion>
        </WrapperAttribute>
    );
}

export default AttributeLinkedTree;
