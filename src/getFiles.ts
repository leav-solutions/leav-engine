import {bench} from './generate';

export const pngFiles = () => {
    const jsonFile = './src/files/png_files.json';
    const dest = '/data/images_generate/';
    bench(jsonFile, dest);
};

export const psdFiles = () => {
    const jsonFile = './src/files/psd_files.json';
    const dest = '/data/images_generate/';
    bench(jsonFile, dest);
};

export const jpgFiles = () => {
    const jsonFile = './src/files/jpg_files.json';
    const dest = '/data/images_generate/';

    bench(jsonFile, dest);
};
