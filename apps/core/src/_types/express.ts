import {Request} from 'express';
import {IQueryInfos} from './queryInfos';

export interface IRequestWithContext extends Request {
    ctx?: IQueryInfos;
}
