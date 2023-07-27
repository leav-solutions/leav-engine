// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FilesAttributes, IFileMetadata} from '../../_types/filesManager';

export const mockFileMetadataRaw = {
    MIMEType: 'image/jpeg',
    XResolution: 72,
    ImageWidth: 1337,
    ExifImageWidth: 1337,
    ImageHeight: 1337,
    ExifImageHeight: 1337,
    ColorMode: 'sRGB',
    ColorSpace: 'sRGB',
    FileSize: 421377,
    ClippingPathName: 'My Path',
    ICCProfileName: 'Some Profile'
};

export const mockFileMetadata: IFileMetadata = {
    [FilesAttributes.MIME_TYPE1]: 'image',
    [FilesAttributes.MIME_TYPE2]: 'jpeg',
    [FilesAttributes.RESOLUTION]: 72,
    [FilesAttributes.WIDTH]: 1337,
    [FilesAttributes.HEIGHT]: 1337,
    [FilesAttributes.PRINT_WIDTH]: 471.66388888888883,
    [FilesAttributes.PRINT_HEIGHT]: 471.66388888888883,
    [FilesAttributes.COLOR_SPACE]: 'sRGB',
    [FilesAttributes.FILE_SIZE]: 421377,
    [FilesAttributes.HAS_CLIPPING_PATH]: true,
    [FilesAttributes.COLOR_PROFILE]: 'Some Profile'
};

export const mockFileMetadataPdfRaw = {
    MIMEType: 'application/pdf',
    XResolution: 72,
    ImageWidth: null,
    ExifImageWidth: null,
    ImageHeight: null,
    ExifImageHeight: null,
    ColorMode: null,
    ColorSpace: null,
    FileSize: 421377,
    ClippingPathName: 'My Path',
    ICCProfileName: null
};

export const mockFileMetadataPdf: IFileMetadata = {
    [FilesAttributes.MIME_TYPE1]: 'application',
    [FilesAttributes.MIME_TYPE2]: 'pdf',
    [FilesAttributes.RESOLUTION]: 72,
    [FilesAttributes.WIDTH]: null,
    [FilesAttributes.HEIGHT]: null,
    [FilesAttributes.PRINT_WIDTH]: 210,
    [FilesAttributes.PRINT_HEIGHT]: 297,
    [FilesAttributes.COLOR_SPACE]: null,
    [FilesAttributes.FILE_SIZE]: 421377,
    [FilesAttributes.HAS_CLIPPING_PATH]: true,
    [FilesAttributes.COLOR_PROFILE]: null
};
