// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Checkbox, Pagination, Select, Table} from 'semantic-ui-react';
import {gqlUnchecked} from '../../utils';
import {IGetRecordData} from '../../_types/records';
import Loading from '../shared/Loading';
import RecordCard from '../shared/RecordCard';
import {IListProps} from './MainPanel';
import styles from './MainPanel.module.css';
import {ActionTypes} from './NavigatorReducer';

export default function ListPanel({state, dispatch}: IListProps) {
    return !state.execSearch ? (
        <List state={state} dispatch={dispatch} />
    ) : (
        <ListLoader
            selectedRootQuery={state.selectedRootQuery}
            filters={state.filters}
            dispatch={dispatch}
            offset={typeof state.offset === 'number' ? state.offset : null}
            limit={state.selectedOffset}
        />
    );
}
function List({state, dispatch}: IListProps) {
    const {t} = useTranslation();
    const isSelectable = state.selectable;
    const getHandleSelectionChanged = useMemo(() => {
        return entity => (event, data) => {
            const actionType = data.checked ? ActionTypes.SELECTION_ADD : ActionTypes.SELECTION_REMOVE;
            dispatch({
                type: actionType,
                data: entity.whoAmI
            });
        };
    }, [dispatch]);
    const isSelected = useMemo(() => {
        return idToSearch => {
            return state.selection.find(elementInSelection => elementInSelection.id === idToSearch) !== undefined;
        };
    }, [state.selection]);
    const onEdit = useMemo(() => {
        const callback = state.onEditRecordClick ? state.onEditRecordClick : () => undefined;
        return entity => (event, data) => {
            callback(entity.whoAmI);
        };
    }, [state.onEditRecordClick]);
    const _onChange = (e, pageInfo) => {
        const activePage = pageInfo.activePage;
        let offset = 0;
        if (state.selectedOffset) {
            offset = (activePage - 1) * state.selectedOffset;
        }
        const data = {offset, page: activePage};
        dispatch({
            type: ActionTypes.SET_OFFSET,
            data
        });
    };
    const _handleLimitChange = (e, data) => {
        dispatch({
            type: ActionTypes.SET_LIMIT,
            data: {limit: data.value}
        });
    };
    const totalPages =
        state.totalCount && state.selectedOffset
            ? Math.floor(state.totalCount / state.selectedOffset) + (state.totalCount % state.selectedOffset ? 1 : 0)
            : 1;

    const limitOptions = state.availableOffsets.map(x => {
        return {text: x.toString(), value: x};
    });

    return (
        <Table className={styles.ListPanelTable} selectable celled>
            <Table.Header>
                <Table.Row>
                    {isSelectable && <Table.HeaderCell className={styles.ListPanelTableTh} />}
                    <Table.HeaderCell className={styles.ListPanelTableTh}>ID</Table.HeaderCell>
                    <Table.HeaderCell className={styles.ListPanelTableTh} />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {state.list.map(e => (
                    <Table.Row key={e.whoAmI.id}>
                        {isSelectable && (
                            <Table.Cell width="1">
                                <Checkbox
                                    toggle
                                    onChange={getHandleSelectionChanged(e)}
                                    checked={isSelected(e.whoAmI.id)}
                                />
                            </Table.Cell>
                        )}
                        <Table.Cell className={styles.clickable} width="3" onClick={onEdit(e)}>
                            <RecordCard record={e.whoAmI} />
                        </Table.Cell>
                        <Table.Cell width="12" />
                    </Table.Row>
                ))}
            </Table.Body>
            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell className={styles.ListPanelTableThFooter} colSpan="3">
                        <div className={styles.ListPanelPaginationContainer}>
                            <Pagination
                                onPageChange={_onChange}
                                activePage={state.currentPage ? state.currentPage : 1}
                                value={state.selectedOffset ? state.selectedOffset : ''}
                                totalPages={totalPages}
                            />
                            <p className={styles.ListPanelPaginationCount}>
                                {state.totalCount} {state.selectedRootLabel}
                            </p>
                        </div>
                        <br />
                        <div style={{position: 'absolute', bottom: '3px', right: '2px'}}>
                            <span style={{marginRight: '5px'}}>{t('navigator.select_range')}</span>
                            <Select
                                placeholder={t('navigator.select_range')}
                                value={
                                    state.selectedOffset
                                        ? state.selectedOffset
                                        : state.availableOffsets[state.availableOffsets.length - 1]
                                }
                                options={limitOptions}
                                onChange={_handleLimitChange}
                            />
                        </div>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}

function ListLoader({selectedRootQuery, filters, dispatch, offset, limit}) {
    const {t} = useTranslation();
    const LISTQUERY = gqlUnchecked`
        query($filters:[RecordFilterInput], $pagination: RecordsPagination){
            ${selectedRootQuery} (filters:$filters, pagination:$pagination){
                totalCount
                list {
                    whoAmI{
                        id,
                        label,
                        color,
                        preview {
                            small
                            medium
                            pages
                            big
                        },
                        library{
                            id,
                            label
                        }
                    }
                }
            }
        }
    `;
    const filtersVar = filters.map(f => ({
        field: f.attribute,
        value: f.value
    }));
    const pagination =
        limit === null
            ? null
            : {
                  offset: offset !== null ? offset : 0,
                  limit
              };
    const {loading, error, data} = useQuery<IGetRecordData>(LISTQUERY, {
        fetchPolicy: 'network-only',
        variables: {
            filters: filtersVar,
            pagination
        }
    });
    if (loading) {
        return <Loading withDimmer />;
    }
    if (error) {
        return <p data-testid="error">{error.message}</p>;
    }
    if (!data) {
        return <p data-testid="error">No data</p>;
    }

    const all = t('navigator.display_all');

    dispatch({
        type: ActionTypes.SET_LIST,
        data: {...data[selectedRootQuery], offset, all}
    });
    return null;
}
