import {Client} from '@elastic/elasticsearch';

interface IDeps {
    config?: any;
}

const _getClient = (config: any): Client => {
    return new Client({
        node: config.elasticsearch.url,
        ...(typeof config.elasticsearch.connection !== 'undefined' && {Connection: config.elasticsearch.connection})
    });
};

export default function(deps: IDeps = {}): Client {
    return _getClient(deps.config);
}
