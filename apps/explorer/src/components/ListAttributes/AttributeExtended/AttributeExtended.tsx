// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import {Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {getAttributeWithEmbeddedFields} from '../../../queries/attributes/getAttributeWithEmbeddedFields';
import {default as themingVar} from '../../../themingVar';
import {attributeUpdateSelection, localizedLabel} from '../../../utils';
import {AttributeFormat, IAttribute, IEmbeddedFields, IGroupEmbeddedFields} from '../../../_types/types';
import ListItemAttribute from '../AttributeBasic';
import {
    IListAttributeState,
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes
} from '../ListAttributesReducer';
import {DeployButton, DeployContent, SmallText, StyledDeployContent, TextAttribute} from '../StyledComponents';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface IContainerProps {
    children?: React.ReactNode;
    isChild?: boolean;
}

const Container = ({children, isChild}) => {
    if (isChild) {
        return <ContainerWithBefore>{children}</ContainerWithBefore>;
    }
    return <ContainerBasic>{children}</ContainerBasic>;
};

const ContainerBasic = styled.div<IContainerProps>`
    border: 1px solid ${themingVar['@divider-color']};
    border-radius: 2px;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 6px;

    & > * {
        padding: 0 6px;
    }
`;

const ContainerWithBefore = styled(ContainerBasic)`
    position: relative;
    margin-top: 1rem;
    margin-bottom: 0.5rem;

    &::before {
        content: '';
        position: absolute;
        left: -3.5rem;
        top: 1rem;
        width: 2rem;
        height: 1px;
        background: hsla(0, 0%, 0%, 0.1);
    }

    @keyframes anim-glow {
        0% {
            box-shadow: 0 0 0px 0 ${themingVar['@primary-color']};
        }
        50% {
            box-shadow: 0 0 5px 0 ${themingVar['@primary-color']};
        }
        100% {
            box-shadow: 0 0 0px 0 ${themingVar['@primary-color']};
        }
    }

    &::after {
        content: '';
        position: absolute;
        left: -1.5rem;
        top: 0.75rem;
        padding: 4px;
        border-radius: 100%;
        background: ${themingVar['@primary-color']};
        animation: anim-glow 5s ease infinite;
    }
`;

interface IAttributeExtendedProps {
    attribute: IAttribute;
    stateListAttribute: IListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    previousDepth: number;
}

function AttributeExtended({
    attribute,
    stateListAttribute,
    dispatchListAttribute,
    previousDepth
}: IAttributeExtendedProps): JSX.Element {
    const currentAccordion = stateListAttribute.accordionsActive?.find(
        accordionActive => accordionActive?.id === attribute.id && accordionActive.library === attribute.library
    );

    const [depth, setDepth] = useState(0);

    const [groupEmbeddedFields, setGroupEmbeddedFields] = useState<IGroupEmbeddedFields>({});

    const [getEmbeddedFields, {data, called, loading, error}] = useLazyQuery(getAttributeWithEmbeddedFields(depth), {
        variables: {libId: attribute.id}
    });

    useEffect(() => {
        if (currentAccordion?.id === attribute.id) {
            getEmbeddedFields();
        }

        if (called && !loading && data) {
            const dataGroupEmbeddedFields: IGroupEmbeddedFields = {};

            const dataEmbeddedFields = data.attributes.list[0];

            if (dataEmbeddedFields?.embedded_fields) {
                dataGroupEmbeddedFields[dataEmbeddedFields.id] = {
                    embedded_fields: dataEmbeddedFields?.embedded_fields
                };
            }

            setGroupEmbeddedFields(dataGroupEmbeddedFields);
        }
    }, [data, called, loading, dispatchListAttribute, depth, getEmbeddedFields, currentAccordion, attribute.id]);

    const toggleExpand = () => {
        const id = attribute.id;
        const restAccordionsActive = stateListAttribute.accordionsActive.filter(
            accordionActive =>
                accordionActive.id !== id ||
                (accordionActive.id === id && accordionActive.library !== attribute.library)
        );

        let accordionsActive = [...restAccordionsActive];

        if (!currentAccordion) {
            if (previousDepth) {
                accordionsActive = [
                    ...restAccordionsActive,
                    {
                        id,
                        library: attribute.library,
                        depth
                    }
                ];
            } else {
                accordionsActive = [
                    {
                        id,
                        library: attribute.library,
                        depth
                    }
                ];
            }
        }

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
            accordionsActive
        });
    };

    if (error) {
        return <>error</>;
    }

    const isAccordionActive = !!currentAccordion;

    return (
        <>
            <EmbeddedFieldItem
                attribute={attribute}
                isExpendable
                onClick={toggleExpand}
                active={isAccordionActive}
                loading={loading && called}
                stateListAttribute={stateListAttribute}
                dispatchListAttribute={dispatchListAttribute}
                depth={0}
            />
            <DeployContent active={isAccordionActive}>
                {groupEmbeddedFields && called && !loading ? (
                    <>
                        <ExploreEmbeddedFields
                            groupEmbeddedFields={groupEmbeddedFields}
                            setDepth={setDepth}
                            stateListAttribute={stateListAttribute}
                            dispatchListAttribute={dispatchListAttribute}
                            attribute={attribute}
                        />
                    </>
                ) : (
                    <Spin />
                )}
            </DeployContent>
        </>
    );
}

interface IEmbeddedFieldItemProps {
    stateListAttribute: IListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    attribute: IAttribute;
    isExpendable: boolean;
    onClick: () => void | undefined;
    active: boolean;
    loading: boolean;
    extendedPath?: string;
    embeddedField?: IEmbeddedFields;
    depth: number;
}

