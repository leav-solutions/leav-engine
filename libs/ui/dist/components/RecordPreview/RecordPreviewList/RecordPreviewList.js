import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { getInitials, getInvertColor, stringToColor } from '@leav/utils';
import { Skeleton } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';
import { getPreviewSize } from '../../../helpers/getPreviewSize';
import SimplisticRecordPreview from './SimplisticRecordPreview';
const GeneratedPreview = styled.div `
    ${props => props.style || ''}
    background-color: ${props => props.bgColor};
    color: ${props => props.fontColor};
    font-size: ${({ size }) => `calc(${getPreviewSize(size)} / 2.5)`};
    height: ${({ size }) => getPreviewSize(size)};
    width: ${({ size }) => getPreviewSize(size)};
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 50%;
`;
GeneratedPreview.displayName = 'GeneratedPreview';
const ImagePreview = styled.div `
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${({ size }) => getPreviewSize(size)};
    width: ${({ size }) => getPreviewSize(size)};
    overflow: hidden;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;
ImagePreview.displayName = 'ImagePreview';
const Image = styled.img `
    display: ${p => (p.$loaded ? 'block' : 'none')};
`;
function RecordPreviewList({ label, color, image, size, style, simplistic = false }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    if (simplistic) {
        return _jsx(SimplisticRecordPreview, { label: label });
    }
    if (image) {
        return (_jsxs(ImagePreview, Object.assign({ size: size, style: style }, { children: [!imageLoaded && (_jsx(Skeleton.Image, { style: {
                        width: '65%',
                        height: '65%',
                        background: 'none',
                        margin: 'auto'
                    } })), _jsx(Image, { "$loaded": imageLoaded, src: image, alt: "record preview", onLoad: () => setImageLoaded(true), style: Object.assign({ maxHeight: 'auto', maxWidth: 'auto', width: '100%', height: '100%', objectFit: 'cover' }, style) })] })));
    }
    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);
    return (_jsx(GeneratedPreview, Object.assign({ "data-testid": "generated-preview", className: "initial", bgColor: bgColor, fontColor: fontColor, size: size, style: Object.assign({}, style) }, { children: getInitials(label) })));
}
export default RecordPreviewList;
//# sourceMappingURL=RecordPreviewList.js.map