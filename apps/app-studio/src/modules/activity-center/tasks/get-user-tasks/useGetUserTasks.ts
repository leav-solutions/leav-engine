// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {useGetUserTasksQuery, useSubscribeToUserTasksSubscription} from '../../../../__generated__';
import {type Task} from '../types';

export const useGetUserTasks = (userId: string) => {
    const [userTasks, setUserTasks] = useState<Map<string, Task>>(new Map());

    const {loading, error} = useGetUserTasksQuery({
        fetchPolicy: 'network-only',
        variables: {
            filters: {
                created_by: userId,
                archive: false,
            },
        },
        skip: !userId,
        onCompleted: ({tasks}) => {
            setUserTasks(new Map(tasks.list.map(task => [task.id, task])));
        },
    });

    useSubscribeToUserTasksSubscription({
        variables: {
            filters: {
                created_by: userId,
                archive: false,
            },
        },
        skip: !userId,
        onData: subData => {
            const task = subData.data.data?.task;
            setUserTasks(prev => {
                const newMap = new Map(prev);
                newMap.set(task.id, task);
                return newMap;
            });
        },
    });

    const removeTasks = (taskIds: string[]) => {
        setUserTasks(prev => {
            const newMap = new Map(prev);
            taskIds.forEach(id => newMap.delete(id));
            return newMap;
        });
    };

    const sortedByCreationDateUserTasks = Array.from(userTasks.values()).sort(
        (a, b) => Number(b.created_at) - Number(a.created_at),
    );

    return {userTasks: sortedByCreationDateUserTasks, loading, error, removeTasks};
};
