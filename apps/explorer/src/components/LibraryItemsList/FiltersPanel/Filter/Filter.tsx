// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseCircleFilled, MoreOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import DateBetweenFilter from 'components/LibraryItemsList/FiltersPanel/Filter/FilterInput/DateBetweenFilter';
import {formatNotUsingCondition} from 'constants/constants';
import {ILibraryDetailExtendedAttributeParentLinkedTree} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import moment from 'moment';
import React, {useCallback, useState} from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {defaultFilterConditionByAttributeFormat, localizedTranslation} from 'utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_gqlTypes/globalTypes';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../themingVar';
import {
    AttributeConditionFilter,
    AttributeConditionType,
    FilterType,
    IAttribute,
    IFilter,
    IFilterAttribute,
    IFilterLibrary,
    IFilterTree,
    ThroughConditionFilter,
    TreeConditionFilter
} from '../../../../_types/types';
import SelectTreeNodeModal, {ITreeNode} from '../../../shared/SelectTreeNodeModal/SelectTreeNodeModal';
import FiltersDropdown from '../../FiltersDropdown';
import FilterDropdownButton from '../FilterDropdownButton';
import FilterTreeCondition from '../FilterTreeCondition';
import mustHideValue from '../mustHideValue';
import FilterAttributeCondition from './FilterAttributeCondition';
import DateFilter from './FilterInput/DateFilter';
import NumericFilter from './FilterInput/NumericFilter';
import TextFilter from './FilterInput/TextFilter';

interface IWrapperProps {
    active: boolean;
}

const Wrapper = styled.div<IWrapperProps>`
    background: ${themingVar['@leav-secondary-item-background']};
    padding: 8px 8px 8px 0px;
    border-radius: 3px;
    display: grid;
    grid-template-columns: 1.375rem 1fr;
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

const Content = styled.div<{hasParent: boolean}>`
    display: grid;
    grid-template-rows: ${p => (p.hasParent ? 'auto auto 1fr' : 'auto 1fr')};
    row-gap: 8px;
`;

const Head = styled.div`
    display: grid;
    grid-template-columns: 1fr 1.5rem;
    align-items: center;
    column-gap: 8px;
    min-width: 0;
`;

const HeadInfos = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: space-around;
    align-items: center;
    justify-content: center;

    background: ${themingVar['@default-bg']} 0% 0% no-repeat padding-box;
    box-shadow: ${themingVar['@leav-small-shadow']};
    border: ${themingVar['@leav-border']};
    border-radius: 3px;

    min-width: 0;
`;

const HeadOptions = styled.div`
    display: grid;
    place-items: center;
    height: 32px;

    background: ${themingVar['@default-bg']} 0% 0% no-repeat padding-box;
    box-shadow: ${themingVar['@leav-small-shadow']};
    border: ${themingVar['@leav-border']};
    border-radius: 3px;
`;

const ParentLabel = styled.div`
    display: flex;
    align-content: flex-start;
`;

const ClearParentButton = styled(Button)`
    && {
        border: none;
        color: ${themingVar['@leav-secondary-font-color']};

        :hover {
            border: none;
            color: ${themingVar['@leav-secondary-font-color']};
        }
    }
`;

export interface IFilterInputProps {
    filter: IFilter;
    updateFilterValue: (newFilterValue: IFilter['value']) => void;
    onPressEnter?: () => void;
}

interface IFilterProps {
    filter: IFilter;
    handleProps: DraggableProvidedDragHandleProps;
}

export const getDefaultFilterValueByFormat = (format: AttributeFormat): boolean | string | number => {
    switch (format) {
        case AttributeFormat.boolean:
            return true;
        case AttributeFormat.date:
            return moment().utcOffset(0).startOf('day').unix();
        default:
            return '';
    }
};

