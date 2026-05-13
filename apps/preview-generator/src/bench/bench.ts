import {getConfig} from '../getConfig/getConfig';
import {jpgFiles, pngFiles, psdFiles} from './getFiles';

(async () => {
    const config = await getConfig();

    jpgFiles(config);
    psdFiles(config);
    pngFiles(config);
})();
