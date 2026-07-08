import {LibraryBehavior} from '../../../../../__generated__';
import {type IMessages, type ITreeExplorerTree, type ITreeMutationError} from './_types';

export const getFilesLibraryId = (tree?: ITreeExplorerTree): string | null =>
    tree?.libraries.find(({library}) => library.behavior === LibraryBehavior.files)?.library.id ?? null;

export const getDirectoriesLibraryId = (tree?: ITreeExplorerTree): string | null =>
    tree?.libraries.find(({library}) => library.behavior === LibraryBehavior.directories)?.library.id ?? null;

/**
 * Returns a new `IMessages` with the field-level errors (`parent` / `element`) of a failed tree
 * mutation appended for the given element. Pure: never mutates its `messages` argument.
 */
export const withTreeMutationError = (
    messages: IMessages,
    error: ITreeMutationError,
    element: {id: string; label?: string},
): IMessages => {
    const fields = error.graphQLErrors?.[0]?.extensions?.fields;
    if (!fields) {
        return messages;
    }

    const errors: IMessages['errors'] = {...messages.errors};
    if (fields.parent) {
        errors[fields.parent] = [...(errors[fields.parent] ?? []), element.id];
    }
    if (fields.element) {
        errors[fields.element] = [...(errors[fields.element] ?? []), element.label || element.id];
    }

    return {...messages, errors};
};
