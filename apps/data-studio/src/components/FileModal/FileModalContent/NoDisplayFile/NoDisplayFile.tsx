// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FolderOutlined, FrownOutlined} from '@ant-design/icons';
import {Space, theme} from 'antd';
import {GlobalToken} from 'antd/es/theme/interface';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getInvertColor, stringToColor} from 'utils';
import {IFileViewerProps} from '../_types';

interface INoDisplayFileProps extends IFileViewerProps {
    noPreviewMessage?: boolean;
}

const Wrapper = styled.div<{themeToken: GlobalToken}>`
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: ${p => p.themeToken.borderRadius}px;
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
    const isDirectory = fileData.library.behavior === 'directories';
    const {token} = theme.useToken();

    return (
        <Wrapper style={{backgroundColor: bgColor, color: fontColor}} themeToken={token}>
            <ExtensionWrapper isDirectory={isDirectory}>
                {isDirectory ? (
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
