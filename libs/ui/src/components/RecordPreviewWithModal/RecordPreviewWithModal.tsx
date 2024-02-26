// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EyeOutlined} from '@ant-design/icons';
import {IPreviewScalar} from '@leav/utils';
import {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {themeVars} from '../../antdTheme';
import {EntityPreview, IEntityPreviewProps} from '../EntityPreview';
import FileModal from './FileModal';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IRecordPreviewWithModalProps extends Omit<IEntityPreviewProps, 'onClick'> {
    previewFile: IPreviewScalar['file'];
    showTransparency?: boolean;
}

const DivClickHandler = styled.div<{$isClickable?: boolean}>`
    position: relative;
    cursor: ${({$isClickable}) => ($isClickable ? 'pointer' : 'default')};
    width: fit-content;
    height: fit-content;
    margin: auto;
`;

const DivOverlay = styled.div`
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

    ${DivClickHandler}:hover & {
        display: flex;
    }
`;

const RecordPreviewWithModal: FunctionComponent<IRecordPreviewWithModalProps> = ({
    previewFile,
    imageStyle,
    showTransparency = false,
    ...recordPreviewProps
}) => {
    const {t} = useSharedTranslation();

    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const fileId = previewFile?.id;
    const fileLibraryId = previewFile?.library;

    const isPreviewClickable = previewFile !== undefined;

    const _handlePreviewClick = () => {
        if (isPreviewClickable) {
            setPreviewModalOpen(true);
        }
    };

    const _handleClosePreviewModal = () => setPreviewModalOpen(false);

    return (
        <>
            <DivClickHandler
                $isClickable={isPreviewClickable}
                onClick={_handlePreviewClick}
                data-testid="click-handler"
            >
                <EntityPreview
                    imageStyle={{
                        background: showTransparency ? themeVars.checkerBoard : 'transparent',
                        ...imageStyle
                    }}
                    {...recordPreviewProps}
                />
                {isPreviewClickable && (
                    <DivOverlay title={t('record_summary.preview_title')}>
                        <EyeOutlined />
                    </DivOverlay>
                )}
            </DivClickHandler>
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
};

export default RecordPreviewWithModal;
