import {useLazyQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Button, Icon, List, Loader} from 'semantic-ui-react';
import styled from 'styled-components';
import {getAttributeWithEmbeddedFields} from '../../../queries/attributes/getAttributeWithEmbeddedFields';
import {attributeUpdateSelection, localizedLabel} from '../../../utils';
import {AttributeFormat, IAttribute, IEmbeddedFields, IGroupEmbeddedFields} from '../../../_types/types';
import ListItemAttribute from '../AttributeBasic';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import {
    CustomAccordion,
    CustomAccordionContent,
    CustomAccordionTitle,
    ListItem,
    SmallText,
    TextAttribute,
    WrapperAttribute
} from '../StyledComponents';

const Child = styled.div`
    &&& {
        border-left: 3px solid #2185d0;
        padding-left: 0.8rem;
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
        <CustomAccordion>
            <CustomAccordionTitle active={isAccordionActive} index={attribute.id}>
                <EmbeddedFieldItem
                    attribute={attribute}
                    isExpendable={true}
                    onClick={toggleExpand}
                    active={!!currentAccordion}
                    loading={loading && called}
                    stateListAttribute={stateListAttribute}
                    dispatchListAttribute={dispatchListAttribute}
                />
            </CustomAccordionTitle>
            <CustomAccordionContent active={isAccordionActive}>
                {groupEmbeddedFields && called && !loading ? (
                    <ExploreEmbeddedFields
                        groupEmbeddedFields={groupEmbeddedFields}
                        setDepth={setDepth}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        attribute={attribute}
                    />
                ) : (
                    <Loader />
                )}
            </CustomAccordionContent>
        </CustomAccordion>
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
}

const CustomWrapper = styled(WrapperAttribute)`
    width: 100%;
    & {
        * > * {
            margin: 0 0.2rem;
        }
    }
`;

const EmbeddedFieldItem = ({
    stateListAttribute,
    dispatchListAttribute,
    attribute,
    isExpendable,
    onClick,
    active,
    loading,
    extendedPath,
    embeddedField
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
        <CustomWrapper>
            {isExpendable ? (
                <WrapperAttribute>
                    <div>
                        <Button
                            icon={active ? 'angle up' : 'angle down'}
                            loading={loading}
                            onClick={onClick}
                            compact
                            size="mini"
                            circular
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
                            <span>{isExpendable && <Icon name="external square" />}</span>
                        </TextAttribute>
                    </div>
                </WrapperAttribute>
            ) : (
                <ListItem onClick={handleClick}>
                    <List.Content verticalAlign="middle">
                        <ListItemAttribute
                            attribute={attribute}
                            stateListAttribute={stateListAttribute}
                            dispatchListAttribute={dispatchListAttribute}
                            embeddedField={embeddedField}
                            extendedPath={extendedPath}
                        />
                    </List.Content>
                </ListItem>
            )}
        </CustomWrapper>
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
                    <CustomAccordion key={embeddedField.id}>
                        <CustomAccordionTitle active={isActive} index={embeddedField.id}>
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
                            />
                        </CustomAccordionTitle>
                        <CustomAccordionContent active={isActive}>
                            <Child>
                                {exploreEmbeddedFields(
                                    embeddedField.embedded_fields,
                                    depth + 1,
                                    `${path}.${embeddedField.id}`
                                )}
                            </Child>
                        </CustomAccordionContent>
                    </CustomAccordion>
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
                    <CustomAccordionTitle key={embeddedField.id}>
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
                        />
                    </CustomAccordionTitle>
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
