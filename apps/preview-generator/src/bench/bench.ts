// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getConfig} from '../getConfig/getConfig';
import {jpgFiles, pngFiles, psdFiles} from './getFiles';

(async () => {
    const config = await getConfig();

    jpgFiles(config);
    psdFiles(config);
    pngFiles(config);
})();
