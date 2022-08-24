// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EyeOutlined} from '@ant-design/icons';
import FileModal from 'components/FileModal';
import React, {useState} from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';
import RecordPreview from '../RecordPreview';
import {IRecordPreviewProps} from '../RecordPreview/RecordPreview';

interface IRecordPreviewWithModalProps extends Omit<IRecordPreviewProps, 'onClick'> {
    fileId?: string;
    fileLibraryId?: string;
}

const ClickHandler = styled.div<{hasPreview: boolean}>`
    position: relative;
    cursor: pointer;
    width: ${p => (p.hasPreview ? 'fit-content' : '100%')};
    height: ${p => (p.hasPreview ? 'fit-content' : '100%')};
    margin: auto;
`;

const Overlay = styled.div`
    background: ${themingVar['@leav-secondary-bg']}99; // Hexadecimal color + opacity
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
    fileId,
    fileLibraryId,
    ...recordPreviewProps
}: IRecordPreviewWithModalProps): JSX.Element {
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const hasPreview = !!(fileId && fileLibraryId && recordPreviewProps.image);

    const _handlePreviewClick = () => {
        if (!hasPreview) {
            return;
        }
        setPreviewModalOpen(true);
    };

    const _handleClosePreviewModal = () => setPreviewModalOpen(false);

    return (
        <>
            <ClickHandler onClick={_handlePreviewClick} data-testid="click-handler" hasPreview={hasPreview}>
                <RecordPreview {...recordPreviewProps} />
                {hasPreview && (
                    <Overlay>
                        <EyeOutlined />
                    </Overlay>
                )}
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
