// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Typography} from 'antd';
import styled, {CSSObject} from 'styled-components';
import {getPreviewSize} from '_ui/_utils';
import {PreviewSize} from '../../constants';
import {EntityPreview} from '../EntityPreview';
import {IEntityData} from './_types';

interface IEntityCardProps {
    entity: IEntityData;
    size?: PreviewSize;
    style?: React.CSSProperties & CSSObject;
    previewStyle?: React.CSSProperties & CSSObject;
    tile?: boolean;
    simplistic?: boolean;
    withPreview?: boolean;
    withSubLabel?: boolean;
    withColor?: boolean;
}

interface IWrapperProps {
    $color: string | null;
    $size: PreviewSize;
    $withPreview: boolean;
    $withSubLabel: boolean;
    $withColor: boolean;
    $tile: boolean;
    style?: React.CSSProperties & CSSObject;
    $simplistic?: boolean;
}

const _getGridTemplateAreas = (withPreview: boolean, withSubLabel: boolean, tile: boolean): string => {
    if (tile) {
        if (withPreview) {
            if (withSubLabel) {
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

        if (withSubLabel) {
            return `
                'label'
                'sub-label'
            `;
        }

        return "'label'";
    } else {
        if (withPreview) {
            if (withSubLabel) {
                return `
                    'preview label'
                    'preview sub-label'
                `;
            }

            return `
                'preview label'
            `;
        }

        if (withSubLabel) {
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
    border-left: ${props => (props.$withColor ? `5px solid ${props.$color ? props.$color : 'transparent'}` : 'none')};
    display: grid;
    grid-template-areas: ${props => _getGridTemplateAreas(props.$withPreview, props.$withSubLabel, props.$tile)};

    grid-template-columns: ${props => {
        if (!props.$withPreview || props.$tile) {
            return '100%';
        }

        const previewSize = getPreviewSize(props.$size, props?.$simplistic ?? false);
        const previewColSize = `calc(${previewSize} + calc(2*${marginBySize[props.$size]}))`;
        return `${previewColSize} calc(100% - ${previewColSize})`;
    }};
`;

const PreviewWrapper = styled.div<{$tile: boolean; $size: PreviewSize}>`
    grid-area: preview;
    margin: ${props => (props.$tile ? '0.3rem 0' : `0 ${marginBySize[props.$size]}`)};
    justify-self: center;
`;

const EntityLabel = styled.div<{$simplistic: boolean; $withSubLabel: boolean}>`
    grid-area: label;
    font-weight: bold;
    overflow: hidden;
    align-self: ${props => (props.$simplistic || !props.$withSubLabel ? 'center' : 'end')};
    line-height: 1.3em;
`;

const SubLabel = styled.div`
    grid-area: sub-label;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9em;
    line-height: 1.3em;
`;

function EntityCard({
    entity,
    size = PreviewSize.medium,
    tile = false,
    simplistic = false,
    withColor = true,
    withSubLabel = true,
    withPreview = true,
    style,
    previewStyle
}: IEntityCardProps): JSX.Element {
    return (
        <Wrapper
            data-testid="entity-card"
            $color={entity.color}
            style={style}
            $size={size}
            $withPreview={withPreview}
            $withColor={withColor}
            $withSubLabel={withSubLabel}
            $tile={tile}
            $simplistic={simplistic}
        >
            {withPreview && (
                <PreviewWrapper className="preview" $tile={tile} $size={size}>
                    <EntityPreview
                        label={entity.label}
                        color={entity.color}
                        image={entity.preview}
                        size={size}
                        style={previewStyle}
                        tile={tile}
                        simplistic={simplistic}
                    />
                </PreviewWrapper>
            )}
            <EntityLabel className="label" $simplistic={simplistic} $withSubLabel={withSubLabel}>
                <Typography.Paragraph
                    ellipsis={{rows: 1, tooltip: entity.label}}
                    style={{marginBottom: 0, color: style?.color ?? null}}
                >
                    {entity.label}
                </Typography.Paragraph>
            </EntityLabel>
            {withSubLabel && <SubLabel className="sub-label">{entity.subLabel}</SubLabel>}
        </Wrapper>
    );
}

export default EntityCard;
