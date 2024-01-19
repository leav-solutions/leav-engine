// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Form, Space} from 'antd';
import {KitSelect} from 'aristid-ds';
import styled from 'styled-components';
import useLang from '_ui/hooks/useLang';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    AttributesByLibAttributeFragment,
    AttributesByLibAttributeTreeAttributeFragment,
    AttributeType,
    ImportMode,
    ImportType,
    LibraryLightFragment
} from '_ui/_gqlTypes';
import {useImportReducerContext} from '../../importReducer/ImportReducerContext';

interface IImportSettingsProps {
    sheetIndex: number;
    libraries: LibraryLightFragment[];
    onLibrarySelect: (sheetIndex: number, library: string) => void;
    onImportTypeSelect: (sheetIndex: number, type: ImportType) => void;
    onImportModeSelect: (sheetIndex: number, mode: ImportMode) => void;
    onLinkAttributeSelect: (sheetIndex: number, attribute: string) => void;
    onTreeLinkLibrarySelect: (sheetIndex: number, library: string) => void;
}

const isLinkAttribute = (attribute: AttributesByLibAttributeFragment): boolean =>
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
    const {lang} = useLang();
    const {t} = useSharedTranslation();
    const {state} = useImportReducerContext();
    const sheet = state.sheets[sheetIndex];
    const isSheetIgnored = sheet.type === ImportType.IGNORE;

    const selectTreeLinkLibraryOptions =
        sheet.type === ImportType.LINK && sheet.linkAttributeProps?.type === AttributeType.tree
            ? (
                  (sheet.linkAttributeProps as AttributesByLibAttributeTreeAttributeFragment)?.linked_tree?.libraries ??
                  []
              ).map(treeLib => ({
                  key: treeLib.library.id,
                  value: treeLib.library.id,
                  label: localizedTranslation(treeLib.library.label, lang)
              }))
            : null;

    const typeOptions = Object.values(ImportType).map(type => ({
        key: type,
        value: type,
        label: t(`import.types.${type}`)
    }));

    const modeOptions = Object.values(ImportMode).map(mode => ({
        key: mode,
        value: mode,
        label: t(`import.modes.${mode}`)
    }));

    const librariesOptions = libraries.map(l => ({
        key: l.id,
        value: l.id,
        label: localizedTranslation(l.label, lang) || l.id
    }));

    const linkAttributeOptions = sheet.attributes.filter(isLinkAttribute).map(a => ({
        key: a.id,
        value: a.id,
        label: localizedTranslation(a.label, lang) || a.id
    }));

    return (
        <Form layout="vertical">
            <SettingsWrapper direction="horizontal" size="middle" wrap>
                <Form.Item label={t('import.type')} required>
                    <KitSelect
                        style={{minWidth: 200}}
                        defaultValue={sheet.type}
                        placeholder={t('import.select_type')}
                        onChange={value => onImportTypeSelect(sheetIndex, value)}
                        options={typeOptions}
                    />
                </Form.Item>
                {!isSheetIgnored && (
                    <>
                        <Form.Item label={t('import.mode')} required>
                            <KitSelect
                                style={{minWidth: 240}}
                                defaultValue={sheet.mode}
                                placeholder={t('import.select_mode')}
                                onChange={value => onImportModeSelect(sheetIndex, value)}
                                options={modeOptions}
                            />
                        </Form.Item>
                        <Form.Item label={t('import.library')} required>
                            <KitSelect
                                style={{minWidth: 200}}
                                defaultValue={sheet.library ?? state.defaultLibrary}
                                placeholder={t('import.select_library')}
                                onChange={value => onLibrarySelect(sheetIndex, value)}
                                options={librariesOptions}
                            />
                        </Form.Item>
                        {sheet.type === ImportType.LINK && sheet.library && (
                            <Form.Item label={t('import.link_attribute')} required>
                                <KitSelect
                                    style={{minWidth: 200}}
                                    defaultValue={sheet.linkAttribute}
                                    value={sheet.linkAttribute}
                                    placeholder={t('import.select_link_attribute')}
                                    onChange={value => onLinkAttributeSelect(sheetIndex, value)}
                                    options={linkAttributeOptions}
                                />
                            </Form.Item>
                        )}
                        {sheet.type === ImportType.LINK && sheet.linkAttributeProps?.type === AttributeType.tree && (
                            <Form.Item label={t('import.tree_link_library')} required>
                                <KitSelect
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
