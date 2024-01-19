// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ClockCircleOutlined, FolderOutlined, FrownOutlined} from '@ant-design/icons';
import {getInvertColor, stringToColor} from '@leav/utils';
import {Space, theme} from 'antd';
import {GlobalToken} from 'antd/es/theme/interface';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFileViewerProps} from '../_types';

interface INoDisplayFileProps extends IFileViewerProps {
    noPreviewMessage?: boolean;
}

const Wrapper = styled.div<{$themeToken: GlobalToken; $background: string; $color: string}>`
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: ${p => p.$themeToken.borderRadius}px;
    background-color: ${p => p.$background};
    color: ${p => p.$color};
`;

const ExtensionWrapper = styled.div<{$isDirectory: boolean}>`
    font-size: ${p => (p.$isDirectory ? '4em' : '7em')};
`;

const NoPreviewMessage = styled(Space)`
    font-size: 1.2em;
`;

function NoDisplayFile({fileData, noPreviewMessage = false}: INoDisplayFileProps): JSX.Element {
    const {t} = useSharedTranslation();
    const fileName = fileData.file_name[0].value;
    const extension = fileName.split('.').pop().toUpperCase();
    const bgColor = fileData.whoAmI.color || stringToColor(fileData.whoAmI.label);
    const fontColor = getInvertColor(bgColor);
    const isDirectory = fileData.library.behavior === 'directories';
    const {token} = theme.useToken();

    let message;
    if (fileData.isPreviewsGenerationPending) {
        message = (
            <>
                <ClockCircleOutlined />
                {t('file_data.previews_generation_pending')}
            </>
        );
    } else if (noPreviewMessage) {
        message = (
            <>
                <FrownOutlined />
                {t('file_data.no_preview')}
            </>
        );
    }

    return (
        <Wrapper $background={bgColor} $color={fontColor} $themeToken={token}>
            <ExtensionWrapper $isDirectory={isDirectory}>
                {isDirectory ? (
                    <Space>
                        <FolderOutlined />
                        {t('file_data.directory')}
                    </Space>
                ) : (
                    extension
                )}
            </ExtensionWrapper>
            {message && <NoPreviewMessage>{message}</NoPreviewMessage>}
        </Wrapper>
    );
}

export default NoDisplayFile;
