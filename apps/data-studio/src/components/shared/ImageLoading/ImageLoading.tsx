// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LoadingOutlined} from '@ant-design/icons';
import {Skeleton} from 'antd';
import React from 'react';
import styled, {CSSObject} from 'styled-components';

const CustomSkeletonImage = styled(Skeleton.Image)`
    &&& {
        height: 100%;
        width: 100%;

        .ant-skeleton-image-svg {
            width: 30%;
            height: 30%;
        }
    }
`;

const ImageSpinner = styled(LoadingOutlined)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 2em;
`;

interface IImageLoadingProps {
    style?: CSSObject;
}

function ImageLoading({style}: IImageLoadingProps): JSX.Element {
    return (
        <>
            <CustomSkeletonImage style={{...style}} />
            <ImageSpinner spin data-testid="image-loading" />
        </>
    );
}

export default ImageLoading;
