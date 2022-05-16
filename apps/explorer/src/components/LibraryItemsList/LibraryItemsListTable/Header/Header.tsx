// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CaretDownOutlined, CaretUpOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AttributeType, SortOrder} from '_gqlTypes/globalTypes';
import {infosCol} from '../../../../constants/constants';
import themingVar from '../../../../themingVar';
import {getSortFieldByAttributeType} from '../../../../utils';
import ChooseTableColumns from '../../LibraryItemsListTable/ChooseTableColumns';

interface IWrapperProps {
    isHover: boolean;
    isInfoColumn: boolean;
}

const Wrapper = styled.div<IWrapperProps>`
    border-left: solid 3px transparent;
    border-right: solid 3px transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    ${({isHover}) =>
        isHover &&
        `
        box-shadow: 0px 3px 6px #00000029;

        .wrapper-arrow {
            background: ${themingVar['@default-bg']};
            box-shadow: 0px 3px 6px #00000029;
            border: 1px solid ${themingVar['@leav-secondary-divider-color']};
        }
    `}

    &:hover {
        border-left: ${themingVar['@primary-color']} 3px solid;
        border-right: ${themingVar['@primary-color']} 3px solid;
        box-shadow: 0px 3px 6px #00000029;
        transition: 200ms ease;

        .wrapper-arrow {
            background: ${themingVar['@default-bg']};
            box-shadow: 0px 3px 6px #00000029;
            border: 1px solid ${themingVar['@leav-secondary-divider-color']};
        }
    }
`;

const DropdownContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 0.3rem;

    word-break: 'keep-all';
    user-select: 'none';
`;

interface IWrapperArrowProps {
    filterDirection?: SortOrder;
    filterActive: boolean;
}

const WrapperArrow = styled.div<IWrapperArrowProps>`
    border-radius: 50%;
    cursor: pointer;
    border: 1px solid transparent;
    height: 2rem;
    width: 2rem;
    display: grid;
    grid-template-rows: 8px 8px;
    place-items: center;
    align-content: center;
    margin: 0 8px;
    flex-shrink: 0;

    & > * {
        transform: scale(0.7);
    }

    & > span:first-child {
        opacity: ${({filterDirection, filterActive}) => (filterActive && filterDirection === SortOrder.asc ? 1 : 0.5)};
    }

    & > span:last-child {
        opacity: ${({filterDirection, filterActive}) => (filterActive && filterDirection === SortOrder.desc ? 1 : 0.5)};
    }
`;

WrapperArrow.displayName = 'WrapperArrow';

interface IHeaderProps {
    children: React.ReactNode;
    id: string;
    type: AttributeType;
}

const Header = ({id, children, type}: IHeaderProps) => {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [openChangeColumns, setOpenChangeColumns] = useState(false);
    const [isHover, setIsHover] = useState<boolean>(false);

    const handleSort = (attId: string, order: SortOrder, attType: AttributeType) => {
        const newSortField = getSortFieldByAttributeType(attId, attType);

        searchDispatch({
            type: SearchActionTypes.SET_SORT,
            sort: {
                field: newSortField,
                order,
                active: true
            }
        });

        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true});
    };

    const handleDesc = (attId: string, attType: AttributeType) => {
        handleSort(attId, SortOrder.desc, attType);
    };

    const handleAsc = (attId: string, attType: AttributeType) => {
        handleSort(attId, SortOrder.asc, attType);
    };

    const cancelSort = () => {
        searchDispatch({
            type: SearchActionTypes.CANCEL_SORT
        });
    };

    const handleHideColumn = (attId: string) => {
        searchDispatch({
            type: SearchActionTypes.SET_FIELDS,
            fields: searchState.fields.filter(f => f.id !== attId)
        });
    };

    const _handleCloseChooseTableColumns = () => setOpenChangeColumns(false);

    return (
        <Wrapper isHover={isHover} isInfoColumn={infosCol === id} id={id}>
            {children}
            <Dropdown
                placement="bottom"
                trigger={['click']}
                overlay={
                    <Menu
                        style={{transform: 'translateY(-8px)'}} // move overlay to avoid trigger css transition
                        onMouseEnter={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                        items={[
                            {
                                key: 'sort-ascend',
                                onClick: () => handleAsc(id, type),
                                label: t('items_list.table.header-cell-menu.sort-ascend')
                            },
                            {
                                key: 'sort-descend',
                                onClick: () => handleDesc(id, type),
                                label: t('items_list.table.header-cell-menu.sort-descend')
                            },
                            {
                                key: 'cancel-sort',
                                onClick: cancelSort,
                                label: t('items_list.table.header-cell-menu.cancel-sort')
                            },
                            id !== infosCol
                                ? {
                                      key: 'hide-column',
                                      onClick: () => handleHideColumn(id),
                                      label: t('items_list.table.header-cell-menu.hide-column')
                                  }
                                : null,
                            {
                                key: 'choose-columns',
                                onClick: () => setOpenChangeColumns(true),
                                label: t('items_list.table.header-cell-menu.choose-columns')
                            }
                        ]}
                    ></Menu>
                }
            >
                <DropdownContent>
                    <WrapperArrow
                        className="wrapper-arrow"
                        data-testid={`wrapper-arrow-${searchState.sort.order}`}
                        filterDirection={searchState.sort?.order}
                        filterActive={!!searchState.sort?.active && searchState.sort?.field === id}
                        style={{fontSize: '130%'}}
                    >
                        <CaretUpOutlined />
                        <CaretDownOutlined />
                    </WrapperArrow>
                </DropdownContent>
            </Dropdown>
            {openChangeColumns && (
                <ChooseTableColumns visible={openChangeColumns} onClose={_handleCloseChooseTableColumns} />
            )}
        </Wrapper>
    );
};

export default Header;
