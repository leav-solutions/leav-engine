// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import Paragraph from 'antd/lib/typography/Paragraph';
import styled, {CSSObject} from 'styled-components';
import {PreviewSize} from '../../constants';
import {getPreviewSize} from '../../helpers/getPreviewSize';
import useLang from '../../hooks/useLang';
import {IRecordIdentityPreview} from '../../types/RecordIdentity';
import RecordPreview from '../RecordPreview';
import {IRecordCardProps} from './_types';

interface IWrapperProps {
    recordColor: string | null;
    size: PreviewSize;
    withPreview: boolean;
    withLibrary: boolean;
    tile: boolean;
    style?: CSSObject;
    simplistic?: boolean;
}

const _getGridTemplateAreas = (withPreview: boolean, withLibrary: boolean, tile: boolean): string => {
    if (tile) {
        if (withPreview) {
            if (withLibrary) {
                return `
                    'preview'
                    'label'
                    'sub-label'
                `;
            }
            return `
                'preview'
                'label'
            `;
        }

        if (withLibrary) {
            return `
                'label'
                'sub-label'
            `;
        }

        return "'label'";
    } else {
        if (withPreview) {
            if (withLibrary) {
                return `
                    'preview label'
                    'preview sub-label'
                `;
            }

            return `
                'preview label'
            `;
        }

        if (withLibrary) {
            return `
                'label'
                'sub-label'
            `;
        }

        return "'label'";
    }
};

const marginBySize: Record<PreviewSize, string> = {
    [PreviewSize.tiny]: '0.3rem',
    [PreviewSize.small]: '0.5rem',
    [PreviewSize.medium]: '0.8rem',
    [PreviewSize.big]: '0.8rem'
};

const Wrapper = styled.div<IWrapperProps>`
    border-left: 5px solid ${props => props.recordColor || 'transparent'};
    display: grid;
    grid-template-areas: ${props => _getGridTemplateAreas(props.withPreview, props.withLibrary, props.tile)};}};

    grid-template-columns:
        ${props => {
            if (!props.withPreview || props.tile) {
                return '100%';
            }

            const previewSize = getPreviewSize(props.size, props?.simplistic ?? false);
            const previewColSize = `calc(${previewSize} + calc(2*${marginBySize[props.size]}))`;
            return `${previewColSize} calc(100% - ${previewColSize})`;
        }}
`;
Wrapper.displayName = 'Wrapper';

const PreviewWrapper = styled.div<{tile: boolean; size: PreviewSize}>`
    grid-area: preview;
    margin: ${props => (props.tile ? '0.3rem 0' : `0 ${marginBySize[props.size]}`)};
    justify-self: center;
`;

const RecordLabel = styled.div<{simplistic: boolean; withLibrary: boolean}>`
    grid-area: label;
    font-weight: bold;
    overflow: hidden;
    align-self: ${props => (props.simplistic || !props.withLibrary ? 'center' : 'end')};
    line-height: 1.3em;
`;

const SubLabel = styled.div`
    grid-area: sub-label;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9em;
    line-height: 1.3em;
`;

const _getPreviewBySize = (preview?: IRecordIdentityPreview, size?: PreviewSize) => {
    const fileSizeByPreviewSize: {[size in PreviewSize]: string} = {
        [PreviewSize.tiny]: 'tiny',
        [PreviewSize.small]: 'tiny',
        [PreviewSize.medium]: 'small',
        [PreviewSize.big]: 'medium'
    };

    const previewPath: string = preview?.[fileSizeByPreviewSize[size]] ?? preview?.small;

    return previewPath ?? '';
};

const RecordCard = ({
    record,
    size,
    style,
    previewStyle,
    lang,
    withPreview = true,
    withLibrary = true,
    tile = false,
    simplistic = false
}: IRecordCardProps): JSX.Element => {
    const label = record.label || record.id;
    const {lang: userLang} = useLang();

    return (
        <Wrapper
            recordColor={record.color ?? ''}
            style={style}
            className="record-card"
            size={size}
            withPreview={withPreview}
            withLibrary={withLibrary}
            tile={tile}
            simplistic={simplistic}
        >
            {withPreview && (
                <PreviewWrapper className="preview" tile={tile} size={size}>
                    <RecordPreview
                        label={record.label || record.id}
                        color={record.color}
                        image={_getPreviewBySize(record.preview, size)}
                        size={size}
                        style={previewStyle}
                        tile={tile}
                        simplistic={simplistic}
                    />
                </PreviewWrapper>
            )}
            <RecordLabel className="label" simplistic={simplistic} withLibrary={withLibrary}>
                <Paragraph ellipsis={{rows: 1, tooltip: label}} style={{marginBottom: 0, color: style?.color ?? null}}>
                    {label}
                </Paragraph>
            </RecordLabel>
            {withLibrary && (
                <SubLabel className="library-label">
                    {localizedTranslation(record.library?.label, lang ?? userLang) || record.library?.id}
                </SubLabel>
            )}
        </Wrapper>
    );
};

export default RecordCard;
