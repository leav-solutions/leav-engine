# LEAV Engine
This is the monorepo for LEAV Engine. It contains all projects related to LEAV Engine, including the core, the automate and the front for admin and data-studio.
All apps are located in the `src/apps` folder. All shared code must live in the `src/libs` folder.

We're using [Yarn Workspaces](https://yarnpkg.com/features/workspaces) to manage dependencies and scripts running accross all projects.

## Dependencies

### Add dependencies
Each project have its own dependencies in its own `package.json`.
When adding dependencies, Yarn will handle the different packages on different versions required for each project. See [Yarn doc](https://yarnpkg.com/features/workspaces) for more details.
That said, even though Yarn is smart enough to make everything running smoothly, it is encouraged to use the same package version accross all projects.

To require some internal dependency, simply add it with the `@leav` prefix.

#### Global dependencies
To add a package that will be available for all projects:

```yarn add <my_package>```


#### Per project dependency
To add a package available for only one project:

```yarn workspace <my_project_name> add <my_package_name>```

or, go to project folder and add package:

```cd apps/<project_name> && yarn add <my_package_name>```

### Installing dependencies
To install all deps for all projects, just run `yarn install` at the root of the repo.
To install deps for one project only, just go its folder and then run `yarn install`.

## Shared libs
If you want to create a shared lib available for all projects, create a new folder in the `libs` folder. The `name` declared in `package.json` must be prefixed with `@leav` so that Yarn will be aware of it.

IMPORTANT: a shared lib has to be built in order to be used by other project. So, when your lib is ready:
- Run `yarn build`
- **commit the `dist` folder**
- In `package.json` the `main` file must be in the `dist` folder.

Don't forget to enable definition files in `tsconfig.json` to offer a smooth Typescript experience to other devs using your lib ;)

To use it in a project, just add it with a `yarn add @leav/my_lib`.
Then, in your code, you can import it and use it like a regular package:
```
import {mySuperFunc} from '@leav/my_lib'

mySuperFunc();
```

## Getting started
## Running with docker-compose

- Clone this repo
```type=sh
git clone git@github.com:leav-solutions/leav-engine.git # clone repo
cd leav-engine/docker # Go to the docker folder in the repo
docker-compose up -d # Run all services
```

---

## Accessing UIs

A few URLs are handled by the proxy (Traefik) to manage and access your app:

-   http://admin.leav.localhost: Admin app
-   http://arango.leav.localhost: Arango DB admin
-   http://core.leav.localhost/graphql: GraphQL playground
-   http://rabbitmq.leav.localhost: RabbitMQ admin
-   http://data-studio.leav.localhost/: Data Studio app

You might need to add it to your `/etc/hosts` file to access it:

```
127.0.0.1 admin.leav.localhost
127.0.0.1 core.leav.localhost
127.0.0.1 arango.leav.localhost
127.0.0.1 rabbitmq.leav.localhost
127.0.0.1 data-studio.leav.localhost
```

---

## Database

The database will be created automatically when initializing the server.

By default, it's called `leav_core` and can be managed at http://arango.leav.localhost/_db/leav_core/_admin/aardvark/index.html#collections

Default username is `root` with no password.

### ArangoDb Upgrade:
After an upgrade, ArangoDB might not start, saying it requires a db upgrade. Run this command to fix this:
```
docker-compose run arangodb arangod --database.auto-upgrade
```


---

## Accessing containers

You can get into containers with a shell:

```bash
docker-compose exec <service_name> /bin/sh
```

---

## Running tests

### Unit tests

Though you can run unit testing inside the container, it might not be very convenient and resource consuming.
You'd better run it locally, on your machine with a standard `npm run test`.

### E2E tests

End-to-end testing needs to be ran inside the container as it starts a server, access to the DB, etc.
This can be done by either:

-   Running a shell in the container and executing `npm run test:e2e`
-   Executing the command from your machine: `docker exec -i docker-compose_leav_core_1 npm run test:e2e`

---

## Logs

All services logs out to stdout and stderr. Use `docker-compose logs` if you need to read it:

```bash
docker-compose logs -ft <service_name>
```

More infos: https://docs.docker.com/compose/reference/logs/

---

## Applications
### Adding new modules
When creating a new application, the core will be looking in the `apps/core/applications/modules` folder to check available modules.
Name, description and version will be retrieved from `package.json`.

If you want to add your own module, just drop your folder right there.

### Installation
On application creation, the core will check for a script called `app_install.sh` . It must be present at the root of your module.

This script will be executed first on creation and on demand afterwards. Make sure running the script multiple times will not cause any errors or damages.

**This script is responsible for doing everything it takes to have an instance ready to run (eg. building JS files)** and **copying required files in the instance folder**. When accessing the application, the core will serve the `index.html` file of this app folder.

A few environment variables are available in the script with all settings required to build the app:

- `LEAV_API_URL`: full URL of the GraphQL API (eg: https://your-domain.com/graphql)
- `LEAV_DEFAULT_LANG`: default language, configured in core configuration
- `LEAV_AVAILABLE_LANG`: available languages, configured in core configuration
- `LEAV_LOGIN_ENDPOINT`: global login endpoint
- `LEAV_APP_ENDPOINT`: app endpoint
- `LEAV_APPLICATION_ID`: app ID
- `LEAV_DEST_FOLDER`: destination folder. All files needed to run the instance must land here.

### Uninstallation
Before deleting an application, the core will check for a script called `app_uninstall.sh`.
It must be present at the root of your module.
This script is responsible for cleaning up everything it needs before the core deletes the instance folder.
**This script is optional**.

A few environment variables are available in the script:
- `LEAV_APPLICATION_ID`: Application ID
- `LEAV_DEST_FOLDER`: instance folder


---

Have fun!