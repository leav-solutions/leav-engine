import {LibraryBehavior} from '../../__generated__';
import {type ITreeExplorerTree} from './_types';

export const getFilesLibraryId = (tree?: ITreeExplorerTree): string | null =>
    tree?.libraries.find(({library}) => library.behavior === LibraryBehavior.files)?.library.id ?? null;

export const getDirectoriesLibraryId = (tree?: ITreeExplorerTree): string | null =>
    tree?.libraries.find(({library}) => library.behavior === LibraryBehavior.directories)?.library.id ?? null;
