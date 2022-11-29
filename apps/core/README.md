# LEAV Engine - Core
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

### Debugging in VS Code

In VS Code, the easiest way to debug the app in its Docker container is to install the extension "Remote Development".
Then, you will be able to open a container inside VS Code.
Once inside the container, add this to your debugging settings in `launch.json`:

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
