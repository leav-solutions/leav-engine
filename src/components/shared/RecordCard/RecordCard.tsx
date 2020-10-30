import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {getPreviewUrl, localizedLabel} from '../../../utils/utils';
import {IPreview, PreviewSize, RecordIdentity_whoAmI} from '../../../_types/types';
import RecordPreview from '../../LibraryItemsList/LibraryItemsListTable/RecordPreview';

interface IRecordCardProps {
    record: RecordIdentity_whoAmI;
    size: PreviewSize;
    style?: CSSObject;
    lang?: string[];
}

interface IWrapperProps {
    recordColor: string | null;
    style?: CSSObject;
}

/* tslint:disable:variable-name */
const Wrapper = styled.div<IWrapperProps>`
    border-left: 5px solid ${props => props.recordColor || 'transparent'};
    display: flex;
    flex-direction: row;
    ${props => props.style}
`;
Wrapper.displayName = 'Wrapper';

const CardPart = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const PreviewWrapper = styled(CardPart)`
    margin: 0 0.8em;
`;

const RecordLabel = styled.div`
    font-weight: bold;
    word-break: keep-all;
`;

const LibLabel = styled.div`
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9em;
`;

const getPreviewBySize = (preview?: IPreview, size?: PreviewSize) => {
    const previewBySize = preview && (size ? preview[size] ?? preview.small : preview.small);
    return previewBySize ? getPreviewUrl(previewBySize) : '';
};

const RecordCard = ({record, size, style, lang}: IRecordCardProps): JSX.Element => {
    return (
        <Wrapper recordColor={record.color ?? ''} style={style} className="ui fluid">
            <PreviewWrapper className="ui">
                <RecordPreview
                    label={record.label || record.id}
                    color={record.color}
                    image={getPreviewBySize(record.preview, size)}
                    size={size}
                />
            </PreviewWrapper>
            <CardPart className="ui">
                <RecordLabel>{record.label || record.id}</RecordLabel>
                <LibLabel>{localizedLabel(record.library?.label, lang ?? []) || record.library?.id}</LibLabel>
            </CardPart>
        </Wrapper>
    );
};

export default RecordCard;
