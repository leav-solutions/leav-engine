import React, {useMemo} from 'react';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Table, Checkbox} from 'semantic-ui-react';

import {IListProps} from './MainPanel';
import {ActionTypes} from './NavigatorReducer';
import Loading from '../shared/Loading';
import RecordCard from '../shared/RecordCard';
import styles from './MainPanel.module.css';
import {IGetRecordData} from '../../_types/records';

export default function ListPanel({state, dispatch}: IListProps) {
    return !state.execSearch ? (
        <List state={state} dispatch={dispatch} />
    ) : (
        <ListLoader
            selectedRootQuery={state.selectedRootQuery}
            selectedRootFilter={state.selectedRootFilter}
            filters={state.filters}
            dispatch={dispatch}
            lang={state.lang}
        />
    );
}
function List({state, dispatch}: IListProps) {
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
                        {state.list.length} {state.selectedRootLabel}
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}

function ListLoader({selectedRootQuery, selectedRootFilter, filters, dispatch, lang}) {
    const LISTQUERY = gql`
        query($filters:[${selectedRootFilter}]){
            ${selectedRootQuery} (filters:$filters){
                list {
                    whoAmI{
                        id,
                        label,
                        color,
                        preview,
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
    const {loading, error, data} = useQuery<IGetRecordData>(LISTQUERY, {
        fetchPolicy: 'network-only',
        variables: {filters: filtersVar}
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
    dispatch({
        type: ActionTypes.SET_LIST,
        data: data[selectedRootQuery].list
    });
    return null;
}
