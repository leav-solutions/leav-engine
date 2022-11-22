// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined} from '@ant-design/icons';
import {extractArgsFromString} from '@leav/utils';
import {message, Upload} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import * as XLSX from 'xlsx';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeType, ImportMode, ImportType} from '_gqlTypes/globalTypes';
import {ImportReducerActionTypes} from '../importReducer/importReducer';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';
import {ISheet} from '../_types';

interface IImportModalSelectFileStepsProps {
    onGetAttributes: (library: string) => Promise<GET_ATTRIBUTES_BY_LIB_attributes_list[]>;
}

const defaultType = ImportType.STANDARD;
const defaultMode = ImportMode.upsert;

function ImportModalSelectFileStep({onGetAttributes}: IImportModalSelectFileStepsProps): JSX.Element {
    const {t} = useTranslation();

    const {state, dispatch} = useImportReducerContext();
    const {file} = state;

    const _setFileData = async content => {
        const workbook = XLSX.read(content, {type: 'binary'});

        const s: ISheet[] = [];

        for (const sheetName in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheetName)) {
                // Use the sheet_to_json method to convert excel to json data
                const sheetData: Array<{[col: string]: string}> = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                    blankrows: false,
                    defval: null
                });

                // if sheet is empty we skip it
                if (!sheetData.length) {
                    continue;
                }

                // get columns' name
                const sheetColumns = Object.keys(sheetData[0]);

                // match only first line cells (A1, B1, etc.)
                const firstRowAddresses = Object.keys(workbook.Sheets[sheetName]).filter(
                    k => !!k.match(/\b[A-Z]+1\b/g)
                );
                const isMapped = !!workbook.Sheets[sheetName][firstRowAddresses[0]].c;

                // Mapping is present.
                if (isMapped) {
                    const comments: string[] = [];

                    for (const address of firstRowAddresses) {
                        // get first line comments and delete "\n" characters
                        comments.push(workbook.Sheets[sheetName][address].c?.[0]?.t?.replace(/\n/g, ' ') || null);
                    }

                    const params = extractArgsFromString(comments[0]);

                    const sType = params.type ?? defaultType;
                    const sLibrary = params.library;
                    const sLinkAttribute = params.linkAttribute;
                    const sMode = params.mode ?? defaultMode;
                    let sMapping = [];
                    const sTreeLinkLibrary = params.treeLinkLibrary;
                    let sKeyColumnIndex: number;
                    let sKeyToColumnIndex: number;

                    let sKeyToAttributes: GET_ATTRIBUTES_BY_LIB_attributes_list[] = [];

                    const attributes = await onGetAttributes(sLibrary);

                    // Extract mapping, keyIndex and keyToIndex from all columns comments
                    for (const [index, comm] of comments.entries()) {
                        const commArgs = extractArgsFromString(comm);
                        sMapping.push(String(commArgs.id) ?? null);

                        if (commArgs.key) {
                            sKeyColumnIndex = index;
                        }

                        if (commArgs.keyTo) {
                            sKeyToColumnIndex = index;
                        }
                    }

                    const linkAttributeProps =
                        sKeyToColumnIndex && sLinkAttribute
                            ? (attributes.find(
                                  a => a.id === sLinkAttribute
                              ) as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                            : null;

                    if (linkAttributeProps && (linkAttributeProps.type !== AttributeType.tree || sTreeLinkLibrary)) {
                        const keyToLibrary =
                            linkAttributeProps.type === AttributeType.tree
                                ? sTreeLinkLibrary
                                : linkAttributeProps?.linked_library?.id;
                        sKeyToAttributes = await onGetAttributes(keyToLibrary);
                    }

                    // Check if all mapping attributes actually exist
                    sMapping = sMapping.map((mappingAttribute, index) => {
                        const attributesToCheck = index === sKeyToColumnIndex ? sKeyToAttributes : attributes;
                        return attributesToCheck.find(attribute => attribute.id === mappingAttribute)
                            ? mappingAttribute
                            : null;
                    });

                    s.push({
                        name: sheetName,
                        attributes,
                        columns: sheetColumns,
                        type: ImportType[sType],
                        mode: ImportMode[sMode],
                        library: sLibrary,
                        linkAttribute: sLinkAttribute,
                        linkAttributeProps,
                        keyColumnIndex: sKeyColumnIndex,
                        keyToColumnIndex: sKeyToColumnIndex,
                        keyToAttributes: sKeyToAttributes,
                        treeLinkLibrary: sTreeLinkLibrary,
                        data: sheetData.length ? sheetData : null,
                        mapping: sMapping
                    });
                } else {
                    const sLibrary = state.defaultLibrary;
                    const attributes = await onGetAttributes(sLibrary);

                    s.push({
                        name: sheetName,
                        library: sLibrary,
                        columns: sheetColumns,
                        type: defaultType,
                        mode: defaultMode,
                        attributes,
                        mapping: [],
                        data: sheetData.length ? sheetData : null
                    });
                }
            }
        }

        if (!s.length || s.every(sheet => sheet.data === null)) {
            message.error(t('import.empty_file'));
            return false;
        }

        dispatch({type: ImportReducerActionTypes.SET_SHEETS, sheets: s});

        return true;
    };

    const draggerProps = {
        name: 'file',
        multiple: false,
        accept: '.xlsx',
        showUploadList: false,
        beforeUpload: fileToImport => {
            // Read file to read mapping and display a preview on next step
            const reader = new FileReader();
            reader.readAsBinaryString(fileToImport);

            reader.onload = async e => {
                const res = await _setFileData(reader.result);
                if (res) {
                    dispatch({type: ImportReducerActionTypes.SET_FILE, file: fileToImport});
                }
                dispatch({type: ImportReducerActionTypes.SET_OK_BTN, okBtn: res});
            };

            // Prevent default upload. We'll handle it ourselves later on
            return false;
        }
    };

    return (
        <Upload.Dragger {...draggerProps}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">{file?.name || t('import.file_selection_instruction')}</p>
        </Upload.Dragger>
    );
}

export default ImportModalSelectFileStep;
