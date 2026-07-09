import {type ICacheService} from '../cache/cacheService';
import {type IRedis} from '../cache/redis';
import ramService from '../cache/ramService';

export type ISessionRepo = ICacheService;

interface ISessionRepoDeps {
    'core.infra.redis'?: IRedis;
}

export default function ({'core.infra.redis': redis = null}: ISessionRepoDeps): ISessionRepo {
    return ramService(redis.session, 'session');
}
