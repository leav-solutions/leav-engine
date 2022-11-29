# LEAV Engine - App root path

Module to load project configuration.
It first tries to read the APP_ROOT_PATH env variable. If not supplied, try to determine app location using https://github.com/inxilpro/node-app-root-path.

## Usage

```javascript
import {appRootPath} from '@leav/app-root-path'

const rootPath =  appRootPath();
```
