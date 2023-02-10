import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { getInitials, getInvertColor, stringToColor } from '@leav/utils';
import { useState } from 'react';
import styled from 'styled-components';
import { ImageLoading } from '../../ImageLoading';
import { ImageMissing } from '../../ImageMissing';
const ImagePreviewWrapper = styled.div `
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 0.25rem 0.25rem 0 0;
    width: fit-content;
    height: fit-content;
    margin: auto;

    img {
        object-fit: cover;
    }
`;
ImagePreviewWrapper.displayName = 'ImagePreviewTile';
const ImageComp = styled.img `
    display: ${p => (p.$loaded ? 'block' : 'none')};
`;
const GeneratedPreviewTile = styled.div `
    ${props => props.style || ''}
    background-color: ${props => props.bgColor};
    color: ${props => props.fontColor};
    font-size: 4em;
    padding: 5px;
    height: 10rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 0.25rem 0.25rem 0 0;
`;
GeneratedPreviewTile.displayName = 'GeneratedPreviewTile';
function RecordPreviewTile({ label, color, image, style }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    if (image) {
        return (_jsxs(ImagePreviewWrapper, Object.assign({ style: Object.assign({ position: 'relative' }, style) }, { children: [!imageLoaded && _jsx(ImageLoading, {}), !hasFailed ? (_jsx(ImageComp, { "$loaded": imageLoaded, src: image, alt: "record preview", style: Object.assign({}, style), onLoad: () => setImageLoaded(true), onError: () => {
                        setImageLoaded(true);
                        setHasFailed(true);
                    } })) : (_jsx(ImageMissing, { style: Object.assign({}, style) }))] })));
    }
    const bgColor = color || stringToColor(label);
    const fontColor = getInvertColor(bgColor);
    return (_jsx(GeneratedPreviewTile, Object.assign({ "data-testid": "generated-preview", className: "initial", bgColor: bgColor, fontColor: fontColor, style: style }, { children: getInitials(label) })));
}
export default RecordPreviewTile;
//# sourceMappingURL=RecordPreviewTile.js.map