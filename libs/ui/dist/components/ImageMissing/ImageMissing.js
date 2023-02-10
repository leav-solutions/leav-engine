import { jsx as _jsx } from "react/jsx-runtime";
import { PictureOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { themeVars } from '../../antdTheme';
const Wrapper = styled.div `
    &&& {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }
`;
function ImageMissing({ style }) {
    return (_jsx(Wrapper, { children: _jsx(PictureOutlined, { style: Object.assign({ display: 'flex', justifyContent: 'center', fontSize: style.height ? `calc(${style.height} * 0.6)` : '120px', color: themeVars.secondaryTextColor }, style) }) }));
}
export default ImageMissing;
//# sourceMappingURL=ImageMissing.js.map