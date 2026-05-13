import * as rootPath from 'app-root-path';
import path from 'path';

export const appRootPath = (): string => path.resolve(process.env.APP_ROOT_PATH ?? rootPath.path);
