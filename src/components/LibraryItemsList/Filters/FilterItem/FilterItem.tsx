import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Button,
    Checkbox,
    Dropdown,
    DropdownProps,
    Form,
    Modal,
    Segment,
    TextArea,
    TextAreaProps
} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {allowedTypeOperator} from '../../../../utils';
import {conditionFilter, FilterTypes, IFilter, IFilterSeparator, operatorFilter} from '../../../../_types/types';

const Attribute = styled.div``;

const TextAreaWrapper = styled.div`
    margin: 1rem 0 0 0;
`;

const Grid = styled.div`
    display: flex;
    flex-flow: column;
`;

const GridRow = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
`;

interface GridColumnProps {
    flex?: number;
    style?: CSSObject;
}

const GridColumn = styled.div<GridColumnProps>`
    flex: ${({flex}) => flex ?? 1};
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: top;
`;

const CustomButton = styled.button`
    border: none;
    background: none;
`;

const CustomForm = styled(Form)`
    width: 100%;
`;

interface IFilterItemProps {
    filter: IFilter;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    whereOptions: {
        text: string;
        value: conditionFilter;
    }[];
    operatorOptions: {
        text: string;
        value: operatorFilter;
    }[];
    resetFilters: () => void;
    updateFilters: () => void;
    filterOperator: operatorFilter;
    setFilterOperator: React.Dispatch<React.SetStateAction<operatorFilter>>;
}

function FilterItem({
    filter,
    setFilters,
    whereOptions,
    operatorOptions,
    resetFilters,
    updateFilters,
    filterOperator,
    setFilterOperator
}: IFilterItemProps): JSX.Element {
    const {t} = useTranslation();

    const [textAreaRows, setTextAreaRows] = useState<number>(1);
    const [showModal, setShowModal] = useState(false);

    const textAreaRef = useRef(null);

    const whereOptionsByType = whereOptions.filter(whereOption =>
        allowedTypeOperator[filter.format]?.includes(whereOption.value)
    );

    const changeActive = () => {
        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);

            let newNewFilters: (IFilter | IFilterSeparator)[] = [];
            if (currentFilter && currentFilter.type === FilterTypes.filter) {
                const newFilters = currentFilter
                    ? [...restFilters, {...currentFilter, active: !currentFilter.active}].sort(
                          (f1, f2) => f1.key - f2.key
                      )
                    : restFilters;

                let firstFind = false;
                newNewFilters = newFilters.map(f => {
                    if (!firstFind && f.type === FilterTypes.filter && f.active) {
                        if (f.operator) {
                            f.operator = false;
                        }
                        firstFind = true;
                    } else if (firstFind && f.type === FilterTypes.filter && !f.operator) {
                        f.operator = true;
                    }

                    return f;
                });
            }

            return newNewFilters;
        });

        updateFilters();
    };

    const deleteFilterItem = () => {
        setFilters(filters => {
            let newFilters = filters.filter(f => f.key !== filter.key);
            const activeFilters = (filters as IFilter[]).filter(f => f.type === FilterTypes.filter && f.active);

            if (activeFilters.length && activeFilters[0].operator) {
                const separators = filters.filter(filter => filter.type === FilterTypes.separator);

                newFilters = newFilters.map(f => {
                    const lastFilterIsSeparatorCondition = separators.some(separator => separator.key === f.key - 1);

                    if (
                        f.type === FilterTypes.filter &&
                        (f.key === activeFilters[0].key || lastFilterIsSeparatorCondition)
                    ) {
                        f.operator = false;
                    }

                    return f;
                });
            } else if (!activeFilters.length) {
                resetFilters();
            }

            return newFilters;
        });

        updateFilters();
    };

    const updateFilterValue = (event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
        const newValue = (data?.value ?? '').toString();

        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);
            return currentFilter
                ? [...restFilters, {...currentFilter, value: newValue}].sort((f1, f2) => f1.key - f2.key)
                : restFilters;
        });

        const rows = newValue.split('\n').length;

        setTextAreaRows(rows <= 10 ? rows : 10);
    };

    const changeCondition = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newCondition = (data?.value ?? '').toString();

        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);

            return currentFilter
                ? [...restFilters, {...currentFilter, where: conditionFilter[newCondition]}].sort(
                      (f1, f2) => f1.key - f2.key
                  )
                : restFilters;
        });
    };

    const handleOperatorChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newOperator = (data.value as operatorFilter) ?? operatorFilter.and;

        setFilterOperator(newOperator);
    };

    return (
        <>
            <Modal open={showModal} onClose={() => setShowModal(false)} closeIcon>
                <Modal.Content>content</Modal.Content>
            </Modal>
            <Segment secondary disabled={!filter.active}>
                <Grid>
                    <GridRow key={filter.key}>
                        <GridColumn>
                            <Checkbox checked={filter.active} onChange={changeActive} />
                        </GridColumn>

                        <GridColumn flex={5}>
                            {filter.operator ? (
                                <Dropdown
                                    floating
                                    inline
                                    value={filterOperator}
                                    options={operatorOptions}
                                    onChange={handleOperatorChange}
                                />
                            ) : (
                                t('filter-item.no-operator')
                            )}

                            <Attribute>
                                <CustomButton onClick={() => setShowModal(true)}>{filter.attribute}</CustomButton>
                            </Attribute>

                            <Dropdown
                                floating
                                inline
                                defaultValue={filter.condition}
                                onChange={changeCondition}
                                options={whereOptionsByType}
                                direction="left"
                            />
                        </GridColumn>

                        <Button icon="remove" basic negative compact size="mini" onClick={deleteFilterItem} />
                    </GridRow>
                    <GridRow>
                        <CustomForm>
                            <TextAreaWrapper>
                                <TextArea
                                    ref={textAreaRef}
                                    rows={textAreaRows}
                                    value={filter.value}
                                    onChange={updateFilterValue}
                                />
                            </TextAreaWrapper>
                        </CustomForm>
                    </GridRow>
                </Grid>
            </Segment>
        </>
    );
}

export default FilterItem;
