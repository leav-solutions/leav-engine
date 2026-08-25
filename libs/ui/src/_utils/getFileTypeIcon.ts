import {type IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {
    faFile,
    faFileExcel,
    faFileImage,
    faFilePdf,
    faFilePowerpoint,
    faFileWord,
} from '@fortawesome/free-solid-svg-icons';
import {FileType, getFileType} from '@leav/utils';

const ICON_BY_EXTENSION: Record<string, IconDefinition> = {
    pdf: faFilePdf,
    doc: faFileWord,
    docx: faFileWord,
    odt: faFileWord,
    rtf: faFileWord,
    xls: faFileExcel,
    xlsx: faFileExcel,
    ods: faFileExcel,
    csv: faFileExcel,
    ppt: faFilePowerpoint,
    pptx: faFilePowerpoint,
    odp: faFilePowerpoint,
};

export const getFileTypeIcon = (fileName: string): IconDefinition => {
    const extension = fileName?.slice(fileName.lastIndexOf('.') + 1).toLowerCase();

    return ICON_BY_EXTENSION[extension] ?? (getFileType(fileName) === FileType.IMAGE ? faFileImage : faFile);
};
