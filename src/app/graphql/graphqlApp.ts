import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';

export interface IGraphqlApp {
    schema: GraphQLSchema;
}

export default (): IGraphqlApp => {
    return {
        get schema() {
            // The GraphQL schema in string form
            const typeDefs = `
              type Query { test: Test }
              type Test { hello: String }
            `;

            // The resolvers
            const resolvers = {
                Query: {
                    test: () => ({
                        hello: 'world!'
                    })
                }
            };

            // Put together a schema
            const schema = makeExecutableSchema({
                typeDefs,
                resolvers
            });

            return schema;
        }
    };
};
