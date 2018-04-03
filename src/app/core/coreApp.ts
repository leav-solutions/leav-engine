import {merge} from 'lodash';
import {ILibraryDomain} from 'domain/libraryDomain';
import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IAttributeDomain} from 'domain/attributeDomain';
import {IRecordDomain} from 'domain/recordDomain';
import {IValueDomain} from 'domain/valueDomain';
import {IAttribute} from '_types/attribute';
import {ILibrary} from '_types/library';
import {IRecord} from '_types/record';
import {IValue} from '_types/value';
import {AwilixContainer} from 'awilix';

export interface ICoreApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    libraryDomain: ILibraryDomain,
    attributeDomain: IAttributeDomain,
    recordDomain: IRecordDomain,
    valueDomain: IValueDomain,
    depsManager: AwilixContainer,
    config: any
): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type SystemTranslation {
                        ${config.lang.available.map(l => `${l}: String`)}
                    }

                    input SystemTranslationInput {
                        ${config.lang.available.map(l => `${l}: String${l === config.lang.default ? '!' : ''}`)}
                    }
                `,
                resolvers: {}
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
