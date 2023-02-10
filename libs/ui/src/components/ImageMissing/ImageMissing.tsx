import {PictureOutlined} from '@ant-design/icons';
import styled, {CSSObject} from 'styled-components';
import {themeVars} from '../../antdTheme';

const Wrapper = styled.div`
    &&& {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }
`;

interface IImageMissingProps {
    style?: CSSObject;
}

function ImageMissing({style}: IImageMissingProps): JSX.Element {
    return (
        <Wrapper>
            <PictureOutlined
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: style.height ? `calc(${style.height} * 0.6)` : '120px',
                    color: themeVars.secondaryTextColor,
                    ...style
                }}
            />
        </Wrapper>
    );
}

export default ImageMissing;
