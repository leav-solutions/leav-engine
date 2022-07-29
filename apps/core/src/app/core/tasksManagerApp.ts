// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import winston from 'winston';
import {IConfig} from '_types/config';
// import {IAppGraphQLSchema} from '_types/graphql';

export interface ITasksManagerApp {
    init(): Promise<void>;
    // getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.tasksManager'?: ITasksManagerDomain;
    'core.utils.logger'?: winston.Winston;
    config?: IConfig;
}

export default function ({
    'core.domain.tasksManager': tasksManager,
    'core.utils.logger': logger = null,
    config = null
}: IDeps): ITasksManagerApp {
    return {
        init: async () => tasksManager.init()
        // async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
        //     const baseSchema = {
        //         typeDefs: `
        //         `,

        //         resolvers: {}
        //     };

        //     const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

        //     return fullSchema;
        // }
    };
}
