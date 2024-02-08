// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EyeOutlined} from '@ant-design/icons';
import {IPreviewScalar} from '@leav/utils';
import {useState} from 'react';
import styled from 'styled-components';
import {themeVars} from '../../antdTheme';
import {EntityPreview, IEntityPreviewProps} from '../EntityPreview';
import FileModal from './FileModal';

interface IRecordPreviewWithModalProps extends Omit<IEntityPreviewProps, 'onClick'> {
    previewFile: IPreviewScalar['file'];
    showTransparency?: boolean;
}

const ClickHandler = styled.div`
    position: relative;
    cursor: pointer;
    width: fit-content;
    height: fit-content;
    margin: auto;
`;

const Overlay = styled.div`
    background: ${themeVars.secondaryBg}99; // Hexadecimal color + opacity
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    justify-content: center;
    align-items: center;
    font-size: 2em;

    ${ClickHandler}:hover & {
        display: flex;
    }
`;

function RecordPreviewWithModal({
    previewFile,
    imageStyle,
    showTransparency = false,
    ...recordPreviewProps
}: IRecordPreviewWithModalProps): JSX.Element {
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const fileId = previewFile?.id;
    const fileLibraryId = previewFile?.library;

    const _handlePreviewClick = () => {
        setPreviewModalOpen(true);
    };

    const _handleClosePreviewModal = () => setPreviewModalOpen(false);

    return (
        <>
            <ClickHandler onClick={_handlePreviewClick} data-testid="click-handler">
                <EntityPreview
                    imageStyle={{
                        background: showTransparency ? themeVars.checkerBoard : 'transparent',
                        ...imageStyle
                    }}
                    {...recordPreviewProps}
                />
                <Overlay>
                    <EyeOutlined />
                </Overlay>
            </ClickHandler>
            {isPreviewModalOpen && (
                <FileModal
                    open={isPreviewModalOpen}
                    fileId={fileId}
                    libraryId={fileLibraryId}
                    onClose={_handleClosePreviewModal}
                />
            )}
        </>
    );
}

export default RecordPreviewWithModal;
