import {jpgFiles, psdFiles, pngFiles} from './getFiles';
import {getConfig} from '../getConfig/getConfig';

const configPath = process.argv[2] || './config/config.json';

const config = getConfig(configPath);

jpgFiles(config);
psdFiles(config);
pngFiles(config);
