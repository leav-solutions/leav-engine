import {type Entrypoint, type IEntrypointLibrary} from '../_types';

/**
 * Values list restricting the records request of a library entrypoint. Dropped while searching on a
 * free-entry entrypoint, so the search is not limited to the list. Shared by `useExplorerData` and
 * the kanban per-column loading, so both requests stay strictly identical.
 */
export const getLibraryRequestValuesList = (entrypoint: Entrypoint, fulltextSearch: string): string[] | undefined => {
    if (entrypoint.type !== 'library') {
        return undefined;
    }

    const {allowFreeEntry, valuesList} = entrypoint as IEntrypointLibrary;

    if (fulltextSearch && allowFreeEntry) {
        return undefined;
    }

    return valuesList;
};
