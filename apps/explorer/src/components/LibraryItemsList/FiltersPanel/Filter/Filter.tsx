// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MoreOutlined} from '@ant-design/icons';
import {Dropdown, Menu, Button} from 'antd';
import {formatNotUsingCondition} from 'constants/constants';
import React, {useState, useCallback} from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../themingVar';
import {localizedLabel} from '../../../../utils';
import {AttributeFormat, IFilter, TreeConditionFilter, AttributeConditionFilter} from '../../../../_types/types';
import DateFilter from '../../DisplayTypeSelector/FilterInput/DateFilter';
import NumericFilter from '../../DisplayTypeSelector/FilterInput/NumericFilter';
import TextFilter from '../../DisplayTypeSelector/FilterInput/TextFilter';
import ChangeAttribute from '../ChangeAttribute';
import SelectTreeNodeModal, {ITreeNode} from '../../../shared/SelectTreeNodeModal/SelectTreeNodeModal';
import ChangeTree from '../ChangeTree';
import FilterAttributeCondition from '../FilterAttributeCondition';
import FilterTreeCondition from '../FilterTreeCondition';

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

const FilterLabel = styled.span`
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

interface ISwitchFormType {
    filter: IFilter;
    updateFilterValue: (newFilterValue: IFilter['value']) => void;
}

function Filter({filter, handleProps}: IFilterProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [showChangeAttribute, setShowChangeAttribute] = useState(false);
    const [showChangeTree, setShowChangeTree] = useState(false);
    const [showSelectTreeNodeModal, setShowSelectTreeNodeModal] = useState(false);

    const handleDelete = () => {
        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: searchState.filters.filter(f => f.index !== filter.index)
        });
    };

    const updateFilterValue = (newFilterValue: IFilter['value']) => {
        const newFilters: IFilter[] = searchState.filters.map(f => {
            if (f.index === filter.index) {
                return {...f, value: newFilterValue};
            }

            return f;
        });

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: newFilters
        });
    };

    const _getValueFromNode = (node: ITreeNode): IFilter['value'] => {
        return typeof node === 'undefined' || node.key === filter.tree.id
            ? {value: null}
            : {value: node.key, label: node.title};
    };

    const handleShowChangeAttribute = () => {
        setShowChangeAttribute(true);
    };

    const handleShowChangeTree = () => {
        setShowChangeTree(true);
    };

    const toggleActiveStatus = () => {
        const newFilters = searchState.filters.map(f => {
            if (f.index === filter.index) {
                return {...f, active: !f.active};
            }

            return f;
        });

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: newFilters
        });
    };

    const filterOptions = (
        <Menu>
            <Menu.Item onClick={handleDelete}>{t('global.delete')}</Menu.Item>
            <Menu.Item onClick={toggleActiveStatus}>
                {filter.active ? t('filters.deactivate') : t('filters.activate')}
            </Menu.Item>
        </Menu>
    );

    const InputByFormat = useCallback(
        (props: ISwitchFormType) => {
            const showStandardCondition =
                props.filter.condition in AttributeConditionFilter &&
                !formatNotUsingCondition.find(format => format === props.filter.attribute.format);

            const showTreeCondition = props.filter.condition in TreeConditionFilter;

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
            } else if (showTreeCondition) {
                return (
                    <Button onClick={() => setShowSelectTreeNodeModal(true)}>
                        {props.filter.value.label || t('global.select')}
                    </Button>
                );
            }

            return <></>;
        },
        [t]
    );

    return (
        <>
            {!!filter.attribute && (
                <ChangeAttribute
                    filter={filter}
                    showModal={showChangeAttribute}
                    setShowModal={setShowChangeAttribute}
                />
            )}

            {!!filter.tree && (
                <ChangeTree filter={filter} showModal={showChangeTree} setShowModal={setShowChangeTree} />
            )}

            {showSelectTreeNodeModal && (
                <SelectTreeNodeModal
                    selectedNodeKey={(filter.value.value as string) || filter.tree.id}
                    tree={{id: filter.tree.id, label: filter.tree.label}}
                    onSubmit={node => updateFilterValue(_getValueFromNode(node))}
                    onClose={() => setShowSelectTreeNodeModal(false)}
                    visible={showSelectTreeNodeModal}
                />
            )}

            <Wrapper data-testid="filter" active={filter.active}>
                <Handle className="filter-handle" {...handleProps} />
                <Content>
                    <Head>
                        <HeadInfos>
                            <FilterLabel
                                onClick={!!filter.attribute ? handleShowChangeAttribute : handleShowChangeTree}
                            >
                                {localizedLabel(filter.attribute?.label || filter.tree.label, lang)}
                            </FilterLabel>
                            {!!filter.attribute ? (
                                <FilterAttributeCondition filter={filter} updateFilterValue={updateFilterValue} />
                            ) : (
                                <FilterTreeCondition filter={filter} />
                            )}
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

export default Filter;
