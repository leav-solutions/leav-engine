import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Button, Checkbox, CheckboxProps, Container, List} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLibraryDetailQuery} from '../../../../queries/libraries/getLibraryDetailQuery';
import {IFilters, operatorFilter, whereFilter} from '../../../../_types/types';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface IAttributeListProps {
    libId: string;
    libQueryName: string;
    setFilters: React.Dispatch<React.SetStateAction<IFilters[]>>;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
}

function AttributeList({libId, libQueryName, setFilters, setShowAttr}: IAttributeListProps): JSX.Element {
    const [attributes, setAttrs] = useState<any>([]);
    const [attSelected, setAttSelected] = useState<string[]>([]);

    const {loading, data, error} = useQuery(getLibraryDetailQuery(libQueryName), {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loading) {
            const attributes = data?.libraries?.list[0]?.attributes;
            setAttrs(attributes);
        }
    }, [loading, data, error]);

    const addFilters = () => {
        setFilters(filters => {
            const newFilters = attSelected.map((att, index) => ({
                key: filters.length + index,
                operator: operatorFilter.and,
                where: whereFilter.contains,
                value: '',
                attribute: att,
                active: true
            }));

            return [...filters, ...newFilters];
        });
        setShowAttr(false);
    };

    return (
        <Container>
            <List divided>
                {attributes &&
                    attributes.map((att: any) => <Attribute att={att} key={att.id} setAttSelected={setAttSelected} />)}
            </List>
            <Button onClick={addFilters}>{'Add'}</Button>
        </Container>
    );
}

interface IAttributeProps {
    att: any;
    setAttSelected: React.Dispatch<React.SetStateAction<string[]>>;
}
function Attribute({att, setAttSelected}: IAttributeProps): JSX.Element {
    const handleOnChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        if (data.checked) {
            setAttSelected(attSelected => [...attSelected, att.id]);
        } else {
            setAttSelected(attSelected => attSelected.filter(attId => attId !== att.id));
        }
    };

    return (
        <List.Item>
            <List.Icon name="square" size="large" verticalAlign="middle" />
            <List.Content verticalAlign="middle">
                <Wrapper>
                    <span>{att.id}</span>
                    <Checkbox onChange={handleOnChange} />
                </Wrapper>
            </List.Content>
        </List.Item>
    );
}

export default AttributeList;
