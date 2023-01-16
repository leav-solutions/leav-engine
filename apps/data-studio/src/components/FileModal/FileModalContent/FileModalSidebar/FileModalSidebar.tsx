// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {Descriptions} from 'antd';
import {IFileDataElement} from 'graphQL/queries/records/getFileDataQuery';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

interface IFileModalSidebarProps {
    fileData: IFileDataElement;
}

const Sidebar = styled.div`
    position: relative;
    grid-area: sidebar;
    background: ${themeVars.secondaryBg};
    border-top-right-radius: 3px;
    z-index: 1;
    padding: 1rem;
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

function FileModalSidebar({fileData}: IFileModalSidebarProps): JSX.Element {
    const {t} = useTranslation();

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
                date: fileData.created_at,
                user: fileData.created_by.whoAmI.label,
                interpolation: {escapeValue: false}
            })
        },
        {
            title: t('record_summary.modified_at'),
            value: t('record_summary.modified_at_value', {
                date: fileData.modified_at,
                user: fileData.modified_by.whoAmI.label,
                interpolation: {escapeValue: false}
            })
        },
        {
            title: t('file_data.path'),
            value: <Path>{'/' + fileData.file_path}</Path>
        }
    ];

    return (
        <Sidebar data-testid="sidebar-section">
            <Descriptions layout="horizontal" column={1}>
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
        </Sidebar>
    );
}

export default FileModalSidebar;
