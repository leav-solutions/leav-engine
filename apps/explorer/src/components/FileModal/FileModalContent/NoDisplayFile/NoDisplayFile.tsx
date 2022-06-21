// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FolderOutlined, FrownOutlined} from '@ant-design/icons';
import {Space} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {getInvertColor, stringToColor} from 'utils';
import {IFileViewerProps} from '../_types';

interface INoDisplayFileProps extends IFileViewerProps {
    noPreviewMessage?: boolean;
}

const Wrapper = styled.div`
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: ${themingVar['@border-radius-base']};
`;

const ExtensionWrapper = styled.div<{isDirectory: boolean}>`
    font-size: ${p => (p.isDirectory ? '4em' : '7em')};
`;

const NoPreviewMessage = styled(Space)`
    font-size: 1.2em;
`;

function NoDisplayFile({fileData, noPreviewMessage = false}: INoDisplayFileProps): JSX.Element {
    const {t} = useTranslation();
    const extension = fileData.file_name.split('.').pop().toUpperCase();
    const bgColor = fileData.whoAmI.color || stringToColor(fileData.whoAmI.label);
    const fontColor = getInvertColor(bgColor);

    return (
        <Wrapper style={{backgroundColor: bgColor, color: fontColor}}>
            <ExtensionWrapper isDirectory={fileData.is_directory}>
                {fileData.is_directory ? (
                    <Space>
                        <FolderOutlined />
                        {t('file_data.directory')}
                    </Space>
                ) : (
                    extension
                )}
            </ExtensionWrapper>
            {noPreviewMessage && (
                <NoPreviewMessage>
                    <FrownOutlined />
                    {t('file_data.no_preview')}
                </NoPreviewMessage>
            )}
        </Wrapper>
    );
}

export default NoDisplayFile;
