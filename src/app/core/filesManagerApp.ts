// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFilesManagerDomain} from 'domain/filesManager/filesManagerDomain';

export interface IFilesManagerApp {
    init(): Promise<void>;
}

interface IDeps {
    'core.domain.filesManager'?: IFilesManagerDomain;
}

export default function({'core.domain.filesManager': filesManager}: IDeps): IFilesManagerApp {
    return {
        init: () => filesManager.init()
    };
}
