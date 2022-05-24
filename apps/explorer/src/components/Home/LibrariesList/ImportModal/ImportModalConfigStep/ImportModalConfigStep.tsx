// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KeyOutlined, LinkOutlined} from '@ant-design/icons';
import {localizedTranslation} from '@leav/utils';
import {Select, Space, Table, Tabs, Typography} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import themingVar from 'themingVar';
import {
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute
} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {AttributeType, ImportMode, ImportType} from '_gqlTypes/globalTypes';
import {ImportReducerActionTypes} from '../importReducer/importReducer';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';
import {ISheet} from '../_types';
import ImportKeysSelector from './ImportKeysSelector';
import ImportSheetSettings from './ImportSheetSettings';

interface IImportModalConfigStepProps {
    libraries: GET_LIBRARIES_LIST_libraries_list[];
    onGetAttributes: (library: string) => Promise<GET_ATTRIBUTES_BY_LIB_attributes_list[]>;
}

enum KeysValues {
    IMPORT = 'import_key',
    LINK = 'link_key'
}

function ImportModalConfigStep({libraries, onGetAttributes}: IImportModalConfigStepProps): JSX.Element {
    const [{lang}] = useLang();
    const {t} = useTranslation();
    const {state, dispatch} = useImportReducerContext();
    const {sheets} = state;

    const _changeSheetProperty = (sheetIndex: number, values: Partial<ISheet>) => {
        sheets[sheetIndex] = {...sheets[sheetIndex], ...values};
        dispatch({type: ImportReducerActionTypes.SET_SHEETS, sheets: [...sheets]});
    };

    const _handleLibrarySelect = async (sheetIndex: number, lib: string) => {
        const attrs = await onGetAttributes(lib);

        _changeSheetProperty(sheetIndex, {
            library: lib,
            attributes: attrs,
            mapping: [],
            key: null,
            linkAttribute: null,
            keyTo: null,
            keyToAttributes: null
        });
    };

    const _handleImportTypeSelect = (sheetIndex: number, type: ImportType) => {
        _changeSheetProperty(sheetIndex, {
            type,
            linkAttribute: null,
            keyTo: null,
            keyToAttributes: null
        });
    };

    const _handleImportModeSelect = (sheetIndex: number, mode: ImportMode) => {
        _changeSheetProperty(sheetIndex, {mode});
    };

    const _handleLinkAttributeSelect = async (sheetIndex: number, linkAttribute: string) => {
        const linkAttributeProps = sheets[sheetIndex].attributes.find(
            a => a.id === linkAttribute
        ) as GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute;

        const library = linkAttributeProps.linked_library.id;
        const attrs = await onGetAttributes(library);

        const mapping = sheets[sheetIndex].mapping;

        _changeSheetProperty(sheetIndex, {
            linkAttribute,
            mapping,
            keyTo: null,
            keyToAttributes: attrs
        });
    };

    const _handleMappingSelect = (sheetIndex: number, mappingIndex: number, attributeId: string | null) => {
        const sheet = sheets[sheetIndex];
        const mapping = sheet.mapping;
        mapping[mappingIndex] = attributeId;

        const key = !!sheet.key && sheet.mapping.includes(sheet.key) ? sheet.key : null;

        const keyTo =
            mapping[mappingIndex] === sheet.keyTo || sheet.keyToColumnIndex === mappingIndex
                ? attributeId
                : sheet.keyTo;

        _changeSheetProperty(sheetIndex, {
            mapping,
            key,
            keyTo
        });
    };

    return (
        <Tabs type="card">
            {sheets.map((sheet, sheetIndex) => {
                const displayedRows = sheet.data.slice(0, 3);
                const _handleSelectKey = (columnIndex: number) => (keyType: 'key' | 'keyTo', value: boolean) => {
                    const newProps: Partial<ISheet> = {};
                    const colId = sheet.mapping[columnIndex];
                    const changedProp = keyType;
                    const otherPropToCheck = keyType === 'key' ? 'keyTo' : 'key';
                    const changedPropColumnIndex = keyType === 'key' ? 'keyColumnIndex' : 'keyToColumnIndex';
                    const otherPropToCheckColumnIndex = keyType === 'key' ? 'keyToColumnIndex' : 'keyColumnIndex';

                    newProps[changedProp] = value ? colId : null;
                    newProps[changedPropColumnIndex] = value ? columnIndex : null;

                    if (sheet[otherPropToCheckColumnIndex] === columnIndex) {
                        newProps[otherPropToCheck] = null;
                        newProps[otherPropToCheckColumnIndex] = null;
                    }

                    _changeSheetProperty(sheetIndex, newProps);
                };

                const _setStyleOnMappingRow = (_, rowIndex) => ({
                    style: {
                        verticalAlign: 'top',
                        background:
                            rowIndex === displayedRows.length // Set background color on last row (= mapping row)
                                ? themingVar['@leav-secondary-bg']
                                : themingVar['@table-bg']
                    }
                });

                const selectKeyOptions = [
                    {
                        value: KeysValues.IMPORT,
                        label: (
                            <>
                                <KeyOutlined /> {t('import.import_key')}
                            </>
                        )
                    }
                ];

                if (sheet.type === ImportType.LINK) {
                    selectKeyOptions.push({
                        value: KeysValues.LINK,
                        label: (
                            <>
                                <LinkOutlined /> {t('import.link_key')}
                            </>
                        )
                    });
                }

                const sheetColumns: ColumnsType<object> = Object.keys(sheet.data[0]).map((col, index) => ({
                    title: col,
                    dataIndex: col,
                    onCell: _setStyleOnMappingRow
                }));
                sheetColumns.unshift({
                    title: <></>,
                    dataIndex: '__root',
                    onCell: _setStyleOnMappingRow
                });

                const sheetData = displayedRows.map((row, index) => ({...row, key: index}));

                // Mapping row
                if (sheet.type && sheet.library && (sheet.type !== ImportType.LINK || sheet.linkAttribute)) {
                    const mappingRow = {
                        key: sheetData.length,
                        __root: t('import.mapping'),
                        ...Object.keys(sheet.data[0]).reduce((allCols, col, idx) => {
                            const attributeSelectOptions = (sheet.keyToColumnIndex === idx
                                ? sheet?.keyToAttributes ?? []
                                : (sheet?.attributes ?? []).filter(
                                      a => a?.type === AttributeType.simple || a?.type === AttributeType.advanced
                                  )
                            ).map(a => ({
                                value: a.id,
                                key: a.id,
                                label: localizedTranslation(a.label, lang) || a.id
                            }));

                            allCols[col] = (
                                <Space direction="vertical" style={{width: '100%'}}>
                                    <Select
                                        style={{width: '100%'}}
                                        placeholder={t('import.do_not_import')}
                                        value={sheet.mapping?.[idx]}
                                        allowClear
                                        onClear={() => _handleMappingSelect(sheetIndex, idx, null)}
                                        onSelect={id => _handleMappingSelect(sheetIndex, idx, id)}
                                        options={attributeSelectOptions}
                                    />
                                    <ImportKeysSelector
                                        sheet={sheet}
                                        columnIndex={idx}
                                        onChange={_handleSelectKey(idx)}
                                    />
                                </Space>
                            );

                            return allCols;
                        }, {})
                    };
                    sheetData.push(mappingRow);
                }

                return (
                    <Tabs.TabPane tab={sheet.name} key={sheetIndex}>
                        <Space direction="vertical" align="start">
                            <ImportSheetSettings
                                sheetIndex={sheetIndex}
                                libraries={libraries}
                                onLibrarySelect={_handleLibrarySelect}
                                onImportTypeSelect={_handleImportTypeSelect}
                                onImportModeSelect={_handleImportModeSelect}
                                onLinkAttributeSelect={_handleLinkAttributeSelect}
                            />
                            <Table
                                title={() => <Typography.Title level={5}>{t('import.data_overview')}</Typography.Title>}
                                tableLayout={'fixed'}
                                columns={sheetColumns}
                                dataSource={sheetData}
                                size="small"
                                pagination={{hideOnSinglePage: true}}
                            />
                        </Space>
                    </Tabs.TabPane>
                );
            })}
        </Tabs>
    );
}

export default ImportModalConfigStep;
