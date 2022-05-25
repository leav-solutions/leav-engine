// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KeyOutlined, LinkOutlined, WarningOutlined} from '@ant-design/icons';
import {localizedTranslation} from '@leav/utils';
import {Select, Space, Table, Tabs, Typography} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import themingVar from 'themingVar';
import {
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute
} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {AttributeType, ImportMode, ImportType} from '_gqlTypes/globalTypes';
import {ImportReducerActionTypes} from '../importReducer/importReducer';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';
import {ISheet} from '../_types';
import ImportKeysSelector from './ImportKeysSelector';
import ImportMappingRowTitle from './ImportMappingRowTitle';
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
            linkAttribute: null,
            keyToAttributes: null
        });
    };

    const _handleImportTypeSelect = (sheetIndex: number, type: ImportType) => {
        _changeSheetProperty(sheetIndex, {
            type,
            linkAttribute: null,
            keyToAttributes: null
        });
    };

    const _handleImportModeSelect = (sheetIndex: number, mode: ImportMode) => {
        _changeSheetProperty(sheetIndex, {mode});
    };

    const _handleLinkAttributeSelect = async (sheetIndex: number, linkAttribute: string) => {
        const sheet = sheets[sheetIndex];
        const linkAttributeProps = sheet.attributes.find(a => a.id === linkAttribute) as
            | GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute
            | GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute;

        const library =
            linkAttributeProps.type === AttributeType.tree
                ? sheet.treeLinkLibrary
                : (linkAttributeProps as GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute)?.linked_library?.id;

        let keyToAttributes = [];
        if (library) {
            keyToAttributes = await onGetAttributes(library);
        }

        const mapping = sheet.mapping;

        _changeSheetProperty(sheetIndex, {
            linkAttribute,
            linkAttributeProps,
            mapping,
            keyToAttributes,
            treeLinkLibrary:
                linkAttributeProps.type === AttributeType.tree
                    ? (linkAttributeProps as GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute).linked_tree.libraries
                          .map(l => l.library.id)
                          .includes(sheet.treeLinkLibrary)
                        ? sheet.treeLinkLibrary
                        : null
                    : null
        });
    };

    const _handleMappingSelect = (sheetIndex: number, mappingIndex: number, attributeId: string | null) => {
        const sheet = sheets[sheetIndex];
        const mapping = sheet.mapping;
        mapping[mappingIndex] = attributeId;

        _changeSheetProperty(sheetIndex, {
            mapping
        });
    };

    const _handleTreeLinkLibrarySelect = async (sheetIndex: number, treeLinkLibrary: string) => {
        const keyToAttributes = treeLinkLibrary ? await onGetAttributes(treeLinkLibrary) : null;
        _changeSheetProperty(sheetIndex, {treeLinkLibrary, keyToAttributes});
    };

    return (
        <Tabs type="card">
            {sheets.map((sheet, sheetIndex) => {
                const isSheetIgnored = sheet.type === ImportType.IGNORE;
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
                        __root: <ImportMappingRowTitle sheet={sheet} />,
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

                const tabTitle = (
                    <Space>
                        {sheet.name}
                        {!!state.settingsError[sheet.name] && (
                            <WarningOutlined style={{color: themingVar['@error-color']}} />
                        )}
                    </Space>
                );
                return (
                    <Tabs.TabPane tab={tabTitle} key={sheetIndex}>
                        <Space direction="vertical" align="start">
                            <ImportSheetSettings
                                sheetIndex={sheetIndex}
                                libraries={libraries}
                                onLibrarySelect={_handleLibrarySelect}
                                onImportTypeSelect={_handleImportTypeSelect}
                                onImportModeSelect={_handleImportModeSelect}
                                onLinkAttributeSelect={_handleLinkAttributeSelect}
                                onTreeLinkLibrarySelect={_handleTreeLinkLibrarySelect}
                            />
                            {!isSheetIgnored && (
                                <Table
                                    title={() => (
                                        <Typography.Title level={5}>{t('import.data_overview')}</Typography.Title>
                                    )}
                                    tableLayout={'fixed'}
                                    columns={sheetColumns}
                                    dataSource={sheetData}
                                    size="small"
                                    pagination={{hideOnSinglePage: true}}
                                />
                            )}
                        </Space>
                    </Tabs.TabPane>
                );
            })}
        </Tabs>
    );
}

export default ImportModalConfigStep;
