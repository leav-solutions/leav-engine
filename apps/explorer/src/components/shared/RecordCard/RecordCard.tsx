// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Paragraph from 'antd/lib/typography/Paragraph';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {getFileUrl, localizedTranslation} from '../../../utils/utils';
import {IPreview, IRecordIdentityWhoAmI, PreviewSize} from '../../../_types/types';
import RecordPreview from '../../LibraryItemsList/LibraryItemsListTable/RecordPreview';

interface IRecordCardProps {
    record: IRecordIdentityWhoAmI;
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
    overflow: hidden;
`;

const LibLabel = styled.div`
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9em;
`;

const getPreviewBySize = (preview?: IPreview, size?: PreviewSize) => {
    const previewBySize = preview && (size ? preview[size] ?? preview.small : preview.small);
    return previewBySize ? getFileUrl(previewBySize) : '';
};

const RecordCard = ({record, size, style, lang}: IRecordCardProps): JSX.Element => {
    const label = record.label || record.id;

    return (
        <Wrapper recordColor={record.color ?? ''} style={style} className="ui fluid">
            <PreviewWrapper className="ui">
                <RecordPreview
                    label={record.label || record.id}
                    color={record.color}
                    image={getPreviewBySize(record.preview, size)}
                    size={size}
                    style={style}
                />
            </PreviewWrapper>
            <CardPart className="ui">
                <RecordLabel>
                    <Paragraph ellipsis={{rows: 1, tooltip: label}} style={{marginBottom: 0}}>
                        {label}
                    </Paragraph>
                </RecordLabel>
                <LibLabel>{localizedTranslation(record.library?.label, lang ?? []) || record.library?.id}</LibLabel>
            </CardPart>
        </Wrapper>
    );
};

export default RecordCard;
