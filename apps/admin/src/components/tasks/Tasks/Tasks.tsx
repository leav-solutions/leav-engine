import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../../reduxStore/store';
import {addTask, addTasks, deleteTasks} from '../../../reduxStore/tasks/tasks';
import {Button, Header, Icon, Tab} from 'semantic-ui-react';
import styled from 'styled-components';
import {type GET_TASKS_tasks_list} from '../../../_gqlTypes/GET_TASKS';
import useUserData from '../../../hooks/useUserData';
import {
    TaskStatus,
    useCancelTaskMutation,
    useDeleteTasksMutation,
    useGetTasksQuery,
    useSubTasksUpdateSubscription,
} from '../../../_gqlTypes';
import CancelTask from '../CancelTask';
import DeleteAllTasks from '../DeleteAllTasks';
import DeleteTask from '../DeleteTask';
import TasksList from '../TasksList';

const Title = styled(Header)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export type Column =
    | 'id'
    | 'label'
    | 'created_by'
    | 'created_at'
    | 'startAt'
    | 'startedAt'
    | 'canceledBy'
    | 'completedAt'
    | 'progress.percent'
    | 'progress.description'
    | 'duration'
    | 'archive';

const Tasks = (): JSX.Element => {
    const {t} = useTranslation();
    const userData = useUserData();

    const dispatch = useAppDispatch();
    const {tasks} = useAppSelector(state => state.tasks);

    const [inProgressTasks, setInProgressTasks] = useState<GET_TASKS_tasks_list[]>([]);
    const [completedTasks, setCompletedTasks] = useState<GET_TASKS_tasks_list[]>([]);

    const {
        loading,
        error,
        data: tasksData,
    } = useGetTasksQuery({
        skip: !userData,
    });

    useEffect(() => {
        if (tasksData) {
            dispatch(addTasks(tasksData.tasks.list as GET_TASKS_tasks_list[]));
        }
    }, [tasksData]);

    useSubTasksUpdateSubscription({
        onData: subData => {
            const task = {...subData.data.data.task};
            dispatch(addTask(task as GET_TASKS_tasks_list));
        },
    });

    const _isInProgressTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.CREATED ||
        task.status === TaskStatus.PENDING ||
        task.status === TaskStatus.RUNNING ||
        task.status === TaskStatus.PENDING_CANCEL;
    const _isCompletedTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.CANCELED || task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED;

    useEffect(() => {
        if (!!tasks) {
            setInProgressTasks(
                Object.values(tasks)
                    .filter(_isInProgressTask)
                    .sort((a, b) => a.startAt - b.startAt),
            );

            setCompletedTasks(
                Object.values(tasks)
                    .filter(_isCompletedTask)
                    .sort((a, b) => b.completedAt - a.completedAt),
            );
        }
    }, [tasks]);

    const [delTasks] = useDeleteTasksMutation();
    const [cancelTask] = useCancelTaskMutation();

    const _onDeleteAll = async (archivesOnly = false) => {
        const tasksToDel = !archivesOnly ? completedTasks : completedTasks.filter(ct => ct.archive);

        await delTasks({variables: {tasks: tasksToDel.map(ttd => ({id: ttd.id, archive: false}))}});
        dispatch(deleteTasks(tasksToDel));
    };

    const _onDelete = async (taskId: string) => {
        await delTasks({variables: {tasks: [{id: taskId, archive: false}]}});
        dispatch(deleteTasks([{id: taskId}]));
    };

    const onCancel = async (taskId: string) => {
        await cancelTask({variables: {taskId}});
    };

    const panes = [
        {
            menuItem: t('tasks.in_progress'),
            render: () => (
                <Tab.Pane>
                    <TasksList
                        enabledColumns={[
                            'id',
                            'label',
                            'created_by',
                            'created_at',
                            'startAt',
                            'startedAt',
                            'progress.percent',
                            'progress.description',
                            'duration',
                        ]}
                        striped
                        actionsBtn={task =>
                            task.status !== TaskStatus.PENDING_CANCEL
                                ? [<CancelTask onCancel={onCancel} task={task} />]
                                : []
                        }
                        loading={loading || !inProgressTasks}
                        tasks={inProgressTasks}
                    />
                </Tab.Pane>
            ),
        },
        {
            menuItem: t('tasks.completed'),
            render: () => (
                <Tab.Pane>
                    <TasksList
                        enabledColumns={[
                            'id',
                            'label',
                            'created_by',
                            'created_at',
                            'startAt',
                            'startedAt',
                            'canceledBy',
                            'completedAt',
                            'progress.percent',
                            'progress.description',
                            'duration',
                            'archive',
                        ]}
                        actionsBtn={task => [
                            ...(!!task.link
                                ? [
                                      <Button
                                          basic
                                          color="blue"
                                          key="download-file"
                                          icon="download"
                                          href={task.link.url}
                                      />,
                                  ]
                                : []),
                            <DeleteTask onDelete={_onDelete} task={task} />,
                        ]}
                        loading={loading || !completedTasks}
                        tasks={completedTasks}
                        footerBtn={[
                            <DeleteAllTasks
                                confirmMessage={t('tasks.confirm_delete_all')}
                                label={t('tasks.delete_all')}
                                key="btn-delAll"
                                onDeleteAll={_onDeleteAll}
                            />,
                            <DeleteAllTasks
                                confirmMessage={t('tasks.confirm_delete_all_archives')}
                                label={t('tasks.delete_archives')}
                                key="btn-delArchives"
                                onDeleteAll={() => _onDeleteAll(true)}
                            />,
                        ]}
                    />
                </Tab.Pane>
            ),
        },
    ];

    return (
        <>
            <Title size="large">
                <Icon name="tasks" />
                {t('tasks.title')}
            </Title>
            {typeof error !== 'undefined' ? <p>Error: {error.message}</p> : <Tab panes={panes} />}
        </>
    );
};

export default Tasks;
