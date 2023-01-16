// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Skeleton} from 'antd';
import styled, {CSSObject} from 'styled-components';

const CustomSkeletonImage = styled(Skeleton.Image)`
    &&& {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;

        .ant-skeleton-image-svg {
            width: 30%;
            height: 30%;
        }
    }
`;

interface IImageLoadingProps {
    style?: CSSObject;
}

function ImageLoading({style}: IImageLoadingProps): JSX.Element {
    // Setting the className manually is a workaround for a probable bug in antd: the active flag is not allowed by TS
    // and ignored at runtime. Check this when upgrading antd (written at v4.20.4).
    return <CustomSkeletonImage style={{...style}} className="ant-skeleton-active" />;
}

export default ImageLoading;
