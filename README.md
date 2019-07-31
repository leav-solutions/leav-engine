
# Installation

### Cloning the repo

In terminal pointing to the containing folder;

Via ssh:
```
git clone git@gitlab.cacom.fr:dev/leav/leav_core.git
```

Via https:
```
git clone https://gitlab.cacom.fr/dev/leav/leav_core.git
```
The process will ask for your username / password for Gitlab.


### Installing the dependencies

leav_core is based on Node.js. we recommend using the version 10.16.0.

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

Instruction can be found on their [website](https://www.arangodb.com/docs/stable/installation-mac-osx.html)


###### ArangoDb settings:

leav_core is set to use port 8529 for the Database. This is the default port for ArangoDb.
Make sure to have ArangoDb listening on this port. If you just installed ArangoDb, it should be set out-of-the-box.

Create a database in ArangoDb under the name: 'leav_core'.
For local development, the user is 'root', and no password is set.

### Create and set the local environment.

While migrating the Database, leav_core will try and log the process output. We need to set some local variables to make it work properly.

Create a file in the `config` folder, named `locale.js`. It will hold some local variables, and will be ignored by git.

The content of this file:
```javascript
module.exports = {
    db: {
        url: 'http://root@localhost:8529', // <db_username>@localhost:<port>
        name: 'leav_core' // the name of the database
    },
    logs: {
        level: 'silly',
        transport: ['console'] // Tell to pipe the logs to the console.
    },
    auth: {
        scheme: 'jwt',
        key: 'mysecretkey',
        algorithm: 'HS256',
        tokenExpiration: '7d',
        passwordRegex: /^.{6,20}$/
    },
 };
```

###### In case you prefer to file up the logs:

You'll need to create a `LOGS` folder, and modify the file `locale.js`.

```javascript
module.exports = {
    db: {
        url: 'http://root@localhost:8529', // <db_username>@localhost:<port>
        name: 'leav_core' // the name of the database
    },
    logs: {
        level: 'silly',
        transport: ['console', 'file'], // The logs will be sent to the console AND a file
        destinationFile: '/Users/<username>/<Path-to>/LOGS/node.log' // Path to your node.log file
    },
    auth: {
        scheme: 'jwt',
        key: 'mysecretkey',
        algorithm: 'HS256',
        tokenExpiration: '7d',
        passwordRegex: /^.{6,20}$/
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


