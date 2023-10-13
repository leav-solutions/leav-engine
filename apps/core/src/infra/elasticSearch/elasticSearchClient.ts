// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import {IConfig} from '_types/config';

interface IDeps {
    config?: IConfig;
}

export default function(deps: IDeps = {}): Client {
    const _getClient = (config: IConfig): Client => {
        return new Client({
            node: config.elasticSearch.url
        });
    };

    return _getClient(deps.config);
}
