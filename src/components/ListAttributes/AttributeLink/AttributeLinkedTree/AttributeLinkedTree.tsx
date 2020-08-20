import {IdcardOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Checkbox, Radio, Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import {animated, useSpring} from 'react-spring';
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
import {DeployButton, SmallText, TextAttribute, WrapperContentAttribute} from '../../StyledComponents';

const LibraryName = styled.div`
    font-weight: 300;
    opacity: 0.3;
    width: 100%;
    justify-content: space-around;
    display: flex;
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Container = styled.div`
    border: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 6px;

    & > * {
        padding: 0 6px;
    }
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
    const [propsAnim, setAnim] = useSpring(() => ({display: 'block'}));

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
        <>
            <Wrapper>
                <Container>
                    <DeployButton
                        active={isAccordionActive}
                        called={called}
                        loading={loading}
                        changeCurrentAccordion={changeCurrentAccordion}
                        setAnim={setAnim}
                    />
                    <TextAttribute>
                        {stateListAttribute.lang && localizedLabel(attribute.label, stateListAttribute.lang) ? (
                            <span>
                                {localizedLabel(attribute.label, stateListAttribute.lang)}
                                <SmallText>{attribute.id}</SmallText>
                            </span>
                        ) : (
                            attribute.id
                        )}
                    </TextAttribute>

                    <IdcardOutlined style={{fontSize: '18px'}} />
                </Container>

                {stateListAttribute.useCheckbox && <Checkbox checked={isChecked} onChange={handleClick} />}

                {stateListAttribute.attributeSelection && (
                    <Radio
                        checked={stateListAttribute.attributeSelection === attribute.id}
                        onChange={handleRadioChange}
                    />
                )}
            </Wrapper>

            {loading ? (
                <Spin />
            ) : (
                <animated.div style={propsAnim}>
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
                </animated.div>
            )}
        </>
    );
}

export default AttributeLinkedTree;
