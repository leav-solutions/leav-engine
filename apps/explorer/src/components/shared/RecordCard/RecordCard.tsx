// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Paragraph from 'antd/lib/typography/Paragraph';
import RecordPreview from 'components/shared/RecordPreview';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {getFileUrl, localizedTranslation} from 'utils';
import {FilePreview, IRecordIdentityWhoAmI, PreviewSize} from '../../../_types/types';
import {_getPreviewSize} from '../RecordPreview/RecordPreview';

export interface IRecordCardProps {
    record: IRecordIdentityWhoAmI;
    size: PreviewSize;
    style?: CSSObject;
    previewStyle?: CSSObject;
    lang?: string[];
    withPreview?: boolean;
    withLibrary?: boolean;
    tile?: boolean;
}

interface IWrapperProps {
    recordColor: string | null;
    size: PreviewSize;
    withPreview: boolean;
    withLibrary: boolean;
    tile: boolean;
    style?: CSSObject;
}

/* tslint:disable:variable-name */
const Wrapper = styled.div<IWrapperProps>`
    border-left: 5px solid ${props => props.recordColor || 'transparent'};
    display: grid;
    grid-template-areas: ${props => {
        const previewPart = props.withPreview ? ' preview ' : '';
        const subLabelPart = props.withLibrary ? ' sub-label ' : '';
        return (props.tile
            ? `"${previewPart}" "label" "${subLabelPart}"`
            : `"${previewPart}label" "${previewPart}${subLabelPart}"`
        ).replace('""', ''); // Remove empty rows
    }};

    grid-template-columns:
        ${props => {
            if (!props.withPreview || props.tile) {
                return '100%';
            }

            const previewSize = _getPreviewSize(props.size);
            const previewColSize = `calc(${previewSize} + 1.5rem)`;
            return `${previewColSize} calc(100% - ${previewColSize})`;
        }}
        ${props => props.style};
`;
Wrapper.displayName = 'Wrapper';

const PreviewWrapper = styled.div<{tile: boolean}>`
    grid-area: preview;
    margin: ${props => (props.tile ? '0.3rem 0' : '0 0.8em')};
`;

const RecordLabel = styled.div`
    grid-area: label;
    font-weight: bold;
    overflow: hidden;
    align-self: end;
    line-height: 1.3em;
`;

const SubLabel = styled.div`
    grid-area: sub-label;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9em;
    line-height: 1.3em;
`;

const _getPreviewBySize = (preview?: FilePreview, size?: PreviewSize) => {
    const fileSizeByPreviewSize: {[size in PreviewSize]: string} = {
        [PreviewSize.small]: 'tiny',
        [PreviewSize.medium]: 'small',
        [PreviewSize.big]: 'medium'
    };

    const previewPath: string = preview?.[fileSizeByPreviewSize[size]] ?? preview?.small;

    return previewPath ? getFileUrl(previewPath) : '';
};

const RecordCard = ({
    record,
    size,
    style,
    previewStyle,
    lang,
    withPreview = true,
    withLibrary = true,
    tile = false
}: IRecordCardProps): JSX.Element => {
    const label = record.label || record.id;

    return (
        <Wrapper
            recordColor={record.color ?? ''}
            style={style}
            className="record-card"
            size={size}
            withPreview={withPreview}
            withLibrary={withLibrary}
            tile={tile}
        >
            {withPreview && (
                <PreviewWrapper className="preview" tile={tile}>
                    <RecordPreview
                        label={record.label || record.id}
                        color={record.color}
                        image={_getPreviewBySize(record.preview, size)}
                        size={size}
                        style={previewStyle}
                        tile={tile}
                    />
                </PreviewWrapper>
            )}
            <RecordLabel className="label">
                <Paragraph ellipsis={{rows: 1, tooltip: label}} style={{marginBottom: 0}}>
                    {label}
                </Paragraph>
            </RecordLabel>
            {withLibrary && (
                <SubLabel className="library-label">
                    {localizedTranslation(record.library?.label, lang ?? []) || record.library?.id}
                </SubLabel>
            )}
        </Wrapper>
    );
};

export default RecordCard;
