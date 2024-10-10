// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {IQueryInfos} from '_types/queryInfos';
import * as Config from '_types/config';
import {i18n} from 'i18next';

interface IDeps {
    'core.domain.tasksManager': ITasksManagerDomain;
    config: Config.IConfig;
    translator: i18n;
}

export type UpdateTaskProgress = (
    taskId: string,
    currPercent: number,
    ctx: IQueryInfos,
    upData: {position?: {index: number; total: number}; translationKey: string}
) => Promise<number>;

export default function ({
    'core.domain.tasksManager': tasksManagerDomain,
    config,
    translator
}: IDeps): UpdateTaskProgress {
    // return new percent of progress
    return async (taskId, currPercent, ctx, upData) => {
        const newPercent = !!upData.position ? Math.ceil((upData.position.index / upData.position.total) * 100) : null;

        if (!!upData.position || !!upData.translationKey) {
            await tasksManagerDomain.updateProgress(
                taskId,
                {
                    ...(newPercent && newPercent >= currPercent + 1 && {percent: newPercent}),
                    ...(!!upData.translationKey && {
                        description: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t(upData.translationKey, {lng: lang})}`;
                            return labels;
                        }, {})
                    })
                },
                ctx
            );
        }

        return newPercent ?? currPercent;
    };
}
