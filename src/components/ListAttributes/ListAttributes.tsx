import {useQuery} from '@apollo/client';
import React, {useEffect, useRef, useState} from 'react';
import {Checkbox, Container, Input, List, Radio} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {localizedLabel} from '../../utils';
import {AttributeFormat, IAttribute} from '../../_types/types';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Text = styled.span`
    color: hsl(0, 0%, 13%);
    font-weight: 700;
`;

const SmallText = styled.span`
    color: hsl(0, 0%, 45%);
    font-weight: 400;
`;

const ListItem = styled(List.Item)`
    &&&& {
        padding: 0.7rem 1rem;

        &:hover {
            background: hsl(0, 0%, 90%);
            border-radius: 0.25rem;
        }
    }
`;

const CustomForm = styled.form`
    width: 100%;
`;

const CustomInput = styled(Input)`
    &&& {
        input {
            background: hsl(0, 0%, 95%);
            border: none;
        }
    }
`;

interface IAttrsChecked {
    id: string;
    checked: boolean;
}

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
    const searchRef = useRef<any>(null);

    const [attributes, setAttributes] = useState(attrs);
    const [attrsChecked, setAttrsChecked] = useState(
        attributes.map(attribute => ({
            id: attribute.id,
            checked: attributesChecked ? !!attributesChecked.find(col => attribute.id === col.id) : false
        }))
    );

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
        if (searchRef) {
            searchRef?.current?.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (attributes.length >= 1) {
            if (useCheckbox && onCheckboxChange) {
                const checked = !attrsChecked.find(ac => attributes[0].id === ac.id)?.checked;

                const newAttrsChecked: IAttrsChecked[] = [
                    ...attrsChecked.filter(ac => ac.id !== attributes[0].id),
                    {id: attributes[0].id, checked: checked}
                ];

                setAttrsChecked(newAttrsChecked);
                onCheckboxChange(attributes[0], checked);
            } else if (attributeSelection && changeSelected) {
                changeSelected(attributes[0].id);
            }
        }
    };

    return (
        <Container>
            <CustomForm onSubmit={handleSubmit}>
                <CustomInput
                    icon="search"
                    ref={searchRef}
                    fluid
                    onChange={(event, data) => handleChange(data.value ?? '')}
                />
            </CustomForm>

            <List>
                {attributes &&
                    attributes.map(
                        att =>
                            Object.values(AttributeFormat).includes(att.format) && (
                                <Attribute
                                    key={att.id}
                                    attrsChecked={attrsChecked}
                                    setAttrsChecked={setAttrsChecked}
                                    attribute={att}
                                    attributeSelection={attributeSelection}
                                    changeSelected={changeSelected}
                                    useCheckbox={useCheckbox}
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
    attrsChecked: IAttrsChecked[];
    setAttrsChecked: React.Dispatch<React.SetStateAction<IAttrsChecked[]>>;
    attribute: IAttribute;
    attributeSelection?: string;
    changeSelected?: (attId: string) => void;
    useCheckbox?: boolean;
    onCheckboxChange?: (attribute: IAttribute, checked: boolean) => void;
    lang: any;
}

function Attribute({
    attrsChecked,
    setAttrsChecked,
    attribute,
    attributeSelection,
    changeSelected,
    useCheckbox,
    onCheckboxChange,
    lang
}: IAttributeProps): JSX.Element {
    const checked = attrsChecked.find(ac => ac.id === attribute.id);

    const handleClick = () => {
        const newChecked = !checked?.checked;
        if (onCheckboxChange) {
            onCheckboxChange(attribute, newChecked);
        } else if (changeSelected) {
            handleRadioChange();
        }

        const newAttrsChecked: IAttrsChecked[] = [
            ...attrsChecked.filter(ac => ac.id !== attribute.id),
            {id: attribute.id, checked: newChecked}
        ];

        setAttrsChecked(newAttrsChecked);
    };

    const handleCheckboxChange = (newChecked: boolean) => {
        if (onCheckboxChange) {
            onCheckboxChange(attribute, newChecked);
        }

        const newAttrsChecked: IAttrsChecked[] = [
            ...attrsChecked.filter(ac => ac.id !== attribute.id),
            {id: attribute.id, checked: newChecked}
        ];
        setAttrsChecked(newAttrsChecked);
    };

    const handleRadioChange = () => {
        if (changeSelected) {
            changeSelected(attribute.id);
        }
    };

    return (
        <>
            <ListItem onClick={handleClick}>
                <List.Content verticalAlign="middle">
                    <Wrapper>
                        {localizedLabel(attribute.label, lang) ? (
                            <Text>
                                {localizedLabel(attribute.label, lang)} <SmallText>{attribute.id}</SmallText>
                            </Text>
                        ) : (
                            <Text>{attribute.id}</Text>
                        )}
                        {useCheckbox && (
                            <Checkbox
                                checked={checked?.checked}
                                onChange={(event, data) => handleCheckboxChange(data.checked ?? false)}
                            />
                        )}

                        {attributeSelection && (
                            <Radio checked={attributeSelection === attribute.id} onChange={handleRadioChange} />
                        )}
                    </Wrapper>
                </List.Content>
            </ListItem>
        </>
    );
}

export default ListAttributes;
