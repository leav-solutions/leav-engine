// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useArchiveUserTasksMutation} from '../../../../__generated__';
import {type Task} from '../types';

export const useArchiveUserTasks = () => {
    const [archiveUserTasksMutation] = useArchiveUserTasksMutation();

    const archiveUserTasks = async (tasks: Task[]) => {
        await archiveUserTasksMutation({variables: {tasks: tasks.map(task => ({id: task.id, archive: true}))}});
    };

    return {archiveUserTasks};
};