const EmbeddedFieldItem = ({
    stateListAttribute,
    dispatchListAttribute,
    attribute,
    isExpendable,
    onClick,
    active,
    loading,
    extendedPath,
    embeddedField,
    depth
}: IEmbeddedFieldItemProps) => {
    const id = (embeddedField && embeddedField?.id) ?? attribute.id;
    const label = embeddedField?.label ?? embeddedField?.id ? false : attribute.label;

    const handleClick = () => {
        const newAttributesChecked = attributeUpdateSelection({
            attribute,
            attributesChecked: stateListAttribute.attributesChecked,
            useCheckbox: !!stateListAttribute.useCheckbox,
            depth: 0,
            extendedData: embeddedField ? {path: extendedPath || '', format: embeddedField.format} : undefined
        });

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: newAttributesChecked
        });
    };

    return (
        <>
            {isExpendable ? (
                <Wrapper>
                    <Container isChild={!!depth}>
                        <DeployButton active={active} called loading={loading} changeCurrentAccordion={onClick} />
                        <TextAttribute>
                            {stateListAttribute.lang && localizedLabel(label, stateListAttribute.lang) ? (
                                <span>
                                    {localizedLabel(label, stateListAttribute.lang)}
                                    <SmallText>{id}</SmallText>
                                </span>
                            ) : (
                                id
                            )}
                        </TextAttribute>
                    </Container>
                </Wrapper>
            ) : (
                <div style={{padding: '1rem 0'}} onClick={handleClick}>
                    <ListItemAttribute
                        attribute={attribute}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        embeddedField={embeddedField}
                        extendedPath={extendedPath}
                        depth={1}
                    />
                </div>
            )}
        </>
    );
};

interface IDisplayGroupEmbeddedFields {
    groupEmbeddedFields: IGroupEmbeddedFields;
    setDepth: React.Dispatch<React.SetStateAction<number>>;
    stateListAttribute: IListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    attribute: IAttribute;
}

const ExploreEmbeddedFields = ({
    groupEmbeddedFields,
    setDepth,
    stateListAttribute,
    dispatchListAttribute,
    attribute
}: IDisplayGroupEmbeddedFields) => {
    const exploreEmbeddedFields = (
        embeddedFields: IGroupEmbeddedFields | IEmbeddedFields[] | IEmbeddedFields,
        depth: number = 0,
        path: string = ''
    ) => {
        const hasEmbeddedFields = (embeddedField: IEmbeddedFields) => {
            if (embeddedField?.embedded_fields) {
                const isActive = stateListAttribute.accordionsActive.some(
                    accordionActive => accordionActive.id === embeddedField.id
                );

                const toggleExpand = () => {
                    setDepth(currentDepth => (currentDepth >= depth ? depth : currentDepth));

                    if (isActive) {
                        dispatchListAttribute({
                            type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
                            accordionsActive: stateListAttribute.accordionsActive.filter(
                                accordion => accordion.id !== embeddedField.id
                            )
                        });
                    } else {
                        dispatchListAttribute({
                            type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
                            accordionsActive: [
                                ...stateListAttribute.accordionsActive,
                                {
                                    id: embeddedField.id,
                                    library: attribute.library,
                                    depth
                                }
                            ]
                        });
                    }
                };

                return (
                    <div key={embeddedField.id}>
                        <div>
                            <EmbeddedFieldItem
                                attribute={attribute}
                                embeddedField={embeddedField}
                                isExpendable={embeddedField.format === AttributeFormat.extended}
                                onClick={toggleExpand}
                                active={isActive}
                                loading={false}
                                extendedPath={`${path}.${embeddedField.id}`}
                                stateListAttribute={stateListAttribute}
                                dispatchListAttribute={dispatchListAttribute}
                                key={embeddedField.id}
                                depth={depth}
                            />
                        </div>
                        <StyledDeployContent>
                            <DeployContent active={isActive}>
                                <div>
                                    <div>
                                        {exploreEmbeddedFields(
                                            embeddedField.embedded_fields,
                                            depth + 1,
                                            `${path}.${embeddedField.id}`
                                        )}
                                    </div>
                                </div>
                            </DeployContent>
                        </StyledDeployContent>
                    </div>
                );
            } else {
                const toggleExpand = () => {
                    setDepth(currentDepth => (currentDepth < depth ? depth : currentDepth));

                    dispatchListAttribute({
                        type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
                        accordionsActive: [
                            ...stateListAttribute.accordionsActive,
                            {
                                id: embeddedField.id,
                                library: attribute.library,
                                depth
                            }
                        ]
                    });
                };

                return (
                    <div key={embeddedField.id}>
                        <EmbeddedFieldItem
                            attribute={attribute}
                            embeddedField={embeddedField}
                            isExpendable={embeddedField.format === AttributeFormat.extended}
                            onClick={toggleExpand}
                            active={!!embeddedField?.embedded_fields}
                            loading={false}
                            extendedPath={`${path}.${embeddedField.id}`}
                            stateListAttribute={stateListAttribute}
                            dispatchListAttribute={dispatchListAttribute}
                            key={embeddedField.id}
                            depth={depth}
                        />
                    </div>
                );
            }
        };

        if (Array.isArray(embeddedFields)) {
            return embeddedFields.map(element => hasEmbeddedFields(element));
        } else {
            return Object.keys(embeddedFields)?.map(field => {
                const current = embeddedFields[field]?.embedded_fields;

                return (
                    <div key={field}>
                        {current
                            ? exploreEmbeddedFields(current, depth + 1, `${field}`)
                            : embeddedFields[field].map((element: IEmbeddedFields) => hasEmbeddedFields(element))}
                    </div>
                );
            });
        }
    };

    return (
        <StyledDeployContent style={{marginLeft: '5rem'}}>
            {exploreEmbeddedFields(groupEmbeddedFields)}
        </StyledDeployContent>
    );
};
export default AttributeExtended;
