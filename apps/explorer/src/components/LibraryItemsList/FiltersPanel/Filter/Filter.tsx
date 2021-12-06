// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MoreOutlined, DownOutlined, CloseCircleFilled} from '@ant-design/icons';
import {Button, Dropdown, Menu, Typography} from 'antd';
import {formatNotUsingCondition} from 'constants/constants';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useCallback, useState} from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import {AttributeType, RecordFilterCondition} from '_gqlTypes/globalTypes';
import moment from 'moment';
import styled from 'styled-components';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../themingVar';
import {localizedTranslation, defaultFilterConditionByAttributeFormat} from 'utils';
import {
    AttributeConditionFilter,
    AttributeFormat,
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
import DateFilter from '../../DisplayTypeSelector/FilterInput/DateFilter';
import NumericFilter from '../../DisplayTypeSelector/FilterInput/NumericFilter';
import TextFilter from '../../DisplayTypeSelector/FilterInput/TextFilter';
import FilterAttributeCondition from '../FilterAttributeCondition';
import FilterTreeCondition from '../FilterTreeCondition';
import FiltersDropdown from '../../FiltersDropdown';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {ILibraryDetailExtendedAttributeParentLinkedTree} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';

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
    justify-content: center;

    background: ${themingVar['@default-bg']} 0% 0% no-repeat padding-box;
    box-shadow: ${themingVar['@leav-small-shadow']};
    border: ${themingVar['@leav-border']};
    border-radius: 3px;

    & > *:hover {
        background: ${themingVar['@leav-background-active']};
        cursor: pointer;
    }
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

export const getDefaultFilterValueByFormat = (format: AttributeFormat): boolean | string | number => {
    switch (format) {
        case AttributeFormat.boolean:
            return true;
        case AttributeFormat.date:
            return moment().utcOffset(0).startOf('day').unix();
        case AttributeFormat.numeric:
            return 0;
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
            : {value: node.id, label: node.title};
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
            <Menu.Item onClick={toggleActiveStatus}>
                {filter.active ? t('filters.deactivate') : t('filters.activate')}
            </Menu.Item>
            <Menu.Item onClick={handleDelete}>{t('global.delete')}</Menu.Item>
        </Menu>
    );

    const InputByFormat = useCallback(
        (props: ISwitchFormType) => {
            const showStandardCondition =
                props.filter.condition in AttributeConditionFilter &&
                !formatNotUsingCondition.find(
                    format => format === (props.filter as IFilterAttribute).attribute?.format
                );

            const showTreeCondition = props.filter.condition in TreeConditionFilter;

            if (showStandardCondition) {
                switch ((props.filter as IFilterAttribute).attribute?.format) {
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

    const embeddedFieldsToAttribute = (
        embeddedFields: GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields[]
    ): GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[] => {
        return embeddedFields.map(f => ({
            ...f,
            type: AttributeType.simple,
            multiple_values: undefined,
            linked_tree: undefined
        }));
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
                ? (filter as IFilterAttribute).attribute.parentAttribute
                : (filter as IFilterLibrary).parentAttribute;

        const newFilter: IFilterAttribute = {
            type: FilterType.ATTRIBUTE,
            index: searchState.filters.length,
            key: parentAttribute?.id,
            value: {
                value: getDefaultFilterValueByFormat(parentAttribute.format)
            },
            active: true,
            condition: RecordFilterCondition[defaultFilterConditionByAttributeFormat(parentAttribute.format)],
            attribute: parentAttribute
        };

        filters.splice(filter.index, 1, {...newFilter, index: filter.index});

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters
        });
    };

    const getDropdownLabel = (): string => {
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
                <Content>
                    <Head>
                        <HeadInfos>
                            <div style={{display: 'grid'}}>
                                {
                                    // FIXME: clean and add label OR ID
                                    (!!(filter as IFilterAttribute).attribute?.parentAttribute ||
                                        (filter as IFilterAttribute).parentTreeLibrary ||
                                        filter.type === FilterType.LIBRARY) && (
                                        <Button type="text" size="small" onClick={_handleResetClick}>
                                            <Typography.Text type="secondary">
                                                {localizedTranslation(
                                                    (filter as IFilterAttribute).attribute?.parentAttribute?.label ||
                                                        (filter as IFilterLibrary).parentAttribute?.label,
                                                    lang
                                                ) ||
                                                    `${localizedTranslation(
                                                        (filter as IFilterAttribute).parentTreeLibrary?.parentAttribute
                                                            ?.label,
                                                        lang
                                                    )} > ${localizedTranslation(
                                                        (filter as IFilterAttribute).parentTreeLibrary?.library.label,
                                                        lang
                                                    )} `}{' '}
                                                <CloseCircleFilled />
                                            </Typography.Text>
                                        </Button>
                                    )
                                }
                                <FiltersDropdown
                                    libraryId={activeLibrary.id}
                                    button={{
                                        label: getDropdownLabel(),
                                        icon: <DownOutlined />,
                                        type: 'text'
                                    }}
                                    filter={filter}
                                    attributes={getAttributes()}
                                    libraries={getLibraries()}
                                    trees={getTrees()}
                                />
                            </div>
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
                    <InputByFormat filter={filter} updateFilterValue={updateFilterValue} />
                </Content>
            </Wrapper>
        </>
    );
}

export default Filter;
