// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IIndexationManagerApp} from 'app/core/indexationManagerApp';

export interface IIndexationManagerInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.core.indexationManager': IIndexationManagerApp;
}

export default function ({'core.app.core.indexationManager': indexationManager}: IDeps): IIndexationManagerInterface {
    return {
        init: () => indexationManager.init()
    };
}
