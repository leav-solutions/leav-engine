// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExpandAltOutlined, PlusOutlined} from '@ant-design/icons';
import {getInvertColor, localizedTranslation} from '@leav/utils';
import {Button, Input, Popconfirm, Space, Table, TableColumnsType, Tag, Tooltip} from 'antd';
import {useState} from 'react';
import styled from 'styled-components';
import {useCheckPreviewExistence, useLang} from '../../../../../hooks';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import {LibraryPreviewsSettingsFragment} from '../../../../../_gqlTypes';
import {BasicButton} from '../../../../BasicButton';
import {FloatingMenu} from '../../../../FloatingMenu';
import {EditPreviewsSettingsModal} from '../EditPreviewsSettingsModal';

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;

    > input {
        flex-grow: 1;
    }
`;

const LabelCellWrapper = styled.div`
    .floating-menu {
        display: none;
    }

    &:hover .floating-menu {
        display: block;
    }
`;

interface IPreviewsSettingsListProps {
    libraryId: string;
    previewsSettings: LibraryPreviewsSettingsFragment[];
    readOnly: boolean;
    onChange: (previewSettings: LibraryPreviewsSettingsFragment[]) => void;
}

function PreviewsSettingsList({
    libraryId,
    previewsSettings,
    readOnly,
    onChange: onChangePreviewSettings
}: IPreviewsSettingsListProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const [search, setSearch] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editModalDataIndex, setEditModalDataIndex] = useState<number>(null);

    const columns: TableColumnsType<LibraryPreviewsSettingsFragment> = [
        {
            title: t('libraries.previews_settings.label'),
            dataIndex: 'label',
            key: 'label',
            render: (label, previewsSetting, index) => {
                const description = previewsSetting.description
                    ? localizedTranslation(previewsSetting.description, lang)
                    : null;

                const menuActions = [
                    {
                        label: t('libraries.previews_settings.edit'),
                        icon: <ExpandAltOutlined />,
                        onClick: () => {
                            setEditModalDataIndex(index);
                            setIsEditModalOpen(true);
                        }
                    }
                ];

                return (
                    <LabelCellWrapper>
                        <Tooltip title={description}>{localizedTranslation(label, lang)}</Tooltip>
                        <FloatingMenu actions={menuActions} />
                    </LabelCellWrapper>
                );
            }
        },
        {
            title: t('libraries.previews_settings.background'),
            dataIndex: ['versions', 'background'],
            key: 'background',
            width: '150px',
            render: background => {
                const isBgDefined = background && background !== 'false';
                const bgLabel = isBgDefined ? background : t('libraries.previews_settings.transparent');
                const fontColor = isBgDefined ? getInvertColor(background) : null;

                return (
                    <Tag
                        color={isBgDefined ? background : null}
                        style={{color: fontColor, borderColor: fontColor}}
                        bordered
                    >
                        {bgLabel}
                    </Tag>
                );
            }
        },
        {
            title: t('libraries.previews_settings.density'),
            dataIndex: ['versions', 'density'],
            key: 'density',
            width: '150px',
            render: value => (value ? `${value} dpi` : null)
        },
        {
            title: t('libraries.previews_settings.sizes'),
            dataIndex: ['versions', 'sizes'],
            key: 'sizes',
            render: (value: LibraryPreviewsSettingsFragment['versions']['sizes']) => {
                return (
                    <Space wrap size="small">
                        {value.map(({name, size}) => (
                            <Tooltip key={name} title={name}>
                                <Tag key={name}>{size}</Tag>
                            </Tooltip>
                        ))}
                    </Space>
                );
            }
        }
    ];

    if (!readOnly) {
        columns.push({
            key: 'actions',
            width: '50px',
            dataIndex: null,
            title: null,
            align: 'center',
            render: (_, item, index) => {
                const _handleDeleteSettings = async () => {
                    const newPreviewsSettings = [...previewsSettings];

                    // Remove element at index
                    newPreviewsSettings.splice(index, 1);
                    await onChangePreviewSettings(newPreviewsSettings);
                };

                return (
                    <Popconfirm
                        onConfirm={_handleDeleteSettings}
                        title={t('libraries.previews_settings.delete_settings_confirm')}
                        okText={t('global.submit')}
                        cancelText={t('global.cancel')}
                    >
                        <BasicButton
                            shape="circle"
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            centered
                            aria-label="delete"
                            disabled={item.system}
                        />
                    </Popconfirm>
                );
            }
        });
    }

    const _handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditModalDataIndex(null);
    };

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const _handleClickAdd = () => {
        setIsEditModalOpen(true);
    };

    const tableHeader = (
        <HeaderWrapper>
            <Input.Search onChange={_handleSearchChange} placeholder={t('global.search') + '...'} allowClear />
            {!readOnly && (
                <Button type="primary" icon={<PlusOutlined />} onClick={_handleClickAdd}>
                    {t('libraries.previews_settings.add_settings')}
                </Button>
            )}
        </HeaderWrapper>
    );

    const data = previewsSettings
        .filter(previewSetting => {
            // Filter based on search
            const label = localizedTranslation(previewSetting.label, lang);
            const searchStr = search.toLowerCase();

            // Search on label
            return label.toLowerCase().includes(searchStr);
        })
        .map((previewSetting, index) => ({
            ...previewSetting,
            key: index
        }));

    const _handleSubmit = async (previewSetting: LibraryPreviewsSettingsFragment) => {
        const newPreviewsSettings = [...previewsSettings];
        if (editModalDataIndex !== null) {
            newPreviewsSettings[editModalDataIndex] = previewSetting;
        } else {
            newPreviewsSettings.push(previewSetting);
        }
        await onChangePreviewSettings(newPreviewsSettings);
        _handleCloseEditModal();
    };

    const _isPreviewUnique = async (previewId: string) => {
        return useCheckPreviewExistence(libraryId, previewId);
    };

    return (
        <>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                title={() => tableHeader}
                size="middle"
                bordered
                scroll={{y: 'calc(95vh - 22rem)'}}
            />
            {isEditModalOpen && (
                <EditPreviewsSettingsModal
                    open={isEditModalOpen}
                    onClose={_handleCloseEditModal}
                    onSubmit={_handleSubmit}
                    readOnly={readOnly}
                    previewsSetting={previewsSettings[editModalDataIndex] ?? null}
                    onCheckPreviewUniqueness={_isPreviewUnique}
                />
            )}
        </>
    );
}

export default PreviewsSettingsList;
