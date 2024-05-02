// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Table, Progress, Icon} from 'semantic-ui-react';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {TaskStatus} from '_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import moment from 'moment';
import {Column} from '../Tasks/Tasks';
import useLang from 'hooks/useLang';
import {localizedTranslation} from '@leav/utils';

interface ITasksListProps {
    striped?: boolean;
    enabledColumns: Column[];
    actionsBtn?: (task: GET_TASKS_tasks_list) => JSX.Element[]; // buttons on the end of the row
    footerBtn?: JSX.Element[]; // global buttons on bottom of the list
    tasks: GET_TASKS_tasks_list[] | null;
    loading?: boolean;
}

const _getTaskDuration = (startedAt: number, completedAt: number): string => {
    const d =
        !startedAt || !completedAt ? moment.duration(0) : moment.duration(moment(completedAt).diff(moment(startedAt)));

    return `${d.hours() + 'h'} ${d.minutes() + 'm'} ${d.seconds() + 's'}`;
};

const _resolveColumn = (path, obj) => path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);

const TasksList = ({
    striped = false,
    enabledColumns,
    actionsBtn,
    footerBtn,
    tasks,
    loading
}: ITasksListProps): JSX.Element => {
    const {t} = useTranslation();
    const lang = useLang().lang;

    const [maxNbBtnsInRow, setmaxNbBtnsInRow] = useState<number>(0);
    const [sort, setSort] = useState<{column: string; direction: 'ascending' | 'descending'}>({
        column: 'completedAt',
        direction: 'descending'
    });

    useEffect(() => {
        if (!!actionsBtn && tasks.length) {
            setmaxNbBtnsInRow(
                tasks.map(task => actionsBtn(task).length).reduce((prev, curr) => (curr > prev ? curr : prev), 0)
            );
        }
    }, [actionsBtn]);

    const onSort = (column: string) => {
        setSort({column, direction: sort.direction === 'ascending' ? 'descending' : 'ascending'});
    };

    return (
        <div style={{overflowX: 'scroll'}}>
            <Table data-testid="TasksList" compact sortable striped={striped}>
                <Table.Header>
                    <Table.Row>
                        {enabledColumns.map(c => (
                            <Table.HeaderCell
                                key={`hc-${c}`}
                                sorted={sort.column === c ? sort.direction : null}
                                onClick={() => onSort(c)}
                            >
                                {t(`tasks.task-${c}`)}
                            </Table.HeaderCell>
                        ))}
                        {[...Array(maxNbBtnsInRow)].map((_, i) => (
                            <Table.HeaderCell width={1} key={`hc-btn${i}`} />
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {loading ? (
                        <Table.Row>
                            <Table.Cell colSpan={6}>
                                <Loading />
                            </Table.Cell>
                        </Table.Row>
                    ) : (
                        tasks &&
                        tasks
                            .sort((f, s) => {
                                if (_resolveColumn(sort.column, f) < _resolveColumn(sort.column, s)) {
                                    return sort.direction === 'ascending' ? -1 : 1;
                                } else if (_resolveColumn(sort.column, f) > _resolveColumn(sort.column, s)) {
                                    return sort.direction === 'ascending' ? 1 : -1;
                                }

                                return 0;
                            })
                            .map(task => {
                                const actions = !!actionsBtn ? actionsBtn(task) : null;

                                return (
                                    <Table.Row
                                        {...((task.status === TaskStatus.PENDING_CANCEL ||
                                            task.status === TaskStatus.CANCELED) && {warning: true})}
                                        {...(task.status === TaskStatus.FAILED && {error: true})}
                                        key={`row${task.id}`}
                                        data-testid="TableRow"
                                    >
                                        {enabledColumns.includes('id') && <Table.Cell>{task.id}</Table.Cell>}
                                        {enabledColumns.includes('label') && (
                                            <Table.Cell>{localizedTranslation(task.label, lang)}</Table.Cell>
                                        )}
                                        {enabledColumns.includes('created_by') && (
                                            <Table.Cell>{task.created_by.whoAmI.label}</Table.Cell>
                                        )}
                                        {enabledColumns.includes('created_at') && (
                                            <Table.Cell>{new Date(task.created_at * 1000).toLocaleString()}</Table.Cell>
                                        )}
                                        {enabledColumns.includes('startAt') && (
                                            <Table.Cell>{new Date(task.startAt * 1000).toLocaleString()}</Table.Cell>
                                        )}
                                        {enabledColumns.includes('startedAt') && (
                                            <Table.Cell>
                                                {task.startedAt ? new Date(task.startedAt * 1000).toLocaleString() : ''}
                                            </Table.Cell>
                                        )}
                                        {enabledColumns.includes('canceledBy') && (
                                            <Table.Cell>{task.canceledBy?.whoAmI.label}</Table.Cell>
                                        )}
                                        {enabledColumns.includes('completedAt') && (
                                            <Table.Cell>
                                                {new Date(task.completedAt * 1000).toLocaleString()}
                                            </Table.Cell>
                                        )}
                                        {enabledColumns.includes('progress.percent') && (
                                            <Table.Cell textAlign="center">
                                                <Progress
                                                    percent={task.progress?.percent || 0}
                                                    progress
                                                    {...(task.status === TaskStatus.DONE && {success: true})}
                                                    {...((task.status === TaskStatus.CANCELED ||
                                                        task.status === TaskStatus.PENDING_CANCEL) && {warning: true})}
                                                    {...(task.status === TaskStatus.FAILED && {error: true})}
                                                >
                                                    {t(`tasks.task-statuses.${task.status}`)}
                                                </Progress>
                                            </Table.Cell>
                                        )}
                                        {enabledColumns.includes('progress.description') && (
                                            <Table.Cell>
                                                {task.progress?.description
                                                    ? localizedTranslation(task.progress?.description, lang)
                                                    : ''}
                                            </Table.Cell>
                                        )}
                                        {enabledColumns.includes('duration') && (
                                            <Table.Cell>
                                                {_getTaskDuration(task.startedAt, task.completedAt)}
                                            </Table.Cell>
                                        )}
                                        {enabledColumns.includes('archive') && (
                                            <Table.Cell>
                                                <Icon name={task.archive ? 'check' : 'close'} />
                                            </Table.Cell>
                                        )}
                                        {!!actions &&
                                            [...Array(maxNbBtnsInRow)].map((_, i) => {
                                                const idx =
                                                    actions.length === maxNbBtnsInRow
                                                        ? i
                                                        : maxNbBtnsInRow - actions.length - i;

                                                return (
                                                    <Table.Cell key={`actionBtn${idx}${task.id}`} textAlign="center">
                                                        {actions[idx]}
                                                    </Table.Cell>
                                                );
                                            })}
                                    </Table.Row>
                                );
                            })
                    )}
                </Table.Body>
                {!!footerBtn && (
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan={enabledColumns.length + maxNbBtnsInRow}>
                                {footerBtn.map(b => b)}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                )}
            </Table>
        </div>
    );
};

TasksList.defaultProps = {
    loading: false,
    tasks: [],
    filters: {}
};

export default TasksList;
