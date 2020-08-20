import {useLazyQuery} from '@apollo/client';
import {Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import {animated, useSpring} from 'react-spring';
import styled, {CSSObject} from 'styled-components';
import {getAttributeWithEmbeddedFields} from '../../../queries/attributes/getAttributeWithEmbeddedFields';
import {attributeUpdateSelection, localizedLabel} from '../../../utils';
import {AttributeFormat, IAttribute, IEmbeddedFields, IGroupEmbeddedFields} from '../../../_types/types';
import ListItemAttribute from '../AttributeBasic';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import {DeployButton, SmallText, TextAttribute} from '../StyledComponents';

const Child = styled.div`
    &&& {
        border-left: 3px solid #2185d0;
        padding-left: 0.8rem;
    }
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

interface IAttributeExtendedProps {
    attribute: IAttribute;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    previousDepth: number;
}

function AttributeExtended({
    attribute,
    stateListAttribute,
    dispatchListAttribute,
    previousDepth
}: IAttributeExtendedProps): JSX.Element {
    const [propsAnim, setAnim] = useSpring(() => ({display: 'none'}));

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
                isExpendable={true}
                onClick={toggleExpand}
                active={isAccordionActive}
                loading={loading && called}
                stateListAttribute={stateListAttribute}
                dispatchListAttribute={dispatchListAttribute}
                setAnim={setAnim}
            />
            <animated.div style={propsAnim}>
                {groupEmbeddedFields && called && !loading ? (
                    <ExploreEmbeddedFields
                        groupEmbeddedFields={groupEmbeddedFields}
                        setDepth={setDepth}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        attribute={attribute}
                    />
                ) : (
                    <Spin />
                )}
            </animated.div>
        </>
    );
}

interface IEmbeddedFieldItemProps {
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    attribute: IAttribute;
    isExpendable: boolean;
    onClick: () => void | undefined;
    active: boolean;
    loading: boolean;
    extendedPath?: string;
    embeddedField?: IEmbeddedFields;
    setAnim: (css: CSSObject) => void;
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
    setAnim
}: IEmbeddedFieldItemProps) => {
    const id = (embeddedField && embeddedField?.id) ?? attribute.id;
    const label = embeddedField?.label ?? embeddedField?.id ? false : attribute.label;

    const handleClick = () => {
        const newAttributesChecked = attributeUpdateSelection({
            attribute: attribute,
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
                    <Container>
                        <DeployButton
                            active={active}
                            called={true}
                            loading={loading}
                            changeCurrentAccordion={onClick}
                            setAnim={setAnim}
                        />
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
                <div onClick={handleClick}>
                    <ListItemAttribute
                        attribute={attribute}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        embeddedField={embeddedField}
                        extendedPath={extendedPath}
                    />
                </div>
            )}
        </>
    );
};

interface IDisplayGroupEmbeddedFields {
    groupEmbeddedFields: IGroupEmbeddedFields;
    setDepth: React.Dispatch<React.SetStateAction<number>>;
    stateListAttribute: ListAttributeState;
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
    const [propsAnim, setAnim] = useSpring(() => ({display: 'none'}));

    const exploreEmbeddedFields = (
        groupEmbeddedFields: IGroupEmbeddedFields | IEmbeddedFields[] | IEmbeddedFields,
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
                            setAnim={setAnim}
                        />
                        <animated.div style={propsAnim}>
                            <Child>
                                {exploreEmbeddedFields(
                                    embeddedField.embedded_fields,
                                    depth + 1,
                                    `${path}.${embeddedField.id}`
                                )}
                            </Child>
                        </animated.div>
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
                            setAnim={setAnim}
                        />
                    </div>
                );
            }
        };

        if (Array.isArray(groupEmbeddedFields)) {
            return groupEmbeddedFields.map(element => hasEmbeddedFields(element));
        } else {
            return Object.keys(groupEmbeddedFields)?.map(field => {
                const current = groupEmbeddedFields[field]?.embedded_fields;

                return (
                    <Child key={field}>
                        {current
                            ? exploreEmbeddedFields(current, depth + 1, `${field}`)
                            : groupEmbeddedFields[field].map((element: IEmbeddedFields) => hasEmbeddedFields(element))}
                    </Child>
                );
            });
        }
    };

    return <>{exploreEmbeddedFields(groupEmbeddedFields)}</>;
};
export default AttributeExtended;