function Filter({filter, handleProps}: IFilterProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [showSelectTreeNodeModal, setShowSelectTreeNodeModal] = useState(false);
    const [activeLibrary] = useActiveLibrary();

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
        return typeof node === 'undefined' || node.id === (filter as IFilterTree).tree.id
            ? {value: null}
            : {value: node.id, label: String(node.title)};
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
        <Menu
            items={[
                {
                    key: 'deactivate',
                    label: filter.active ? t('filters.deactivate') : t('filters.activate'),
                    onClick: toggleActiveStatus
                },
                {
                    key: 'delete',
                    label: t('global.delete'),
                    onClick: handleDelete
                }
            ]}
        />
    );

    const InputByFormat = useCallback(
        (props: IFilterInputProps) => {
            const showStandardCondition =
                props.filter.condition in AttributeConditionFilter &&
                !(props.filter.condition in TreeConditionFilter) &&
                !formatNotUsingCondition.find(
                    format => format === (props.filter as IFilterAttribute).attribute?.format
                );

            const showTreeCondition = props.filter.condition in TreeConditionFilter;

            if (showStandardCondition) {
                if (mustHideValue(props.filter.condition as AttributeConditionType)) {
                    return <></>;
                }

                switch ((props.filter as IFilterAttribute).attribute?.format) {
                    case AttributeFormat.date:
                        return props.filter.condition === AttributeConditionFilter.BETWEEN ? (
                            <DateBetweenFilter {...props} />
                        ) : (
                            <DateFilter {...props} />
                        );
                    case AttributeFormat.date_range:
                        return <DateFilter {...props} />;
                    case AttributeFormat.numeric:
                        return <NumericFilter {...props} />;
                    case AttributeFormat.text:
                    default:
                        return <TextFilter {...props} />;
                }
            } else if (showTreeCondition) {
                return (
                    <Button disabled={!props.filter.active} onClick={() => setShowSelectTreeNodeModal(true)}>
                        {props.filter.value.label || t('global.select')}
                    </Button>
                );
            }

            return <></>;
        },
        [t]
    );

    const embeddedFieldsToAttribute = (
        embeddedFields: GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields[]
    ): GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[] => {
        return embeddedFields
            ? embeddedFields.map(f => ({
                  ...f,
                  type: AttributeType.simple,
                  multiple_values: undefined,
                  linked_tree: undefined,
                  system: false
              }))
            : [];
    };

    const getAttributes = (): GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[] => {
        if (filter.type === FilterType.ATTRIBUTE) {
            if (
                filter.condition === ThroughConditionFilter.THROUGH &&
                (filter as IFilterAttribute).attribute?.format === AttributeFormat.extended
            ) {
                return embeddedFieldsToAttribute((filter as IFilterAttribute).attribute.embedded_fields);
            }

            if (
                filter.condition === ThroughConditionFilter.THROUGH &&
                typeof (filter as IFilterAttribute).attribute.linkedTree === 'undefined'
            ) {
                return (filter as IFilterAttribute).attribute.linkedLibrary?.attributes;
            }

            if (typeof (filter as IFilterAttribute).attribute.parentAttribute !== 'undefined') {
                return (
                    (filter as IFilterAttribute).attribute.parentAttribute?.linkedLibrary?.attributes ||
                    embeddedFieldsToAttribute((filter as IFilterAttribute).attribute.parentAttribute?.embedded_fields)
                );
            }

            if (typeof (filter as IFilterAttribute).parentTreeLibrary !== 'undefined') {
                const lib = (filter as IFilterAttribute).parentTreeLibrary.parentAttribute.linkedTree.libraries.find(
                    l => l.library.id === (filter as IFilterAttribute).parentTreeLibrary.library.id
                );

                return lib.library.attributes;
            }

            if (
                typeof (filter as IFilterAttribute).attribute.linkedTree !== 'undefined' &&
                filter.condition === ThroughConditionFilter.THROUGH
            ) {
                return [];
            }
        }

        if (filter.type === FilterType.LIBRARY) {
            if (filter.condition !== ThroughConditionFilter.THROUGH) {
                return [];
            }

            if (filter.condition === ThroughConditionFilter.THROUGH) {
                const lib = (filter as IFilterLibrary).parentAttribute.linkedTree?.libraries.find(
                    l => l.library.id === (filter as IFilterLibrary).library.id
                );

                return lib.library.attributes;
            }
        }

        return activeLibrary.attributes;
    };

    // on tree attribute type with linkedTree
    const getLibraries = (): ILibraryDetailExtendedAttributeParentLinkedTree['libraries'] => {
        if (filter.type === FilterType.LIBRARY) {
            return (filter as IFilterLibrary).parentAttribute.linkedTree?.libraries;
        }

        if (
            filter.type === FilterType.ATTRIBUTE &&
            typeof (filter as IFilterAttribute).attribute.linkedTree !== 'undefined' &&
            filter.condition === ThroughConditionFilter.THROUGH
        ) {
            return (filter as IFilterAttribute).attribute.linkedTree?.libraries;
        }

        return [];
    };

    const getTrees = (): GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees[] => {
        if (
            filter.type === FilterType.TREE ||
            (filter.condition !== ThroughConditionFilter.THROUGH &&
                filter.type === FilterType.ATTRIBUTE &&
                !(filter as IFilterAttribute).parentTreeLibrary &&
                !(filter as IFilterAttribute).attribute.parentAttribute)
        ) {
            return activeLibrary.trees;
        }

        return [];
    };

    const _handleResetClick = () => {
        const filters = [...searchState.filters];

        const parentAttribute: IAttribute =
            filter.type === FilterType.ATTRIBUTE &&
            typeof (filter as IFilterAttribute).parentTreeLibrary !== 'undefined'
                ? (filter as IFilterAttribute).parentTreeLibrary.parentAttribute
                : filter.type === FilterType.ATTRIBUTE
                ? (filter as IFilterAttribute).attribute.parentAttribute ?? (filter as IFilterAttribute).attribute
                : (filter as IFilterLibrary).parentAttribute;

        const newFilter: IFilterAttribute = {
            type: FilterType.ATTRIBUTE,
            index: filter.index,
            key: parentAttribute?.id,
            value: {
                value: getDefaultFilterValueByFormat(parentAttribute.format)
            },
            active: true,
            condition: RecordFilterCondition[defaultFilterConditionByAttributeFormat(parentAttribute.format)],
            attribute: parentAttribute
        };

        const filterPos = searchState.filters.findIndex(f => f.index === filter.index);
        filters.splice(filterPos, 1, newFilter);

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters
        });
    };

    const getDropdownLabel = (): string => {
        if (filter.condition === ThroughConditionFilter.THROUGH) {
            return `${t('global.select')}...`;
        }

        if (filter.type === FilterType.ATTRIBUTE) {
            return (
                localizedTranslation((filter as IFilterAttribute).attribute?.label, lang) ||
                (filter as IFilterAttribute).attribute?.id
            );
        } else if (filter.type === FilterType.TREE) {
            return localizedTranslation((filter as IFilterTree).tree.label, lang) || (filter as IFilterTree).tree.id;
        }

        return (
            localizedTranslation((filter as IFilterLibrary).library.label, lang) ||
            (filter as IFilterLibrary).library.id
        );
    };

    const getParentLabel = () => {
        return (
            localizedTranslation(
                filter.condition === ThroughConditionFilter.THROUGH
                    ? (filter as IFilterAttribute).attribute?.label
                    : (filter as IFilterAttribute).attribute?.parentAttribute?.label ||
                          (filter as IFilterLibrary).parentAttribute?.label,
                lang
            ) ||
            `${localizedTranslation(
                filter.condition === ThroughConditionFilter.THROUGH
                    ? (filter as IFilterLibrary).parentAttribute?.label
                    : (filter as IFilterAttribute).parentTreeLibrary?.parentAttribute?.label,
                lang
            )} > ${localizedTranslation(
                filter.condition === ThroughConditionFilter.THROUGH
                    ? (filter as IFilterLibrary)?.library.label
                    : (filter as IFilterAttribute).parentTreeLibrary?.library.label,
                lang
            )} `
        );
    };

    const hasParent = !!(
        filter.condition === ThroughConditionFilter.THROUGH ||
        !!(filter as IFilterAttribute).attribute?.parentAttribute ||
        (filter as IFilterAttribute).parentTreeLibrary ||
        filter.type === FilterType.LIBRARY
    );

    const _handlePressEnter = () => {
        searchDispatch({type: SearchActionTypes.APPLY_FILTERS});
    };

    return (
        <>
            {showSelectTreeNodeModal && (
                <SelectTreeNodeModal
                    selectedNodeKey={(filter.value.value as string) || (filter as IFilterTree).tree.id}
                    tree={(filter as IFilterTree).tree}
                    onSubmit={node => updateFilterValue(_getValueFromNode(node))}
                    onClose={() => setShowSelectTreeNodeModal(false)}
                    visible={showSelectTreeNodeModal}
                />
            )}
            <Wrapper data-testid="filter" active={filter.active}>
                <Handle className="filter-handle" {...handleProps} />
                <Content hasParent={hasParent}>
                    {hasParent && (
                        <ParentLabel>
                            <span>{t('filters.through')}:&nbsp;</span>
                            <span>{getParentLabel()}</span>
                            <ClearParentButton
                                disabled={!filter.active}
                                size="small"
                                onClick={_handleResetClick}
                                shape="circle"
                                icon={<CloseCircleFilled />}
                            />
                        </ParentLabel>
                    )}
                    <Head>
                        <HeadInfos>
                            <FiltersDropdown
                                libraryId={activeLibrary.id}
                                button={
                                    <FilterDropdownButton
                                        secondary={filter.condition === ThroughConditionFilter.THROUGH}
                                    >
                                        {getDropdownLabel()}
                                    </FilterDropdownButton>
                                }
                                filter={filter}
                                attributes={getAttributes()}
                                libraries={getLibraries()}
                                trees={getTrees()}
                            />
                            {(filter.type === FilterType.ATTRIBUTE || filter.type === FilterType.LIBRARY) && (
                                <FilterAttributeCondition
                                    filter={filter as IFilterAttribute | IFilterLibrary}
                                    updateFilterValue={updateFilterValue}
                                />
                            )}
                            {filter.type === FilterType.TREE && <FilterTreeCondition filter={filter as IFilterTree} />}
                        </HeadInfos>
                        <Dropdown overlay={filterOptions} placement="bottomRight">
                            <HeadOptions>
                                <MoreOutlined />
                            </HeadOptions>
                        </Dropdown>
                    </Head>
                    <InputByFormat
                        filter={filter}
                        updateFilterValue={updateFilterValue}
                        onPressEnter={_handlePressEnter}
                    />
                </Content>
            </Wrapper>
        </>
    );
}

export default Filter;
