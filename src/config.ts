import * as rootPath from 'app-root-path';
import * as path from 'path';
import {env} from './env';

export default import(path.resolve(path.join(rootPath.path, `/config/${env}`)));
