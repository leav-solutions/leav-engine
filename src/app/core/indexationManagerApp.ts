import {IIndexationManagerDomain} from 'domain/indexationManager/indexationManagerDomain';

export interface IIndexationManagerApp {
    init(): Promise<void>;
}

interface IDeps {
    'core.domain.indexationManager'?: IIndexationManagerDomain;
}

export default function({'core.domain.indexationManager': indexationManager}: IDeps): IIndexationManagerApp {
    return {
        init: () => indexationManager.init()
    };
}
