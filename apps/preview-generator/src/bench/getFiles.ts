// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '../types/types';
import {startBench} from './startBench';

export const pngFiles = (config: IConfig) => {
    const jsonFile = './src/files/png_files.json';
    const dest = '/data/generate/';
    startBench(jsonFile, dest, config);
};

export const psdFiles = (config: IConfig) => {
    const jsonFile = './src/files/psd_files.json';
    const dest = '/data/generate/';
    startBench(jsonFile, dest, config);
};

export const jpgFiles = (config: IConfig) => {
    const jsonFile = './src/files/jpg_files.json';
    const dest = '/data/generate/';

    startBench(jsonFile, dest, config);
};
