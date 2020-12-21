# Installation

### Installing the dependencies

leav_core is based on Node.js. The version shall be 8.0 or above.

Be sure to have Node and npm installed on your machine.

In terminal, pointing to the folder 'leav_core';

```
npm install
```

or:

```
npm i
```

### Installing ArangoDB

leav_core uses ArangoDB Community Edition as it's database.

If ArangoDB in not installed on your machine, you'll have to install ArangoDB.

Instruction can be found on their [website](https://www.arangodb.com/docs/stable/installation.html)

###### ArangoDb settings:

leav_core is set to use port 8529 for the Database. This is the default port for ArangoDb.
Make sure to have ArangoDb listening on this port. If you just installed ArangoDb, it should be set out-of-the-box.

Create a database in ArangoDb under the name: 'leav_core'.
For local development, the user is 'root', and no password is set.

### Create and set the local environment.

leav_core depends on some variables such as the port for the server, the address of the database, the auth scheme... Those different configurations can be found in the `config` folder.

You can overwrite the variables using your own `local.js` file in the `config` folder. Any variable described in the `local.js` file will overwrite the default variables.

Here below is an exemple of a `local.js` file:

```javascript
module.exports = {
  db: {
    url: "http://root@localhost:8529", // the url of the arangoDB instance
    name: "leav_core", // the name of the database
  },
  logs: {
    level: "silly", // set the level (verbosity) of the logs
    transport: ["console"], // Tell to pipe the logs to the console.
  },
  auth: {
    scheme: "jwt", // set the auth scheme between the serv er and client app.
    key: "mysecretkey",
    algorithm: "HS256",
    tokenExpiration: "7d",
    passwordRegex: /^.{6,20}$/,
  },
};
```

###### In case you prefer to file up the logs:

You'll need to create a log file, and set the destination of that file in `local.js`.

```javascript
module.exports = {
  db: {
    url: "http://root@localhost:8529", // the url of the arangoDB instance
    name: "leav_core", // the name of the database
  },
  logs: {
    level: "silly",
    transport: ["console", "file"], // The logs will be sent to the console AND a file
    destinationFile: "/Users/<username>/<Path-to>/node.log", // Path to your node.log file
  },
  auth: {
    scheme: "jwt",
    key: "mysecretkey",
    algorithm: "HS256",
    tokenExpiration: "7d",
    passwordRegex: /^.{6,20}$/,
  },
};
```

### Migrate the Database

There's a script that will migrate the database for you.

In Terminal, pointing to `leav_core` folder:

```
npm run db:migrate
```

### Start Development process and watch

In Terminal, pointing to `leav_core` folder:

```
npm run start:watch
```

### Troubleshooting

If you're stuck in the migration / installation phase, try to remove the `package-lock.json`file, and type in Terminal: `npm i`.

If you find a Gremlin in the system, keep calm, get out, and call 911.

### Debugging

The app is launched with the `inspect` option so you can attach a debugging tool to it, on port 9229.

#### VS Code in Docker environment

In VS Code, the easiest way to debug the app in its Docker container is to install the extension "Remote Development".
Then, you will be able to open a container inside VS Code.
Once inside the container, add this to your debbuging settings in `launch.json`:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach",
  "port": 9229,
  "skipFiles": ["<node_internals>/**", "node_modules/**"]
}
```

Then start your debug session and enjoy! You can set breakpoints right on your file TS files and watch it breaking when using your app normally.

More details on this: https://code.visualstudio.com/docs/remote/containers
