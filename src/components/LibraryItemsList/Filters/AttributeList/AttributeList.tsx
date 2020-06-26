import {useQuery} from '@apollo/client';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Button,
    Checkbox,
    CheckboxProps,
    Container,
    Divider,
    Input,
    InputOnChangeData,
    List,
    Modal
} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLang} from '../../../../queries/cache/lang/getLangQuery';
import {allowedTypeOperator, localizedLabel} from '../../../../utils';
import {
    AttributeFormat,
    conditionFilter,
    FilterTypes,
    IAttribute,
    IFilter,
    IFilterSeparator
} from '../../../../_types/types';
import {LibraryItemListState} from '../../LibraryItemsListReducer';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Small = styled.small`
    opacity: 0.5;
`;

interface IAttributeListProps {
    stateItems: LibraryItemListState;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    showAttr: boolean;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
    updateFilters: () => void;
}

function AttributeList({
    stateItems,
    setFilters,
    showAttr,
    setShowAttr,
    updateFilters
}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const [attributes, setAttributes] = useState<IAttribute[]>(stateItems.attributes);
    const [attSelected, setAttSelected] = useState<{id: string; format: AttributeFormat}[]>([]);

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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        const attributesFilter = stateItems.attributes.filter(
            att =>
                localizedLabel(att.label, lang).indexOf(data.value ?? '') !== -1 ||
                att.id.indexOf(data.value ?? '') !== -1
        );
        setAttributes(attributesFilter);
    };

    return (
        <Modal open={showAttr} onClose={() => setShowAttr(false)} closeIcon>
            <Modal.Header>{t('filters.modal-header')}</Modal.Header>
            <Modal.Content>
                <Container>
                    <Input icon="search" onChange={handleChange} />

                    <Divider />

                    <List divided>
                        {attributes &&
                            attributes.map(
                                att =>
                                    Object.values(AttributeFormat).includes(att.format) && (
                                        <Attribute att={att} key={att.id} setAttSelected={setAttSelected} lang={lang} />
                                    )
                            )}
                    </List>
                    <Button onClick={addFilters}>{t('attribute-list.add')}</Button>
                </Container>
            </Modal.Content>
        </Modal>
    );
}

interface IAttributeProps {
    att: any;
    setAttSelected: React.Dispatch<React.SetStateAction<{id: string; format: AttributeFormat}[]>>;
    lang: any;
}
function Attribute({att, setAttSelected, lang}: IAttributeProps): JSX.Element {
    const handleOnChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        if (data.checked) {
            setAttSelected(attSelected => [...attSelected, {id: att.id, format: att.format}]);
        } else {
            setAttSelected(attSelected => attSelected.filter(attId => attId !== att.id));
        }
    };

    return (
        <>
            <List.Item>
                <List.Icon name="square" size="large" verticalAlign="middle" />
                <List.Content verticalAlign="middle">
                    <Wrapper>
                        {localizedLabel(att.label, lang) ? (
                            <span>
                                {localizedLabel(att.label, lang)} <Small>{att.id}</Small>
                            </span>
                        ) : (
                            <span>{att.id}</span>
                        )}
                        <Checkbox onChange={handleOnChange} />
                    </Wrapper>
                </List.Content>
            </List.Item>
        </>
    );
}

export default AttributeList;
