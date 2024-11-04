// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {extractArgsFromString} from '@leav/utils';
import {message, Space, Spin} from 'antd';
import {KitAlert, KitUpload, useKitNotification} from 'aristid-ds';
import {IKitDragger} from 'aristid-ds/dist/Kit/DataEntry/Upload/types';
import {useState} from 'react';
import {read as xlsxRead, utils as xlsxUtils} from 'xlsx';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    AttributesByLibAttributeFragment,
    AttributesByLibAttributeLinkAttributeFragment,
    AttributeType,
    ImportMode,
    ImportType
} from '_ui/_gqlTypes';
import {ImportReducerActionTypes} from '../importReducer/importReducer';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';
import {ISheet} from '../_types';

interface IImportModalSelectFileStepsProps {
    onGetAttributes: (library: string) => Promise<AttributesByLibAttributeFragment[]>;
}

const defaultType = ImportType.STANDARD;
const defaultMode = ImportMode.upsert;

function ImportModalSelectFileStep({onGetAttributes}: IImportModalSelectFileStepsProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {kitNotification} = useKitNotification();

    const {state, dispatch} = useImportReducerContext();
    const {file} = state;

    const _setFileData = async content => {
        const workbook = xlsxRead(content, {type: 'binary'});

        const s: ISheet[] = [];

        for (const sheetName in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheetName)) {
                // Use the sheet_to_json method to convert excel to json data
                const sheetData: Array<{[col: string]: string}> = xlsxUtils.sheet_to_json(workbook.Sheets[sheetName], {
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

                const isMapped = !!workbook.Sheets[sheetName][firstRowAddresses[0]]?.c;

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

                    let sKeyToAttributes: AttributesByLibAttributeFragment[] = [];

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
                              ) as AttributesByLibAttributeLinkAttributeFragment)
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

    const [loading, setLoading] = useState(false);

    const draggerProps: IKitDragger = {
        name: 'file',
        multiple: false,
        accept: '.xlsx',
        showUploadList: false,
        description: t('import.file_selection_restriction', {allowedFormat: '.xlsx'}),
        title: file?.name ?? t('import.file_selection_instruction'),
        beforeUpload: fileToImport => {
            // Read file to read mapping and display a preview on next step
            const reader = new FileReader();
            reader.readAsBinaryString(fileToImport);

            reader.onload = async e => {
                try {
                    const res = await _setFileData(reader.result);

                    if (res) {
                        dispatch({type: ImportReducerActionTypes.SET_FILE, file: fileToImport});
                    }
                    dispatch({type: ImportReducerActionTypes.SET_OK_BTN, okBtn: res});
                } catch (error) {
                    const errorMessage = error?.message ?? t('error.error_occurred');
                    kitNotification.error({
                        message: t('error.error_occurred'),
                        description: errorMessage
                    });
                }
            };

            reader.onloadstart = e => {
                setLoading(true);
            };

            reader.onloadend = e => {
                setLoading(false);
            };

            reader.onerror = e => {
                kitNotification.error({
                    message: t('error.error_occurred'),
                    description: reader.error?.message ?? ''
                });
            };

            // Prevent default upload. We'll handle it ourselves later on
            return false;
        }
    };

    return (
        <Space direction="vertical" style={{width: '100%'}}>
            <Spin spinning={loading}>
                <KitUpload.KitDragger {...draggerProps} />
            </Spin>
            <KitAlert message={t('import.first_line_info')} type="info" showIcon />
        </Space>
    );
}

export default ImportModalSelectFileStep;
