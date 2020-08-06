import {IIndexationManagerApp} from 'app/core/indexationManagerApp';

export interface IIndexationManagerInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.core.indexationManager'?: IIndexationManagerApp;
}

export default function({'core.app.core.indexationManager': indexationManager}: IDeps): IIndexationManagerInterface {
    return {
        init: () => indexationManager.init()
    };
}
