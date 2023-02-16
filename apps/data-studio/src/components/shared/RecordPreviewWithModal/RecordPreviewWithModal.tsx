// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EyeOutlined} from '@ant-design/icons';
import {IRecordPreviewProps, RecordPreview, themeVars} from '@leav/ui';
import FileModal from 'components/FileModal';
import {useMustShowTransparency} from 'hooks/useMustShowTransparency';
import {useState} from 'react';
import styled from 'styled-components';
import {RecordIdentity_whoAmI_preview_file} from '_gqlTypes/RecordIdentity';

interface IRecordPreviewWithModalProps extends Omit<IRecordPreviewProps, 'onClick'> {
    previewFile: RecordIdentity_whoAmI_preview_file;
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
    ...recordPreviewProps
}: IRecordPreviewWithModalProps): JSX.Element {
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const fileId = previewFile?.id;
    const fileLibraryId = previewFile?.library?.id;
    const mustShowTransparency = useMustShowTransparency();

    const _handlePreviewClick = () => {
        setPreviewModalOpen(true);
    };

    const _handleClosePreviewModal = () => setPreviewModalOpen(false);

    return (
        <>
            <ClickHandler onClick={_handlePreviewClick} data-testid="click-handler">
                <RecordPreview
                    imageStyle={{
                        background: mustShowTransparency ? themeVars.checkerBoard : 'transparent',
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
