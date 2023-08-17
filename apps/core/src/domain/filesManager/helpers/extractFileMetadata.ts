// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exiftool, Tags} from 'exiftool-vendored';
import path from 'node:path';
import {PopplerDocument} from 'poppler-simple';
import {IConfig} from '_types/config';
import {FilesAttributes, IFileMetadata} from '../../../_types/filesManager';
import {getRootPathByKey} from './getRootPathByKey';

interface IAllTags extends Tags {
    ClippingPathName?: string;
    ViewBox?: string;
}

export const extractFileMetadata = async (
    filePath: string,
    rootKey: string,
    config: IConfig
): Promise<IFileMetadata> => {
    let fileData: IFileMetadata = {};
    const rootPath = getRootPathByKey(rootKey, config);
    const fullPath = path.join(rootPath, filePath);
    const exifData = await exiftool.read<IAllTags>(fullPath, ['-FileSize#']);

    const rawMimeType = exifData.MIMEType;
    const splittedMimeType = exifData.MIMEType.split('/');
    const resolution = exifData.XResolution;
    const width = Number(exifData.ImageWidth ?? exifData.ExifImageWidth);
    const height = Number(exifData.ImageHeight ?? exifData.ExifImageHeight);
    const printWidth = resolution && width ? (25.4 * width) / resolution : null;
    const printHeight = resolution && width ? (25.4 * height) / resolution : null;
    fileData = {
        [FilesAttributes.WIDTH]: width,
        [FilesAttributes.HEIGHT]: height,
        [FilesAttributes.MIME_TYPE1]: splittedMimeType[0],
        [FilesAttributes.MIME_TYPE2]: splittedMimeType[1],
        [FilesAttributes.COLOR_SPACE]: exifData.ColorMode ?? exifData.ColorSpace,
        [FilesAttributes.FILE_SIZE]: exifData.FileSize,
        [FilesAttributes.HAS_CLIPPING_PATH]: !!exifData.ClippingPathName,
        [FilesAttributes.COLOR_PROFILE]: exifData.ICCProfileName,
        [FilesAttributes.RESOLUTION]: resolution,
        [FilesAttributes.PRINT_WIDTH]: printWidth,
        [FilesAttributes.PRINT_HEIGHT]: printHeight
    };

    if (rawMimeType === 'application/pdf') {
        const pdf = new PopplerDocument(fullPath);
        const page = pdf.getPage(1);
        const pdfResolution = 72;
        const pdfWidth = Number(page.width);
        const pdfHeight = Number(page.height);
        fileData[FilesAttributes.PRINT_WIDTH] = pdfWidth ? (25.4 * pdfWidth) / pdfResolution : null; // In mm
        fileData[FilesAttributes.PRINT_HEIGHT] = pdfHeight ? (25.4 * pdfHeight) / pdfResolution : null; // In mm
    }

    return fileData;
};
