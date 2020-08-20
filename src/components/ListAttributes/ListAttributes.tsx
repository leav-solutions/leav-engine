import {CloseOutlined, MoreOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Button, Descriptions, Input, List} from 'antd';
import React, {useEffect, useReducer, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {localizedLabel} from '../../utils';
import {IAttribute, IAttributesChecked, IOriginAttributeData, ITreeData} from '../../_types/types';
import Attribute from './Attribute';
import {
    ListAttributeInitialState,
    ListAttributeReducer,
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from './ListAttributesReducer';
import {CustomForm, SmallText, TextAttribute} from './StyledComponents';

const Wrapper = styled.div`
    display: Grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 0.3rem;
`;

const FirstContainer = styled.div`
    border-right: 1px solid #f0f0f0;
    padding: 0 1rem;
    overflow-y: scroll;
    height: 80vh;
`;

interface IListAttributeProps {
    attributes: IAttribute[];
    attributeSelection?: string;
    changeSelected?: (attId: string) => void;
    useCheckbox?: boolean;
    attributesChecked?: IAttributesChecked[];
    setAttributesChecked?: React.Dispatch<React.SetStateAction<IAttributesChecked[]>>;
    setNewAttributes: React.Dispatch<React.SetStateAction<IAttribute[]>>;
}

function ListAttributes({
    attributes: attrs,
    attributeSelection,
    changeSelected,
    useCheckbox,
    attributesChecked,
    setAttributesChecked,
    setNewAttributes
}: IListAttributeProps): JSX.Element {
    const {t} = useTranslation();
    const searchRef = useRef<any>(null);

    const [attributes, setAttributes] = useState(attrs.filter(att => !att.originAttributeData?.id));
    const [state, dispatch] = useReducer(ListAttributeReducer, {
        ...ListAttributeInitialState,
        attributeSelection,
        changeSelected,
        useCheckbox,
        attributesChecked: attributesChecked ?? []
    });

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const handleSearchChange = (search: string) => {
        let attributesFilter = attrs.filter(
            att =>
                localizedLabel(att.label, lang).toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
                att.id.indexOf(search) !== -1
        );

        setAttributes(attributesFilter);
    };

    useEffect(() => {
        if (!state.lang) {
            dispatch({
                type: ListAttributeReducerActionTypes.SET_LANG,
                lang
            });
        }
        if (searchRef) {
            searchRef?.current?.focus();
        }
    }, [searchRef, lang, dispatch, state.lang]);

    useEffect(() => {
        if (state.attributesChecked && setAttributesChecked) {
            setAttributesChecked(state.attributesChecked.filter(attributeChecked => attributeChecked.checked));
        }
    }, [state.attributesChecked, setAttributesChecked, state.newAttributes]);

    useEffect(() => {
        setNewAttributes(state.newAttributes);
    }, [state.newAttributes, setNewAttributes]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (attributes.length >= 1) {
            if (useCheckbox) {
                const checked = !state.attributesChecked.find(ac => attributes[0].id === ac.id)?.checked;

                const newAttrsChecked: IAttributesChecked[] = [
                    ...state.attributesChecked.filter(ac => ac.id !== attributes[0].id),
                    {
                        id: attributes[0].id,
                        library: attributes[0].library,
                        label: attributes[0].label,
                        type: attributes[0].type,
                        depth: 0,
                        checked: checked
                    }
                ];

                dispatch({
                    type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
                    attributesChecked: newAttrsChecked
                });
            } else if (attributeSelection && changeSelected) {
                changeSelected(attributes[0].id);
            }
        }
    };

    const removeAttributeChecked = (attributeCheckedToRemove: IAttributesChecked) => {
        dispatch({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: state.attributesChecked.filter(attributeChecked =>
                attributeChecked.id === attributeCheckedToRemove.id
                    ? attributeChecked.library !== attributeCheckedToRemove.library
                    : true
            )
        });
    };

    if (!state.lang) {
        return <></>;
    }

    return (
        <>
            <Wrapper>
                <FirstContainer>
                    <CustomForm onSubmit={handleSubmit}>
                        <Input.Search
                            placeholder={t('attributes-list.search')}
                            ref={searchRef}
                            onChange={event => handleSearchChange(event.target.value ?? '')}
                        />
                    </CustomForm>
                    <ListingAttributes
                        attributes={attributes}
                        stateListAttribute={state}
                        dispatchListAttribute={dispatch}
                    />
                </FirstContainer>
                <div>
                    {state.attributesChecked.map(
                        attributeChecked =>
                            attributeChecked.checked && (
                                <LeftColumnItem
                                    key={`${attributeChecked.id}_${attributeChecked.library}_${attributeChecked.extendedData?.path}`}
                                    attributeChecked={attributeChecked}
                                    removeAttributeChecked={removeAttributeChecked}
                                    stateListAttribute={state}
                                />
                            )
                    )}
                </div>
            </Wrapper>
        </>
    );
}

interface LeftColumnItemProps {
    attributeChecked: IAttributesChecked;
    removeAttributeChecked: (attributeChecked: IAttributesChecked) => void;
    stateListAttribute: ListAttributeState;
}
const CustomCard = styled.div`
    &&& {
        padding: 0;
        margin: 24px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #f0f0f0;
        border-radius: 2px;
        min-height: 5rem;
    }
`;

const DragHandle = styled.div`
    border-right: 1px solid #f0f0f0;
    padding: 8px;

    display: flex;
    justify-content: center;
    align-items: center;

    * {
        color: #f0f0f0;
        font-size: 32px;
    }
`;

const Content = styled.div`
    padding: 8px;
    width: 50%;
`;

const CloseWrapper = styled.div`
    padding: 8px;
`;

const LeftColumnItem = ({attributeChecked, removeAttributeChecked, stateListAttribute}: LeftColumnItemProps) => {
    const {t} = useTranslation();
    return (
        <CustomCard>
            <DragHandle>
                <MoreOutlined />
            </DragHandle>
            <Content>
                <Descriptions
                    title={
                        <TextAttribute>
                            {stateListAttribute.lang &&
                            localizedLabel(attributeChecked.label, stateListAttribute.lang) ? (
                                <span>
                                    {localizedLabel(attributeChecked.label, stateListAttribute.lang)}
                                    <SmallText>{attributeChecked.id}</SmallText>
                                </span>
                            ) : (
                                attributeChecked.id
                            )}
                        </TextAttribute>
                    }
                >
                    <Descriptions.Item label={t('attributes-list.items-selected.library')}>
                        {attributeChecked.library}
                    </Descriptions.Item>
                </Descriptions>
            </Content>
            <CloseWrapper>
                <Button
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={() => {
                        removeAttributeChecked(attributeChecked);
                    }}
                />
            </CloseWrapper>
        </CustomCard>
    );
};

interface IListingAttributesProps {
    attributes: IAttribute[];
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    depth?: number;
    originAttributeData?: IOriginAttributeData;
    treeData?: ITreeData;
}

export const ListingAttributes = ({
    attributes,
    stateListAttribute,
    dispatchListAttribute,
    depth = 0,
    originAttributeData,
    treeData
}: IListingAttributesProps) => {
    return (
        <List>
            {attributes &&
                attributes.map(attribute => (
                    <Attribute
                        key={attribute.id}
                        stateListAttribute={stateListAttribute}
                        dispatchListAttribute={dispatchListAttribute}
                        attribute={attribute}
                        depth={depth}
                        originAttributeData={originAttributeData}
                        treeData={treeData}
                    />
                ))}
        </List>
    );
};

export default ListAttributes;
