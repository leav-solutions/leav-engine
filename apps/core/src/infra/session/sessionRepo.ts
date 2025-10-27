// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ICacheService} from '../cache/cacheService';
import {type IRedis} from '../cache/redis';
import ramService from '../cache/ramService';

export type ISessionRepo = ICacheService;

interface ISessionRepoDeps {
    'core.infra.redis'?: IRedis;
}

export default function ({'core.infra.redis': redis = null}: ISessionRepoDeps): ISessionRepo {
    return ramService(redis.session);
}
