// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import RecordCard from 'components/shared/RecordCard';
import {IFileDataElement} from 'graphQL/queries/records/getFileDataQuery';
import styled from 'styled-components';
import {PreviewSize} from '_types/types';
import {fileModalSidebarWidth, fileModalWidth} from '../_constants';
import AudioFile from './AudioFile';
import DocumentFile from './DocumentFile';
import FileModalSidebar from './FileModalSidebar';
import ImageFile from './ImageFile';
import NoDisplayFile from './NoDisplayFile';
import VideoFile from './VideoFile';

interface IFileModalContentProps {
    fileData: IFileDataElement;
}

const Container = styled.div`
    height: calc(100vh - 12rem);
    display: grid;
    grid-template-columns: minmax(0, ${fileModalWidth - fileModalSidebarWidth}px) ${fileModalSidebarWidth}px;
    grid-template-rows: 5rem auto;
    grid-template-areas:
        'title title'
        'content sidebar';
    overflow: hidden;
    grid-gutter: 0;
`;

const Title = styled.div`
    grid-area: title;
    align-self: center;
    font-size: 1rem;
    padding: 1rem;
    border-bottom: 1px solid ${themeVars.borderColor};
`;

const Content = styled.div`
    position: relative;
    height: calc(100vh - 17rem);
    grid-area: content;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 1rem;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;

    .ant-image {
        max-height: calc(100vh - 19rem);
        border: 1px solid ${themeVars.borderLightColor};

        height: fit-content;
        img {
            max-height: calc(100vh - 19rem);
        }
    }
`;

function FileModalContent({fileData}: IFileModalContentProps): JSX.Element {
    let fileViewer;
    const viewerProps = {
        fileData,
        fallback: <NoDisplayFile fileData={fileData} noPreviewMessage fallback={null} />
    };

    switch (fileData.file_type) {
        case 'image':
            fileViewer = <ImageFile {...viewerProps} />;
            break;
        case 'video':
            fileViewer = <VideoFile {...viewerProps} />;
            break;
        case 'audio':
            fileViewer = <AudioFile {...viewerProps} />;
            break;
        case 'document':
            fileViewer = <DocumentFile {...viewerProps} />;
            break;
        default:
            fileViewer = <NoDisplayFile fileData={fileData} fallback={null} />;
    }

    return (
        <Container>
            <Title data-testid="title-section">
                <RecordCard record={fileData.whoAmI} size={PreviewSize.small} />
            </Title>
            <Content data-testid="content-section">{fileViewer}</Content>
            <FileModalSidebar fileData={fileData} />
        </Container>
    );
}

export default FileModalContent;
