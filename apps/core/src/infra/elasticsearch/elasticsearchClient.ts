import {Client} from '@elastic/elasticsearch';
import {type IConfig} from '../../_types/config';

interface IDeps {
    config?: IConfig;
}

export default function (deps: IDeps = {}): Client {
    const _getClient = (config: IConfig): Client =>
        new Client({
            node: config.elasticsearch.url,
        });

    return _getClient(deps.config);
}
