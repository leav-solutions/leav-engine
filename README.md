# LEAV Engine
This is the monorepo for LEAV Engine. It contains all projects related to LEAV Engine, including the core, the automate and the front for admin and explorer.
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
