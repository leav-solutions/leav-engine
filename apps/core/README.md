# LEAV Engine - Core

## Create and set the local environment.

leav_core depends on some variables such as the port for the server, the address of the database, the auth scheme...
Those different configurations can be found in the `config` folder.

You can overwrite the variables using your own `local.js` file in the `config` folder. Any variable described in
the `local.js` file will overwrite the default variables.

Here below is an exemple of a `local.js` file:

```javascript
module.exports = {
    db: {
        url: 'http://root@localhost:8529', // the url of the arangoDB instance
        name: 'leav_core', // the name of the database
    },
    logs: {
        level: 'silly', // set the level (verbosity) of the logs
        transport: ['console'], // Tell to pipe the logs to the console.
    },
    auth: {
        scheme: 'jwt', // set the auth scheme between the serv er and client app.
        key: 'mysecretkey',
        algorithm: 'HS256',
        tokenExpiration: '7d',
        passwordRegex: /^.{6,20}$/,
    },
};
```

## Add plugins

You can add plugins to the core by adding them to the plugins folder. Each plugin live in its own folder and have at least a `index.ts` file.

The plugin folder is located by default in `apps/core/src/plugins` on development environment and `apps/core/dist/plugins` on build.
It can be configured with the `PLUGINS_PATH` environment variable or the `pluginsPath` variable in the `config/local.js` file. ⚠️ The path must be under the `apps/core/src/plugins` folder (eg. `apps/core/src/plugins/my-own-repo/my-plugins`)

### Tests

In addition to unit tests, there are integration (internal) and end-to-end (api) tests.

End-to-end or integration testing needs to be run inside the container as it starts a server, access to the DB, etc.
This can be done by either:

-   Need to run with mailpit: `docker compose --profile mail up -d`
-   Running a shell in the _core_ container and executing `yarn run test:e2e` or `yarn run test:e2e:api` or
    `yarn run test:integration`
-   Executing the command from your machine: `docker exec -i $(docker container ls -aqf "name=core") yarn run test:e2e`

#### Add graphql query in e2e tests

-   Add .graphql file anywhere in src/\_\_tests\_\_/e2e/
-   Start your local stack (`docker compose ...`)
-   Setup your ./apolloApiKey.js from ./apolloApiKey.js.example

```
yarn run graphql-generate
```

-   And use them like

```ts
import {e2eSdk} from '../e2eUtils';
await e2eSdk.SaveApiKey();
```

-   Do not try to share to much graphql among test, expect for very common usage like create library, attributes ...

## Debugging in your IDE

### VSCode

VSCode can natively handle the debugging of the core running in a Docker container.
Just add the following configuration in your `launch.json` or workspace settings:

```json
{
    "name": "Attach to LEAV Engine Core",
    "type": "node",
    "request": "attach",
    "localRoot": "${workspaceRoot}/apps/core",
    "remoteRoot": "/app/apps/core",
    "address": "127.0.0.1",
    "port": 9229,
    "restart": true,
    "sourceMaps": true,
    "outFiles": ["${workspaceRoot}/apps/core/**/*.ts"],
    "trace": true
}
```

You might have to adjust the `localRoot` and `outFiles` depending on your local settings.

Then start your debug session and enjoy!
You can set breakpoints right on your TS files and watch it breaking when using your app normally.

### JetBrains suite

Just follow the doc on https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html#ws_node_debug_remote_chrome

### Troubleshooting

If you stop on a breakpoint for a while, the core might crash because the connection with RabbitMQ is lost.
Just restart the core when you release the breakpoint.
