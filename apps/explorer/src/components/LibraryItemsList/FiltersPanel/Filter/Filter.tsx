// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MoreOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import {formatNotUsingCondition} from 'constants/constants';
import React, {useState} from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {setFilters} from '../../../../hooks/FiltersStateHook/FilterReducerAction';
import useStateFilters from '../../../../hooks/FiltersStateHook/FiltersStateHook';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../themingVar';
import {localizedLabel} from '../../../../utils';
import {AttributeFormat, IFilter} from '../../../../_types/types';
import DateFilter from '../../DisplayTypeSelector/FilterInput/DateFilter';
import NumericFilter from '../../DisplayTypeSelector/FilterInput/NumericFilter';
import TextFilter from '../../DisplayTypeSelector/FilterInput/TextFilter';
import ChangeAttribute from '../ChangeAttribute';
import FilterCondition from '../FilterCondition';

interface IWrapperProps {
    active: boolean;
}

const Wrapper = styled.div<IWrapperProps>`
    background: ${themingVar['@leav-secondary-item-background']};
    padding: 8px 8px 8px 0;
    border-radius: 3px;
    display: grid;
    grid-template-columns: 1.375rem auto;
    margin-bottom: 8px;
    border: 2px solid transparent;

    ${({active}) =>
        active
            ? ` 
        :hover,
        :active {
            border: 2px solid ${themingVar['@primary-color']};

            &&& .filter-handle {
                color: ${themingVar['@primary-color']};
            }
        }
    `
            : 'opacity: .5;'}
`;

const Handle = styled.div`
    content: '....';
    width: 20px;
    height: 30px;
    display: inline-block;
    overflow: hidden;
    line-height: 5px;
    padding: 3px 4px;
    vertical-align: middle;
    margin: auto;
    font-size: 12px;
    font-family: sans-serif;
    letter-spacing: 2px;
    color: ${themingVar['@divider-color']};
    text-shadow: 1px 0 1px black;

    &::after {
        content: '.. .. .. ..';
    }
`;

const Content = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    row-gap: 8px;
`;

const Head = styled.div`
    display: grid;
    grid-template-columns: auto 1.5rem;
    align-items: center;
    column-gap: 8px;
`;

const HeadInfos = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: space-around;
    align-items: center;

    background: ${themingVar['@default-bg']} 0% 0% no-repeat padding-box;
    box-shadow: ${themingVar['@leav-small-shadow']};
    border: ${themingVar['@leav-border']};
    border-radius: 3px;

    & > *:hover {
        background: ${themingVar['@leav-background-active']};
        cursor: pointer;
    }
`;

const AttributeLabel = styled.span`
    padding: 8px;
`;

const HeadOptions = styled.div`
    display: grid;
    place-items: center;
    height: 100%;

    background: ${themingVar['@default-bg']} 0% 0% no-repeat padding-box;
    box-shadow: ${themingVar['@leav-small-shadow']};
    border: ${themingVar['@leav-border']};
    border-radius: 3px;
`;

interface IFilterProps {
    filter: IFilter;
    handleProps: DraggableProvidedDragHandleProps;
}

function Filter({filter, handleProps}: IFilterProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const [stateFilters, dispatchFilters] = useStateFilters();
    const [showChangeAttribute, setShowChangeAttribute] = useState(false);

    const handleDelete = () => {
        dispatchFilters(setFilters(stateFilters.filters.filter(f => f.index !== filter.index)));
    };

    const updateFilterValue = (newFilterValue: unknown) => {
        const newFilters = stateFilters.filters.map(f => {
            if (f.index === filter.index) {
                return {...filter, value: newFilterValue};
            }
            return f;
        });

        dispatchFilters(setFilters(newFilters));
    };

    const handleShowChangeAttribute = () => {
        setShowChangeAttribute(true);
    };

    const toggleActiveStatus = () => {
        const newFilters = stateFilters.filters.map(f => {
            if (f.index === filter.index) {
                return {...f, active: !f.active};
            }
            return f;
        });

        dispatchFilters(setFilters(newFilters));
    };

    const filterOptions = (
        <Menu>
            <Menu.Item onClick={handleDelete}>{t('global.delete')}</Menu.Item>
            <Menu.Item onClick={toggleActiveStatus}>
                {filter.active ? t('filters.make-active') : t('filters.make-inactive')}
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <ChangeAttribute filter={filter} showModal={showChangeAttribute} setShowModal={setShowChangeAttribute} />
            <Wrapper data-testid="filter" active={filter.active}>
                <Handle className="filter-handle" {...handleProps} />
                <Content>
                    <Head>
                        <HeadInfos>
                            <AttributeLabel onClick={handleShowChangeAttribute}>
                                {localizedLabel(filter.attribute.label, lang)}
                            </AttributeLabel>
                            <FilterCondition filter={filter} updateFilterValue={updateFilterValue} />
                        </HeadInfos>
                        <Dropdown overlay={filterOptions} placement="bottomRight">
                            <HeadOptions>
                                <MoreOutlined />
                            </HeadOptions>
                        </Dropdown>
                    </Head>
                    <InputByFormat filter={filter} updateFilterValue={updateFilterValue} />
                </Content>
            </Wrapper>
        </>
    );
}

interface ISwitchFormType {
    filter: IFilter;
    updateFilterValue: (newValue: any) => void;
}

const InputByFormat = (props: ISwitchFormType) => {
    const showStandardCondition = !formatNotUsingCondition.find(format => format === props.filter.attribute.format);

    if (showStandardCondition) {
        switch (props.filter.attribute.format) {
            case AttributeFormat.date:
                return <DateFilter {...props} />;
            case AttributeFormat.numeric:
                return <NumericFilter {...props} />;
            case AttributeFormat.text:
            default:
                return <TextFilter {...props} />;
        }
    }

    return <></>;
};

export default Filter;
