import {IConfig} from '../types';
import {startBench} from './startBench';

export const pngFiles = (config: IConfig) => {
    const jsonFile = './src/files/png_files.json';
    const dest = '/data/images_generate/';
    startBench(jsonFile, dest, config);
};

export const psdFiles = (config: IConfig) => {
    const jsonFile = './src/files/psd_files.json';
    const dest = '/data/images_generate/';
    startBench(jsonFile, dest, config);
};

export const jpgFiles = (config: IConfig) => {
    const jsonFile = './src/files/jpg_files.json';
    const dest = '/data/images_generate/';

    startBench(jsonFile, dest, config);
};
