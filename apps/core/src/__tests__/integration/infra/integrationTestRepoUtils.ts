// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';

export const getCoreDep = <T>(path): T => {
    const coreContainer = (globalThis as any).coreContainer;
    return coreContainer.cradle[path];
};

export const getLibraryRepo = (): ILibraryRepo => getCoreDep<ILibraryRepo>('core.infra.library');

export const getRecordRepo = (): IRecordRepo => getCoreDep<IRecordRepo>('core.infra.record');

export const getTreeRepo = (): ITreeRepo => getCoreDep<ITreeRepo>('core.infra.tree');
