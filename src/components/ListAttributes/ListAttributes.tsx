import {useQuery} from '@apollo/client';
import React, {useEffect, useReducer, useRef, useState} from 'react';
import {Container, List, Segment} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {localizedLabel} from '../../utils';
import {IAttribute, IAttributesChecked} from '../../_types/types';
import Attribute from './Attribute';
import {
    ListAttributeInitialState,
    ListAttributeReducer,
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from './ListAttributesReducer';
import {CustomForm, CustomInput} from './StyledComponents';

const Wrapper = styled.div`
    display: Grid;
    grid-template-columns: 1fr 10rem;
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
    const searchRef = useRef<any>(null);

    const [attributes, setAttributes] = useState(attrs);
    const [state, dispatch] = useReducer(ListAttributeReducer, {
        ...ListAttributeInitialState,
        attributeSelection,
        changeSelected,
        useCheckbox,
        attributesChecked: attributesChecked ?? []
    });

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const handleChange = (search: string) => {
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
            setAttributesChecked(state.attributesChecked);
        }
    }, [state.attributesChecked, setAttributesChecked]);

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
                    {id: attributes[0].id, library: attributes[0].library, depth: 0, checked: checked}
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
        <Container>
            <Wrapper>
                <div>
                    <CustomForm onSubmit={handleSubmit}>
                        <CustomInput
                            icon="search"
                            ref={searchRef}
                            fluid
                            onChange={(event, data) => handleChange(data.value ?? '')}
                        />
                    </CustomForm>
                    <ListingAttributes
                        attributes={attributes}
                        stateListAttribute={state}
                        dispatchListAttribute={dispatch}
                    />
                </div>
                <div>
                    {state.attributesChecked.map(
                        attributeChecked =>
                            attributeChecked.checked && (
                                <Segment key={`${attributeChecked.id}${attributeChecked.library}`}>
                                    {attributeChecked.id} | {attributeChecked.library} |{' '}
                                    {attributeChecked.checked.toString()}
                                </Segment>
                            )
                    )}
                </div>
            </Wrapper>
        </Container>
    );
}

interface IListingAttributesProps {
    attributes: IAttribute[];
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    depth?: number;
    originAttributeId?: string;
}

export const ListingAttributes = ({
    attributes,
    stateListAttribute,
    dispatchListAttribute,
    depth = 0,
    originAttributeId
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
                        originAttributeId={originAttributeId}
                    />
                ))}
        </List>
    );
};

export default ListAttributes;
