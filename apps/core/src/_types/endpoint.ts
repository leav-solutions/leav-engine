// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RequestHandler} from 'express';

/**
 * Duplicate type from express-serve-static-core/IRouterMatcher second generic type
 */
export type ExpressAppMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export type PluginRegisterRoute<T = any> = [path: string, method: ExpressAppMethod, handlers: Array<RequestHandler<T>>];
