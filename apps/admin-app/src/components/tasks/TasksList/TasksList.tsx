// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Table, Progress, Button, Icon} from 'semantic-ui-react';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {TaskStatus} from '_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import moment from 'moment';
import {string} from 'yup';

interface ITasksListProps {
    striped?: boolean;
    actionsBtn: (task: GET_TASKS_tasks_list) => JSX.Element[];
    footerBtn?: JSX.Element[];
    tasks: GET_TASKS_tasks_list[] | null;
    loading?: boolean;
}

const TasksList = ({striped = false, actionsBtn, footerBtn, tasks, loading}: ITasksListProps): JSX.Element => {
    const {t} = useTranslation();

    const [sort, setSort] = useState<{column: string; direction: 'ascending' | 'descending'}>({
        column: 'completedAt',
        direction: 'descending'
    });

    const _getTaskDuration = (startedAt: number, completedAt: number): string => {
        const d =
            !startedAt || !completedAt
                ? moment.duration(0)
                : moment.duration(moment(completedAt).diff(moment(startedAt)));

        return `${d.hours() + 'h'} ${d.minutes() + 'm'} ${d.seconds() + 's'}`;
    };

    const maxNbBtnsInRown = tasks
        .map(task => actionsBtn(task).length)
        .reduce((prev, curr) => (curr > prev ? curr : prev), 0);

    const onSort = (column: string) => {
        console.debug({column});
        setSort({column, direction: sort.direction === 'ascending' ? 'descending' : 'ascending'});
    };

    const resolveColumn = (path, obj) => {
        return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
    };

    return (
        <>
            <Table compact sortable striped={striped} fixed>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell
                            width={2}
                            key="hc-id"
                            sorted={sort.column === 'id' ? sort.direction : null}
                            onClick={() => onSort('id')}
                        >
                            {'ID'}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={3}
                            key="hc-name"
                            onClick={() => onSort('name')}
                            sorted={sort.column === 'name' ? sort.direction : null}
                        >
                            {t('tasks.task-name')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            key="hc-createdAt"
                            onClick={() => onSort('created_at')}
                            sorted={sort.column === 'created_at' ? sort.direction : null}
                        >
                            {t('tasks.task-createdAt')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            key="hc-startAt"
                            onClick={() => onSort('startAt')}
                            sorted={sort.column === 'startAt' ? sort.direction : null}
                        >
                            {t('tasks.task-startAt')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            key="hc-startedAt"
                            onClick={() => onSort('startedAt')}
                            sorted={sort.column === 'startedAt' ? sort.direction : null}
                        >
                            {t('tasks.task-startedAt')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            key="hc-canceledBy"
                            onClick={() => onSort('canceledBy')}
                            sorted={sort.column === 'canceledBy' ? sort.direction : null}
                        >
                            {t('tasks.task-canceledBy')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            key="hc-completedAt"
                            onClick={() => onSort('completedAt')}
                            sorted={sort.column === 'completedAt' ? sort.direction : null}
                        >
                            {t('tasks.task-completedAt')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={3}
                            key="hc-progress"
                            onClick={() => onSort('progress.percent')}
                            sorted={sort.column === 'progress.percent' ? sort.direction : null}
                        >
                            {t('tasks.task-progress')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={3}
                            key="hc-step"
                            onClick={() => onSort('status')}
                            sorted={sort.column === 'status' ? sort.direction : null}
                        >
                            {t('tasks.task-step')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={1}
                            key="hc-duration"
                            onClick={() => onSort('duration')}
                            sorted={sort.column === 'duration' ? sort.direction : null}
                        >
                            {t('tasks.task-duration')}
                        </Table.HeaderCell>
                        {[...Array(maxNbBtnsInRown)].map((_, i) => (
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
                                if (resolveColumn(sort.column, f) < resolveColumn(sort.column, s)) {
                                    return sort.direction === 'ascending' ? -1 : 1;
                                } else if (resolveColumn(sort.column, f) > resolveColumn(sort.column, s)) {
                                    return sort.direction === 'ascending' ? 1 : -1;
                                }

                                return 0;
                            })
                            .map(task => {
                                const actions = actionsBtn(task);

                                return (
                                    <Table.Row
                                        {...(task.status === TaskStatus.CANCELED && {warning: true})}
                                        {...(task.status === TaskStatus.FAILED && {error: true})}
                                        key={task.id}
                                    >
                                        <Table.Cell>{task.id}</Table.Cell>
                                        <Table.Cell>{task.name}</Table.Cell>
                                        <Table.Cell>{new Date(task.created_at * 1000).toLocaleString()}</Table.Cell>
                                        <Table.Cell>{new Date(task.startAt * 1000).toLocaleString()}</Table.Cell>
                                        <Table.Cell>{new Date(task.startedAt * 1000).toLocaleString()}</Table.Cell>
                                        <Table.Cell>{task.canceledBy}</Table.Cell>
                                        <Table.Cell>{new Date(task.completedAt * 1000).toLocaleString()}</Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <Progress
                                                percent={task.progress?.percent || 0}
                                                progress
                                                {...(task.status === TaskStatus.DONE && {success: true})}
                                                {...(task.status === TaskStatus.CANCELED && {warning: true})}
                                                {...(task.status === TaskStatus.FAILED && {error: true})}
                                            >
                                                {t(`tasks.task-statuses.${task.status}`)}
                                            </Progress>
                                        </Table.Cell>
                                        <Table.Cell>{task.progress?.description}</Table.Cell>
                                        <Table.Cell>{_getTaskDuration(task.startedAt, task.completedAt)}</Table.Cell>
                                        {[...Array(maxNbBtnsInRown)].map((_, i) => {
                                            return (
                                                <Table.Cell textAlign="center">
                                                    {
                                                        actions[
                                                            actions.length === maxNbBtnsInRown
                                                                ? i
                                                                : maxNbBtnsInRown - actions.length - i
                                                        ]
                                                    }
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
                            <Table.HeaderCell colSpan={12}>{footerBtn.map(b => b)}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                )}
            </Table>
        </>
    );
};

TasksList.defaultProps = {
    loading: false,
    tasks: [],
    filters: {}
};

export default TasksList;
