import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, CheckboxProps, Container, List} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLibraryDetailQuery} from '../../../../queries/libraries/getLibraryDetailQuery';
import {allowedTypeOperator} from '../../../../utils';
import {
    AttributeFormat,
    conditionFilter,
    FilterTypes,
    IFilter,
    IFilterSeparator,
    operatorFilter
} from '../../../../_types/types';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface IAttributeListProps {
    libId: string;
    libQueryName: string;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
    filterOperator: operatorFilter;
    updateFilters: () => void;
}

function AttributeList({
    libId,
    libQueryName,
    setFilters,
    setShowAttr,
    filterOperator,
    updateFilters
}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const [attributes, setAttrs] = useState<any>([]);
    const [attSelected, setAttSelected] = useState<{id: string; format: AttributeFormat}[]>([]);

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
            const separators = filters.filter(filter => filter.type === FilterTypes.separator);
            const newFilters: IFilter[] = attSelected.map((att, index) => {
                // take the first operator for the format of the attribute
                const defaultWhereOperator = allowedTypeOperator[AttributeFormat[att.format]][0];

                // if the new filter is after a separator, don't set operator
                // separator key is the filters length when separator was add
                const lastFilterIsSeparatorCondition = separators.some(
                    separator => separator.key === filters.length + index - 1
                );

                return {
                    type: FilterTypes.filter,
                    key: filters.length + index,
                    operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                    condition: conditionFilter[defaultWhereOperator],
                    value: '',
                    attribute: att.id,
                    active: true,
                    format: att.format
                };
            });

            return [...filters, ...newFilters] as (IFilter | IFilterSeparator)[];
        });
        setShowAttr(false);
        updateFilters();
    };

    return (
        <Container>
            <List divided>
                {attributes &&
                    attributes.map(
                        (att: any) =>
                            Object.values(AttributeFormat).includes(att.format) && (
                                <Attribute att={att} key={att.id} setAttSelected={setAttSelected} />
                            )
                    )}
            </List>
            <Button onClick={addFilters}>{t('attribute-list.add')}</Button>
        </Container>
    );
}

interface IAttributeProps {
    att: any;
    setAttSelected: React.Dispatch<React.SetStateAction<{id: string; format: AttributeFormat}[]>>;
}
function Attribute({att, setAttSelected}: IAttributeProps): JSX.Element {
    const handleOnChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        if (data.checked) {
            setAttSelected(attSelected => [...attSelected, {id: att.id, format: att.format}]);
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
