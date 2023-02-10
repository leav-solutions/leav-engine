import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { localizedTranslation } from '@leav/utils';
import Paragraph from 'antd/lib/typography/Paragraph';
import styled from 'styled-components';
import { PreviewSize } from '../../constants';
import { getPreviewSize } from '../../helpers/getPreviewSize';
import useLang from '../../hooks/useLang';
import { RecordPreview } from '../RecordPreview';
const _getGridTemplateAreas = (withPreview, withLibrary, tile) => {
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
    }
    else {
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
const marginBySize = {
    [PreviewSize.tiny]: '0.3rem',
    [PreviewSize.small]: '0.5rem',
    [PreviewSize.medium]: '0.8rem',
    [PreviewSize.big]: '0.8rem'
};
const Wrapper = styled.div `
    border-left: 5px solid ${props => props.recordColor || 'transparent'};
    display: grid;
    grid-template-areas: ${props => _getGridTemplateAreas(props.withPreview, props.withLibrary, props.tile)};}};

    grid-template-columns:
        ${props => {
    var _a;
    if (!props.withPreview || props.tile) {
        return '100%';
    }
    const previewSize = getPreviewSize(props.size, (_a = props === null || props === void 0 ? void 0 : props.simplistic) !== null && _a !== void 0 ? _a : false);
    const previewColSize = `calc(${previewSize} + calc(2*${marginBySize[props.size]}))`;
    return `${previewColSize} calc(100% - ${previewColSize})`;
}}
`;
Wrapper.displayName = 'Wrapper';
const PreviewWrapper = styled.div `
    grid-area: preview;
    margin: ${props => (props.tile ? '0.3rem 0' : `0 ${marginBySize[props.size]}`)};
    justify-self: center;
`;
const RecordLabel = styled.div `
    grid-area: label;
    font-weight: bold;
    overflow: hidden;
    align-self: ${props => (props.simplistic || !props.withLibrary ? 'center' : 'end')};
    line-height: 1.3em;
`;
const SubLabel = styled.div `
    grid-area: sub-label;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9em;
    line-height: 1.3em;
`;
const _getPreviewBySize = (preview, size) => {
    var _a;
    const fileSizeByPreviewSize = {
        [PreviewSize.tiny]: 'tiny',
        [PreviewSize.small]: 'tiny',
        [PreviewSize.medium]: 'small',
        [PreviewSize.big]: 'medium'
    };
    const previewPath = (_a = preview === null || preview === void 0 ? void 0 : preview[fileSizeByPreviewSize[size]]) !== null && _a !== void 0 ? _a : preview === null || preview === void 0 ? void 0 : preview.small;
    return previewPath !== null && previewPath !== void 0 ? previewPath : '';
};
const RecordCard = ({ record, size, style, previewStyle, lang, withPreview = true, withLibrary = true, tile = false, simplistic = false }) => {
    var _a, _b, _c, _d;
    const label = record.label || record.id;
    const { lang: userLang } = useLang();
    return (_jsxs(Wrapper, Object.assign({ recordColor: (_a = record.color) !== null && _a !== void 0 ? _a : '', style: style, className: "record-card", size: size, withPreview: withPreview, withLibrary: withLibrary, tile: tile, simplistic: simplistic }, { children: [withPreview && (_jsx(PreviewWrapper, Object.assign({ className: "preview", tile: tile, size: size }, { children: _jsx(RecordPreview, { label: record.label || record.id, color: record.color, image: _getPreviewBySize(record.preview, size), size: size, style: previewStyle, tile: tile, simplistic: simplistic }) }))), _jsx(RecordLabel, Object.assign({ className: "label", simplistic: simplistic, withLibrary: withLibrary }, { children: _jsx(Paragraph, Object.assign({ ellipsis: { rows: 1, tooltip: label }, style: { marginBottom: 0, color: (_b = style === null || style === void 0 ? void 0 : style.color) !== null && _b !== void 0 ? _b : null } }, { children: label })) })), withLibrary && (_jsx(SubLabel, Object.assign({ className: "library-label" }, { children: localizedTranslation((_c = record.library) === null || _c === void 0 ? void 0 : _c.label, lang !== null && lang !== void 0 ? lang : userLang) || ((_d = record.library) === null || _d === void 0 ? void 0 : _d.id) })))] })));
};
export default RecordCard;
//# sourceMappingURL=RecordCard.js.map