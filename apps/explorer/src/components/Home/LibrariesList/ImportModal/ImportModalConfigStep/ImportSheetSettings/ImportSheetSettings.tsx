// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Select, Space, Typography} from 'antd';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
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
}

const isLinkAttribute = (attribute: GET_ATTRIBUTES_BY_LIB_attributes_list): boolean =>
    attribute.type === AttributeType.simple_link ||
    attribute.type === AttributeType.advanced_link ||
    attribute.type === AttributeType.tree;

function ImportSheetSettings({
    sheetIndex,
    libraries,
    onLibrarySelect,
    onImportTypeSelect,
    onImportModeSelect,
    onLinkAttributeSelect
}: IImportSettingsProps): JSX.Element {
    const [{lang}] = useLang();
    const {t} = useTranslation();
    const {state, dispatch} = useImportReducerContext();
    const sheet = state.sheets[sheetIndex];

    return (
        <Space direction="horizontal" align="baseline">
            <Typography.Title level={5}>{t('import.type')}</Typography.Title>
            <Select
                style={{width: 160}}
                defaultValue={sheet.type}
                placeholder={t('import.select_type')}
                onChange={value => onImportTypeSelect(sheetIndex, value)}
            >
                <Select.Option value={ImportType.STANDARD}>{t('import.types.standard')}</Select.Option>
                <Select.Option value={ImportType.LINK}>{t('import.types.link')}</Select.Option>
            </Select>
            <Typography.Title level={5}>{t('import.mode')}</Typography.Title>
            <Select
                style={{width: 160}}
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
            <Typography.Title level={5}>{t('import.library')}</Typography.Title>
            <Select
                style={{width: 160}}
                defaultValue={sheet.library}
                placeholder={t('import.select_library')}
                onChange={value => onLibrarySelect(sheetIndex, value)}
            >
                {libraries.map(l => (
                    <Select.Option value={l.id} key={l.id}>
                        {localizedTranslation(l.label, lang) || l.id}
                    </Select.Option>
                ))}
            </Select>
            {sheet.type === ImportType.LINK && sheet.library && (
                <>
                    <Typography.Title level={5}>{t('import.link_attribute')}</Typography.Title>
                    <Select
                        style={{width: 160}}
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
                </>
            )}
        </Space>
    );
}

export default ImportSheetSettings;
