// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PictureOutlined} from '@ant-design/icons';
import {Descriptions} from 'antd';
import {useState} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {BasicButton} from '_ui/components/BasicButton';
import {TriggerPreviewsGenerationModal} from '_ui/components/TriggerPreviewsGenerationModal';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFileDataWithPreviewsStatus} from '_ui/_queries/records/getFileDataQuery';

interface IFileModalSidebarProps {
    fileData: IFileDataWithPreviewsStatus;
}

const Sidebar = styled.div`
    position: relative;
    grid-area: sidebar;
    background: ${themeVars.secondaryBg};
    border-top-right-radius: 3px;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
`;

const Path = styled.div`
    overflow-x: auto;
    height: 2em;
    white-space: nowrap;
    background: ${themeVars.defaultBg};
    padding: 0.5em;
    line-height: 1em;
    width: 135px;
    font-family: monospace;
`;

const ActionsWrapper = styled.div`
    padding: 0.5rem 1rem;
    border-top: 1px solid ${themeVars.borderColor};
    text-align: center;
`;

function FileModalSidebar({fileData}: IFileModalSidebarProps): JSX.Element {
    const {t} = useSharedTranslation();
    const [displayPreviewConfirm, setDisplayPreviewConfirm] = useState(false);

    const _handleClickGeneratePreviews = () => {
        setDisplayPreviewConfirm(true);
    };

    const _handleClosePreviewGenerationConfirm = () => {
        setDisplayPreviewConfirm(false);
    };

    const summaryContent = [
        {
            title: t('record_summary.id'),
            value: fileData.id
        },
        {
            title: t('record_summary.label'),
            value: fileData.whoAmI.label
        },
        {
            title: t('record_summary.created_at'),
            value: t('record_summary.created_at_value', {
                date: fileData.created_at?.[0]?.value,
                user: fileData.created_by?.[0]?.value.whoAmI.label,
                interpolation: {escapeValue: false}
            })
        },
        {
            title: t('record_summary.modified_at'),
            value: t('record_summary.modified_at_value', {
                date: fileData.modified_at?.[0]?.value,
                user: fileData.modified_by?.[0]?.value.whoAmI.label,
                interpolation: {escapeValue: false}
            })
        },
        {
            title: t('file_data.path'),
            value: <Path>{'/' + fileData.file_path?.[0]?.value}</Path>
        }
    ];

    return (
        <>
            <Sidebar data-testid="sidebar-section">
                <Descriptions layout="horizontal" column={1} style={{padding: '1rem'}}>
                    {summaryContent.map((item, index) => {
                        const {title, value} = item;

                        return (
                            <Descriptions.Item
                                key={index}
                                label={title}
                                style={{paddingBottom: '5px'}}
                                labelStyle={{fontWeight: 'bold', width: '50%'}}
                            >
                                {value}
                            </Descriptions.Item>
                        );
                    })}
                </Descriptions>
                {!fileData.isPreviewsGenerationPending && (
                    <ActionsWrapper>
                        <BasicButton icon={<PictureOutlined />} onClick={_handleClickGeneratePreviews}>
                            {t('files.generate_previews')}
                        </BasicButton>
                    </ActionsWrapper>
                )}
            </Sidebar>
            {displayPreviewConfirm && (
                <TriggerPreviewsGenerationModal
                    libraryId={fileData.whoAmI.library.id}
                    recordIds={[fileData.id]}
                    onClose={_handleClosePreviewGenerationConfirm}
                />
            )}
        </>
    );
}

export default FileModalSidebar;
