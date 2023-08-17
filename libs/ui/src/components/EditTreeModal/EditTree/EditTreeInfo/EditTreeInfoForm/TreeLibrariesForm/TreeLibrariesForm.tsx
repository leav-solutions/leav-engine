// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, PlusOutlined} from '@ant-design/icons';
import {localizedTranslation} from '@leav/utils';
import {Button, Collapse, Form, List, Select, Space, Switch} from 'antd';
import {ReactNode, useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {LibraryLightFragment, TreeDetailsFragment} from '../../../../../../_gqlTypes';
import {PreviewSize} from '../../../../../../constants';
import useLang from '../../../../../../hooks/useLang';
import {useSharedTranslation} from '../../../../../../hooks/useSharedTranslation';
import {EntityCard, IEntityData} from '../../../../../EntityCard';
import FieldsGroup from '../../../../../FieldsGroup';
import {LibraryPicker} from '../../../../../LibraryPicker';

const RemoveButton = styled(CloseOutlined)`
    cursor: pointer;
    align-self: flex-start;
`;

const ListItemPart = styled.div<{style?: CSSObject}>`
    display: flex;
    padding: 0.5rem;
    width: 100%;
    gap: 1rem;

    ${props => props.style}
`;

const ALL_CHILDREN_ALLOWED_KEY = '__all__';

interface ITreeLibrariesFormProps {
    onChange: (libraries: TreeDetailsFragment['libraries']) => void;
    readOnly?: boolean;
    extra?: ReactNode;
}

function TreeLibrariesForm({onChange, extra, readOnly}: ITreeLibrariesFormProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const form = Form.useFormInstance();
    const libraries: TreeDetailsFragment['libraries'] = form.getFieldValue('libraries') ?? [];
    const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);

    const _handleLibrariesChange = (newLibraries: TreeDetailsFragment['libraries']) => {
        form.setFieldValue('libraries', newLibraries);
        onChange(newLibraries);
    };

    const _handleAddLibrary = () => {
        setIsLibraryPickerOpen(true);
    };
    const _handleCloseLibraryPicker = () => setIsLibraryPickerOpen(false);
    const _handleSubmitLibraryPicker = (selectedLibraries: LibraryLightFragment[]) => {
        const addedLibraries = selectedLibraries.map(library => ({
            library: {id: library.id, label: library.label},
            settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: [ALL_CHILDREN_ALLOWED_KEY]}
        }));

        const newLibraries = [...libraries, ...addedLibraries];
        _handleLibrariesChange(newLibraries);
    };
    const _handleRemoveLibrary = (libraryId: string) => () => {
        const newLibraries = libraries.filter(library => library.library.id !== libraryId);
        _handleLibrariesChange(newLibraries);
    };

    const _handleSwitchChange = (libraryId: string, field: string) => (checked: boolean) => {
        const newLibraries = libraries.map(library => {
            if (library.library.id === libraryId) {
                return {
                    ...library,
                    settings: {...library.settings, [field]: checked}
                };
            }

            return library;
        });

        _handleLibrariesChange(newLibraries);
    };

    const _handleAllowedChildrenChange = (libraryId: string, index: number) => (allowedChildren: string[]) => {
        const previousValue =
            libraries.find(library => library.library.id === libraryId)?.settings.allowedChildren ?? [];

        let selectedChildren = allowedChildren;
        const didAllowAllChildren = previousValue.includes(ALL_CHILDREN_ALLOWED_KEY);
        const nowAllowAllChildren = allowedChildren.includes(ALL_CHILDREN_ALLOWED_KEY);
        if (!nowAllowAllChildren && didAllowAllChildren) {
            selectedChildren = allowedChildren.filter(child => child !== ALL_CHILDREN_ALLOWED_KEY);
        }

        if (nowAllowAllChildren && !didAllowAllChildren) {
            selectedChildren = [ALL_CHILDREN_ALLOWED_KEY];
        }

        const newLibraries = libraries.map(library => {
            if (library.library.id === libraryId) {
                return {
                    ...library,
                    settings: {...library.settings, allowedChildren: selectedChildren}
                };
            }

            return library;
        });

        _handleLibrariesChange(newLibraries);
        form.setFieldValue(['libraries', index, 'settings', 'allowedChildren'], selectedChildren);
    };

    const groupLabel = (
        <Space>
            {t('trees.linked_libraries')}
            {extra}
        </Space>
    );

    const renderListItem = (item: TreeDetailsFragment['libraries'][number], index: number) => {
        const itemIdentity: IEntityData = {
            label: localizedTranslation(item.library.label, lang),
            subLabel: item.library.id,
            color: null,
            preview: null
        };

        const allowedChildrenOptions = [
            {key: ALL_CHILDREN_ALLOWED_KEY, value: ALL_CHILDREN_ALLOWED_KEY, label: t('trees.all_children_allowed')},
            {
                key: 'libraries',
                label: t('trees.libraries'),
                options: libraries.map(library => ({
                    key: library.library.id,
                    value: library.library.id,
                    label: localizedTranslation(library.library.label, lang),
                    disabled: form
                        .getFieldValue(['libraries', index, 'settings', 'allowedChildren'])
                        .includes(ALL_CHILDREN_ALLOWED_KEY)
                }))
            }
        ];

        return (
            <List.Item style={{flexDirection: 'column', padding: '5px 1rem'}}>
                <ListItemPart style={{justifyContent: 'space-between'}}>
                    <EntityCard entity={itemIdentity} size={PreviewSize.small} />
                    {!readOnly && (
                        <RemoveButton
                            role="button"
                            aria-label="delete-library"
                            onClick={_handleRemoveLibrary(item.library.id)}
                        />
                    )}
                </ListItemPart>
                <Collapse size="small" style={{width: '100%', margin: '0.5rem'}}>
                    <Collapse.Panel header={t('trees.advanced_settings')} key="settings">
                        <ListItemPart>
                            <Form.Item
                                name={['libraries', index, 'settings', 'allowMultiplePositions']}
                                label={t('trees.allowed_multiple_positions')}
                                valuePropName="checked"
                                style={{margin: 0}}
                            >
                                <Switch
                                    disabled={readOnly}
                                    onChange={_handleSwitchChange(item.library.id, 'allowMultiplePositions')}
                                />
                            </Form.Item>
                            <Form.Item
                                name={['libraries', index, 'settings', 'allowedAtRoot']}
                                label={t('trees.allowed_at_root')}
                                valuePropName="checked"
                                style={{margin: 0}}
                            >
                                <Switch
                                    disabled={readOnly}
                                    onChange={_handleSwitchChange(item.library.id, 'allowedAtRoot')}
                                />
                            </Form.Item>
                        </ListItemPart>
                        <ListItemPart>
                            <Form.Item
                                name={['libraries', index, 'settings', 'allowedChildren']}
                                label={t('trees.allowed_children')}
                                style={{margin: 0}}
                            >
                                <Select
                                    options={allowedChildrenOptions}
                                    onChange={_handleAllowedChildrenChange(item.library.id, index)}
                                    placeholder={t('trees.no_children_allowed')}
                                    mode="multiple"
                                    allowClear
                                    disabled={readOnly}
                                    style={{minWidth: '15rem'}}
                                    aria-label=""
                                />
                            </Form.Item>
                        </ListItemPart>
                    </Collapse.Panel>
                </Collapse>
            </List.Item>
        );
    };

    const listFooter = !readOnly ? (
        <Button icon={<PlusOutlined />} style={{border: 'none', boxShadow: 'none'}} onClick={_handleAddLibrary}>
            {t('trees.add_libraries')}
        </Button>
    ) : null;
    const selectedLibraries = libraries.map(library => library.library.id);

    return (
        <>
            <FieldsGroup label={groupLabel} style={{padding: 0}}>
                <List
                    dataSource={libraries}
                    renderItem={renderListItem}
                    footer={listFooter}
                    locale={{emptyText: t('trees.no_linked_libraries')}}
                    style={{padding: 0}}
                />
            </FieldsGroup>
            {isLibraryPickerOpen && (
                <LibraryPicker
                    onClose={_handleCloseLibraryPicker}
                    open={isLibraryPickerOpen}
                    onSubmit={_handleSubmitLibraryPicker}
                    multiple
                    selected={selectedLibraries}
                    showSelected={false}
                />
            )}
        </>
    );
}

export default TreeLibrariesForm;
