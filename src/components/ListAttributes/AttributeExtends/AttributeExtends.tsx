import {useLazyQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Button, Icon, List, ListItem, Loader} from 'semantic-ui-react';
import styled from 'styled-components';
import {getAttributeWithEmbeddedFields} from '../../../queries/attributes/getAttributeWithEmbeddedFields';
import {localizedLabel} from '../../../utils';
import {
    AttributeFormat,
    IAttribute,
    IAttributesChecked,
    IEmbeddedFields,
    IGroupEmbeddedFields
} from '../../../_types/types';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import ListItemAttribute from '../ListItemAttribute';
import {
    CustomAccordion,
    CustomAccordionContent,
    CustomAccordionTitle,
    SmallText,
    Text,
    Wrapper
} from '../StyledComponents';

const Child = styled.div`
    &&& {
        border-left: 3px solid #2185d0;
        padding-left: 0.8rem;
    }
`;

interface IAttributeExtendsProps {
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    attribute: IAttribute;

    attributeChecked?: IAttributesChecked;
    handleCheckboxChange: (newChecked: boolean) => void;
    handleRadioChange: () => void;
}

function AttributeExtends({
    stateListAttribute,
    dispatchListAttribute,
    attribute,
    attributeChecked,
    handleCheckboxChange,
    handleRadioChange
}: IAttributeExtendsProps): JSX.Element {
    const currentAccordion = stateListAttribute.accordionsActive?.find(
        accordionActive => accordionActive?.id === attribute.id && accordionActive.library === attribute.library
    );

    const [depth, setDepth] = useState(0);

    const [groupEmbeddedFields, setGroupEmbeddedFields] = useState<IGroupEmbeddedFields>({});

    const [getEmbeddedFields, {data, called, loading, error, refetch}] = useLazyQuery(
        getAttributeWithEmbeddedFields(depth),
        {
            variables: {libId: attribute.id}
        }
    );

    useEffect(() => {
        if (currentAccordion?.id === attribute.id) {
            if (refetch) {
                // refetch();
            }
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
    }, [
        data,
        called,
        loading,
        dispatchListAttribute,
        depth,
        getEmbeddedFields,
        currentAccordion,
        attribute.id,
        refetch
    ]);

    const toggleExpand = () => {
        const id = attribute.id;
        const restAccordionsActive = stateListAttribute.accordionsActive.filter(
            accordionActive =>
                accordionActive.id !== id ||
                (accordionActive.id === id && accordionActive.library !== attribute.library)
        );
        let accordionsActive = [...restAccordionsActive];

        if (!currentAccordion) {
            accordionsActive = [
                {
                    id: attribute.id,
                    library: attribute.library,
                    depth
                }
            ];
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
        <ListItem>
            <List.Content verticalAlign="middle">
                <CustomAccordion>
                    <CustomAccordionTitle active={isAccordionActive} index={attribute.id}>
                        <EmbeddedFieldItem
                            element={attribute}
                            isExpendable={true}
                            onClick={toggleExpand}
                            active={!!currentAccordion}
                            loading={loading && called}
                            depth={0}
                            stateListAttribute={stateListAttribute}
                            dispatchListAttribute={dispatchListAttribute}
                            attributeChecked={attributeChecked}
                            handleCheckboxChange={handleCheckboxChange}
                            handleRadioChange={handleRadioChange}
                        />
                    </CustomAccordionTitle>
                    <CustomAccordionContent active={isAccordionActive}>
                        {groupEmbeddedFields && called && !loading ? (
                            <ExploreEmbeddedFields
                                groupEmbeddedFields={groupEmbeddedFields}
                                setDepth={setDepth}
                                stateListAttribute={stateListAttribute}
                                dispatchListAttribute={dispatchListAttribute}
                                library={attribute.library}
                                attributeChecked={attributeChecked}
                                handleCheckboxChange={handleCheckboxChange}
                                handleRadioChange={handleRadioChange}
                            />
                        ) : (
                            <Loader />
                        )}
                    </CustomAccordionContent>
                </CustomAccordion>
            </List.Content>
        </ListItem>
    );
}

interface IEmbeddedFieldItemProps {
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    element: IAttribute | IEmbeddedFields;
    isExpendable: boolean;
    onClick: () => void | undefined;
    active: boolean;
    loading: boolean;
    depth: number;

    attributeChecked?: IAttributesChecked;
    handleCheckboxChange: (newChecked: boolean) => void;
    handleRadioChange: () => void;
}

const EmbeddedFieldItem = ({
    stateListAttribute,
    dispatchListAttribute,
    element,
    isExpendable,
    onClick,
    active,
    loading,
    attributeChecked,
    handleCheckboxChange,
    handleRadioChange
}: IEmbeddedFieldItemProps) => {
    return (
        <>
            <>
                {isExpendable ? (
                    <Wrapper>
                        <div>
                            <Button
                                icon={active ? 'angle up' : 'angle down'}
                                loading={loading}
                                onClick={onClick}
                                compact
                                basic
                                size="mini"
                                circular
                            />{' '}
                            <Text>
                                {stateListAttribute.lang && localizedLabel(element.label, stateListAttribute.lang) ? (
                                    <span>
                                        {localizedLabel(element.label, stateListAttribute.lang)}{' '}
                                        <SmallText>{element.id}</SmallText>
                                    </span>
                                ) : (
                                    element.id
                                )}{' '}
                                <span>{isExpendable && <Icon name="external square" />}</span>
                            </Text>
                        </div>
                    </Wrapper>
                ) : (
                    <ListItemAttribute
                        attribute={element}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        attributeChecked={attributeChecked}
                        handleCheckboxChange={handleCheckboxChange}
                        handleRadioChange={handleRadioChange}
                    />
                )}
            </>
        </>
    );
};

interface IDisplayGroupEmbeddedFields {
    groupEmbeddedFields: IGroupEmbeddedFields | any;
    setDepth: React.Dispatch<React.SetStateAction<number>>;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    library: string;

    attributeChecked?: IAttributesChecked;
    handleCheckboxChange: (newChecked: boolean) => void;
    handleRadioChange: () => void;
}

const ExploreEmbeddedFields = ({
    groupEmbeddedFields,
    setDepth,
    stateListAttribute,
    dispatchListAttribute,
    library,
    attributeChecked,
    handleCheckboxChange,
    handleRadioChange
}: IDisplayGroupEmbeddedFields) => {
    const exploreEmbeddedFields = (
        groupEmbeddedFields: IGroupEmbeddedFields | IEmbeddedFields[] | IEmbeddedFields,
        depth: number = 0
    ) => {
        const hasEmbeddedFields = (embeddedField: IEmbeddedFields) => {
            if (embeddedField?.embedded_fields) {
                const isActive = !!stateListAttribute.accordionsActive.find(
                    accordionActive => accordionActive.id === embeddedField.id
                );

                const toggleExpand = () => {
                    setDepth(d => (d >= depth ? depth : d));
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
                                    library,
                                    depth
                                }
                            ]
                        });
                    }
                };

                return (
                    <div key={embeddedField.id}>
                        <CustomAccordionTitle active={isActive} index={embeddedField.id}>
                            <EmbeddedFieldItem
                                element={embeddedField}
                                isExpendable={embeddedField.format === AttributeFormat.extended}
                                onClick={toggleExpand}
                                active={isActive}
                                loading={false}
                                depth={depth}
                                stateListAttribute={stateListAttribute}
                                dispatchListAttribute={dispatchListAttribute}
                                attributeChecked={attributeChecked}
                                handleCheckboxChange={handleCheckboxChange}
                                handleRadioChange={handleRadioChange}
                                key={embeddedField.id}
                            />
                        </CustomAccordionTitle>
                        <CustomAccordionContent active={isActive}>
                            <Child>{exploreEmbeddedFields(embeddedField.embedded_fields, depth + 1)}</Child>
                        </CustomAccordionContent>
                    </div>
                );
            } else {
                const toggleExpand = () => {
                    setDepth(d => (d < depth ? depth : d));

                    dispatchListAttribute({
                        type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION,
                        accordionsActive: [
                            ...stateListAttribute.accordionsActive,
                            {
                                id: embeddedField.id,
                                library,
                                depth
                            }
                        ]
                    });
                };

                return (
                    <div key={embeddedField.id}>
                        <EmbeddedFieldItem
                            element={embeddedField}
                            isExpendable={embeddedField.format === AttributeFormat.extended}
                            onClick={toggleExpand}
                            active={!!embeddedField?.embedded_fields}
                            loading={false}
                            depth={depth}
                            stateListAttribute={stateListAttribute}
                            dispatchListAttribute={dispatchListAttribute}
                            attributeChecked={attributeChecked}
                            handleCheckboxChange={handleCheckboxChange}
                            handleRadioChange={handleRadioChange}
                            key={embeddedField.id}
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
                            ? exploreEmbeddedFields(current, depth + 1)
                            : groupEmbeddedFields[field].map(element => hasEmbeddedFields(element))}
                    </Child>
                );
            });
        }
    };

    return <>{exploreEmbeddedFields(groupEmbeddedFields)}</>;
};
export default AttributeExtends;
