import {useQuery} from '@apollo/client';
import {Input, List} from 'antd';
import React, {useEffect, useReducer, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import themingVar from '../../themingVar.js';
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
import ListItemsSelected from './ListItemsSelected';
import {CustomForm} from './StyledComponents';

const Wrapper = styled.div`
    display: Grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 0.3rem;
`;

const ListingAttributeWrapper = styled.div`
    border-right: 1px solid ${themingVar['@primary-color']};
    padding: 0.3rem 1rem 0 1rem;
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

    if (!state.lang) {
        return <></>;
    }

    return (
        <>
            <Wrapper>
                <ListingAttributeWrapper>
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
                </ListingAttributeWrapper>
                <ListItemsSelected stateListAttribute={state} dispatchListAttribute={dispatch} />
            </Wrapper>
        </>
    );
}

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
