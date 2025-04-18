// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PictureOutlined} from '@ant-design/icons';
import styled from 'styled-components';
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
    style?: React.CSSProperties;
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
