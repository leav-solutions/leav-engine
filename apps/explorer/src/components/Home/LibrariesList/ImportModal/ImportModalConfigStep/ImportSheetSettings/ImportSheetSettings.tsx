// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Form, Select, Space} from 'antd';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute
} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {AttributeType, ImportMode, ImportType} from '_gqlTypes/globalTypes';
import {useImportReducerContext} from '../../importReducer/ImportReducerContext';

interface IImportSettingsProps {
    sheetIndex: number;
    libraries: GET_LIBRARIES_LIST_libraries_list[];
    onLibrarySelect: (sheetIndex: number, library: string) => void;
    onImportTypeSelect: (sheetIndex: number, type: ImportType) => void;
    onImportModeSelect: (sheetIndex: number, mode: ImportMode) => void;
    onLinkAttributeSelect: (sheetIndex: number, attribute: string) => void;
    onTreeLinkLibrarySelect: (sheetIndex: number, library: string) => void;
}

const isLinkAttribute = (attribute: GET_ATTRIBUTES_BY_LIB_attributes_list): boolean =>
    attribute.type === AttributeType.simple_link ||
    attribute.type === AttributeType.advanced_link ||
    attribute.type === AttributeType.tree;

const SettingsWrapper = styled(Space)`
    && .ant-form-item-label {
        padding: 0;
        font-weight: bold;
    }
`;

function ImportSheetSettings({
    sheetIndex,
    libraries,
    onLibrarySelect,
    onImportTypeSelect,
    onImportModeSelect,
    onLinkAttributeSelect,
    onTreeLinkLibrarySelect
}: IImportSettingsProps): JSX.Element {
    const [{lang}] = useLang();
    const {t} = useTranslation();
    const {state} = useImportReducerContext();
    const sheet = state.sheets[sheetIndex];
    const isSheetIgnored = sheet.type === ImportType.IGNORE;

    const selectTreeLinkLibraryOptions =
        sheet.type === ImportType.LINK && sheet.linkAttributeProps?.type === AttributeType.tree
            ? (
                  (sheet.linkAttributeProps as GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute)?.linked_tree
                      ?.libraries ?? []
              ).map(treeLib => ({
                  key: treeLib.library.id,
                  value: treeLib.library.id,
                  label: localizedTranslation(treeLib.library.label, lang)
              }))
            : null;

    return (
        <Form layout="vertical">
            <SettingsWrapper direction="horizontal" size="middle" wrap>
                <Form.Item label={t('import.type')} required>
                    <Select
                        style={{minWidth: 200}}
                        defaultValue={sheet.type}
                        placeholder={t('import.select_type')}
                        onChange={value => onImportTypeSelect(sheetIndex, value)}
                    >
                        {Object.values(ImportType).map(type => (
                            <Select.Option key={type} value={type}>
                                {t(`import.types.${type}`)}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                {!isSheetIgnored && (
                    <>
                        <Form.Item label={t('import.mode')} required>
                            <Select
                                style={{minWidth: 240}}
                                defaultValue={sheet.mode}
                                placeholder={t('import.select_mode')}
                                onChange={value => onImportModeSelect(sheetIndex, value)}
                            >
                                {Object.values(ImportMode).map(mode => (
                                    <Select.Option key={mode} value={mode}>
                                        {t(`import.modes.${mode}`)}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label={t('import.library')} required>
                            <Select
                                style={{minWidth: 200}}
                                defaultValue={sheet.library ?? state.defaultLibrary}
                                placeholder={t('import.select_library')}
                                onChange={value => onLibrarySelect(sheetIndex, value)}
                            >
                                {libraries.map(l => (
                                    <Select.Option value={l.id} key={l.id}>
                                        {localizedTranslation(l.label, lang) || l.id}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {sheet.type === ImportType.LINK && sheet.library && (
                            <Form.Item label={t('import.link_attribute')} required>
                                <Select
                                    style={{minWidth: 200}}
                                    defaultValue={sheet.linkAttribute}
                                    value={sheet.linkAttribute}
                                    placeholder={t('import.select_link_attribute')}
                                    onChange={value => onLinkAttributeSelect(sheetIndex, value)}
                                >
                                    {sheet.attributes.filter(isLinkAttribute).map(a => (
                                        <Select.Option key={a.id} value={a.id}>
                                            {localizedTranslation(a.label, lang) || a.id}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                        {sheet.type === ImportType.LINK && sheet.linkAttributeProps?.type === AttributeType.tree && (
                            <Form.Item label={t('import.tree_link_library')} required>
                                <Select
                                    style={{minWidth: 200}}
                                    value={sheet.treeLinkLibrary}
                                    placeholder={t('import.select_library')}
                                    onChange={value => onTreeLinkLibrarySelect(sheetIndex, value)}
                                    options={selectTreeLinkLibraryOptions}
                                />
                            </Form.Item>
                        )}
                    </>
                )}
            </SettingsWrapper>
        </Form>
    );
}

export default ImportSheetSettings;
