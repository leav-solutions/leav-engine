import {useQuery} from '@apollo/client';
import React, {useState} from 'react';
import {Checkbox, Container, Divider, Input, List, Radio} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {localizedLabel} from '../../utils';
import {AttributeFormat, IAttribute} from '../../_types/types';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Small = styled.small`
    opacity: 0.5;
`;

interface IListAttributeProps {
    attributes: IAttribute[];
    attributeSelection?: string;
    changeSelected?: (attId: string) => void;
    useCheckbox?: boolean;
    attributesChecked?: {id: string}[];
    onCheckboxChange?: (attribute: IAttribute, checked: boolean) => void;
}

function ListAttributes({
    attributes: attrs,
    attributeSelection,
    changeSelected,
    useCheckbox,
    attributesChecked,
    onCheckboxChange
}: IListAttributeProps): JSX.Element {
    const [attributes, setAttributes] = useState(attrs);

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const handleChange = (search: string) => {
        const attributesFilter = attributes.filter(
            att => localizedLabel(att.label, lang).indexOf(search) !== -1 || att.id.indexOf(search) !== -1
        );
        setAttributes(attributesFilter);
    };

    return (
        <Container>
            <Input icon="search" onChange={(event, data) => handleChange(data.value ?? '')} />

            <Divider />

            <List divided>
                {attributes &&
                    attributes.map(
                        att =>
                            Object.values(AttributeFormat).includes(att.format) && (
                                <Attribute
                                    key={att.id}
                                    attribute={att}
                                    attributeSelection={attributeSelection}
                                    changeSelected={changeSelected}
                                    useCheckbox={useCheckbox}
                                    attributesChecked={attributesChecked}
                                    onCheckboxChange={onCheckboxChange}
                                    lang={lang}
                                />
                            )
                    )}
            </List>
        </Container>
    );
}

interface IAttributeProps {
    attribute: IAttribute;
    attributeSelection?: string;
    changeSelected?: (attId: string) => void;
    useCheckbox?: boolean;
    attributesChecked?: {id: string}[];
    onCheckboxChange?: (attribute: IAttribute, checked: boolean) => void;
    lang: any;
}

function Attribute({
    attribute,
    attributeSelection,
    changeSelected,
    useCheckbox,
    attributesChecked,
    onCheckboxChange,
    lang
}: IAttributeProps): JSX.Element {
    const [checked, setChecked] = useState(
        attributesChecked ? !!attributesChecked.find(col => attribute.id === col.id) : false
    );

    const handleClick = () => {
        const newChecked = !checked;
        if (onCheckboxChange) {
            onCheckboxChange(attribute, newChecked);
        } else if (changeSelected) {
            handleRadioChange();
        }
        setChecked(newChecked);
    };

    const handleCheckboxChange = (newChecked: boolean) => {
        if (onCheckboxChange) {
            onCheckboxChange(attribute, newChecked);
        }
        setChecked(newChecked);
    };

    const handleRadioChange = () => {
        if (changeSelected) {
            changeSelected(attribute.id);
        }
    };

    return (
        <>
            <List.Item onClick={handleClick}>
                <List.Content verticalAlign="middle">
                    <Wrapper>
                        {localizedLabel(attribute.label, lang) ? (
                            <span>
                                {localizedLabel(attribute.label, lang)} <Small>{attribute.id}</Small>
                            </span>
                        ) : (
                            <span>{attribute.id}</span>
                        )}
                        {useCheckbox && (
                            <Checkbox
                                checked={checked}
                                onChange={(event, data) => handleCheckboxChange(data.checked ?? false)}
                            />
                        )}

                        {attributeSelection && (
                            <Radio checked={attributeSelection === attribute.id} onChange={handleRadioChange} />
                        )}
                    </Wrapper>
                </List.Content>
            </List.Item>
        </>
    );
}

export default ListAttributes;
