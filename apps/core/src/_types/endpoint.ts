import {type RequestHandler} from 'express';

/**
 * Duplicate type from express-serve-static-core/IRouterMatcher second generic type
 */
export type ExpressAppMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export type PluginRegisterRoute<T = any> = [
    path: string,
    method: ExpressAppMethod,
    handlers: Array<RequestHandler<T>>,
    isProtected?: boolean,
];
