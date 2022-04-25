// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Request} from 'express';
import {IQueryInfos} from './queryInfos';

export interface IRequestWithContext extends Request {
    ctx?: IQueryInfos;
}
