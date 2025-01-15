// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';
import {IActiveTree} from 'graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {GET_APPLICATION_BY_ENDPOINT_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {LibraryBehavior, TaskStatus} from '_gqlTypes/globalTypes';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {AvailableLanguage, IApplicationSettings, IInfo, InfoPriority} from '../_types/types';

export function getFileUrl(filepath: string) {
    // Assets are served from the same origin as the application. Just return the filepath but keep this function
    // in case it becomes more complicated
    return filepath;
}

export const localizedTranslation = (translations: any, availableLanguages: AvailableLanguage[] | string[]): string => {
    if (!translations) {
        return '';
    }

    const userLang = availableLanguages[0];
    const fallbackLang = availableLanguages[1] ?? '';

    return translations[userLang] || translations[fallbackLang] || translations[Object.keys(translations)[0]] || '';
};

export const sortInfoByPriority = (a: IInfo, b: IInfo) => {
    switch (a.priority) {
        case InfoPriority.low:
            switch (b.priority) {
                case InfoPriority.low:
                    return 0;
                case InfoPriority.medium:
                    return 1;
                case InfoPriority.high:
                default:
                    return 1;
            }
        case InfoPriority.medium:
            switch (b.priority) {
                case InfoPriority.low:
                    return -1;
                case InfoPriority.medium:
                    return 0;
                case InfoPriority.high:
                default:
                    return 1;
            }
        case InfoPriority.high:
            switch (b.priority) {
                case InfoPriority.low:
                    return -1;
                case InfoPriority.medium:
                    return -1;
                case InfoPriority.high:
                default:
                    return 0;
            }
    }
};

/**
 * Cloning gql template tag because some apollo tools like query validation and codegen won't be happy if we use
 * interpolation in template strings. With a different tag name, the query won't be parsed by these tools
 * thus they won't complain about it.
 * It works exactly the same at runtime.
 */
export const gqlUnchecked = gql;

export const getTreeRecordKey = (record: RecordIdentity): string => `${record.whoAmI.library.id}/${record.id}`;

export const explorerQueryParamName = 'explorer';
export const explorerLinkQueryParamName = 'explorer-link';

export const getLibraryLink = (libId: string) => `/library/${libId}`;
export const getExplorerLibraryLink = (libId: string) => getLibraryLink(libId) + '?' + explorerQueryParamName;
export const getLinkExplorerLink = (libId: string) => getLibraryLink(libId) + '?' + explorerLinkQueryParamName;
export const getTreeLink = (treeId: string) => `/tree/${treeId}`;

export const isLibraryInApp = (app: GET_APPLICATION_BY_ENDPOINT_applications_list, libraryId: string): boolean => {
    const settings: IApplicationSettings = app?.settings ?? {};
    if (settings.libraries === 'none') {
        return false;
    }

    if (settings.libraries === 'all') {
        return true;
    }

    const appLibraries = settings.libraries ?? [];
    return !!appLibraries.find(appLib => appLib === libraryId);
};

export const isTreeInApp = (app: GET_APPLICATION_BY_ENDPOINT_applications_list, treeId: string): boolean => {
    const settings: IApplicationSettings = app?.settings ?? {};
    if (settings.trees === 'none') {
        return false;
    }

    if (settings.trees === 'all') {
        return true;
    }

    const appTrees = settings.trees ?? [];
    return !!appTrees.find(appTree => appTree === treeId);
};

export const getFilesLibraryId = (tree: IActiveTree): string =>
    (tree?.libraries ?? []).find(l => l.behavior === LibraryBehavior.files)?.id ?? null;

export const isInProgressTask = (task: GET_TASKS_tasks_list) =>
    task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING;

export const isCompletedTask = (task: GET_TASKS_tasks_list) =>
    task.status === TaskStatus.CANCELED || task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED;

export const isExceptionTask = (task: GET_TASKS_tasks_list) =>
    task.status === TaskStatus.CANCELED || task.status === TaskStatus.FAILED;
