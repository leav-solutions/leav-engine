// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type {Express, RequestHandler} from 'express';
import type {IAppModule} from '../../_types/shared';
import type {ExpressAppMethod, PluginRegisterRoute} from '../../_types/endpoint';
import type {IRequestWithContext} from '../../_types/express';
import type {InitQueryContextFunc} from '../helpers/initQueryContext';
import type {ValidateRequestTokenFunc} from '../helpers/validateRequestToken';

interface IEndpointApp extends IAppModule {
    /**
     * Method call automatically by the LEAV Core: server.ts
     * @param app Express instance, can be used to extend the app
     */
    registerRoute(app: Express): void;
}

interface IPluginRoute {
    path: string;
    method: ExpressAppMethod;
    /**
     * All plugin route handlers should be used after an auth middleware.
     * Errors are managed globally by a middleware.
     */
    handlers: Array<RequestHandler<any>>;
}

interface IDeps {
    'core.app.helpers.initQueryContext'?: InitQueryContextFunc;
    'core.app.helpers.validateRequestToken'?: ValidateRequestTokenFunc;
}

export default function ({
    'core.app.helpers.initQueryContext': initQueryContext = null,
    'core.app.helpers.validateRequestToken': validateRequestToken = null
}: IDeps = {}): IEndpointApp {
    const _pluginsRoutes: IPluginRoute[] = [];

    return {
        registerRoute(app) {
            const _initCtxHandler: RequestHandler<any> = async (req: IRequestWithContext, res, next) => {
                try {
                    req.ctx = initQueryContext(req);

                    const {groupsId, userId} = await validateRequestToken(req, res);
                    req.ctx.userId = userId;
                    req.ctx.groupsId = groupsId;

                    return next();
                } catch (err) {
                    return next(err);
                }
            };

            _pluginsRoutes.forEach(route => {
                app[route.method](route.path, [_initCtxHandler, ...route.handlers]);
            });
        },
        extensionPoints: {
            registerRoutes: (routes: PluginRegisterRoute[]) => {
                _pluginsRoutes.push(
                    ...routes.map<IPluginRoute>(([path, method, handlers]) => ({
                        path,
                        method,
                        handlers
                    }))
                );
            }
        }
    };
}
