import {CloseOutlined, PlusOutlined} from '@ant-design/icons';
import {localizedTranslation} from '@leav/utils';
import {Button, Collapse, Form, Select, Space, Switch} from 'antd';
import {type ComponentProps, type ReactNode, useState} from 'react';
import styled, {type CSSObject} from 'styled-components';
import {type LibraryLightFragment, type TreeDetailsFragment} from '../../../../../../_gqlTypes';
import {PreviewSize} from '../../../../../../constants';
import useLang from '../../../../../../hooks/useLang/useLang';
import {useSharedTranslation} from '../../../../../../hooks/useSharedTranslation';
import {EntityCard, type IEntityData} from '../../../../../EntityCard';
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

// Replaces antd's deprecated <List>: a semantic <ul> (keeps the listitem role tests rely on).
const LibrariesList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

// Replaces antd's deprecated <List.Item>: a stacked row with the same bottom divider antd rendered.
const LibraryItem = styled.li`
    display: flex;
    flex-direction: column;
    padding: 5px 1rem;
    border-block-end: 1px solid rgba(5, 5, 5, 0.06);
`;

const EmptyText = styled.div`
    padding: 1rem;
    text-align: center;
    color: rgba(0, 0, 0, 0.25);
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
            settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: [ALL_CHILDREN_ALLOWED_KEY]},
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
                    settings: {...library.settings, [field]: checked},
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
                    settings: {...library.settings, allowedChildren: selectedChildren},
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
            preview: null,
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
                        .includes(ALL_CHILDREN_ALLOWED_KEY),
                })),
            },
        ];

        const collapseItems: ComponentProps<typeof Collapse>['items'] = [
            {
                key: 'settings',
                label: t('trees.advanced_settings'),
                children: (
                    <>
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
                    </>
                ),
            },
        ];

        return (
            <LibraryItem key={item.library.id}>
                <ListItemPart style={{justifyContent: 'space-between'}}>
                    <EntityCard entity={itemIdentity} size={PreviewSize.SMALL} />
                    {!readOnly && (
                        <RemoveButton
                            role="button"
                            aria-label="delete-library"
                            onClick={_handleRemoveLibrary(item.library.id)}
                        />
                    )}
                </ListItemPart>
                <Collapse size="small" style={{width: '100%', margin: '0.5rem'}} items={collapseItems} />
            </LibraryItem>
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
                {libraries.length > 0 ? (
                    <LibrariesList>{libraries.map(renderListItem)}</LibrariesList>
                ) : (
                    <EmptyText>{t('trees.no_linked_libraries')}</EmptyText>
                )}
                {listFooter}
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
