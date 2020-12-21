// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFilesManagerApp} from 'app/core/filesManagerApp';

export interface IFilesManagerInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.core.filesManager'?: IFilesManagerApp;
}

export default function ({'core.app.core.filesManager': filesManager}: IDeps): IFilesManagerInterface {
    return {
        init: () => filesManager.init()
    };
}
