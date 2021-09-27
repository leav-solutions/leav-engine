// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {StarFilled, StarOutlined} from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';

interface IFavoriteStarProps {
    isFavorite: boolean;
    onToggle: (wasFavorite: boolean) => void;
    hoverTrigger?: JSX.Element | string;
}

const Star = styled.span<Pick<IFavoriteStarProps, 'isFavorite' | 'hoverTrigger'>>`
    cursor: pointer;
    display: ${p => (p.isFavorite ? 'inline' : 'none')};

    ${p =>
        p.hoverTrigger
            ? `${p.hoverTrigger}:hover > & {
        display: inline;
    }`
            : ''}
`;

function FavoriteStar({isFavorite, onToggle, hoverTrigger}: IFavoriteStarProps): JSX.Element {
    const _handleClick = e => {
        e.stopPropagation();
        onToggle(isFavorite);
    };

    return (
        <Star onClick={_handleClick} isFavorite={isFavorite} hoverTrigger={hoverTrigger} data-testid="favorite-star">
            {isFavorite ? <StarFilled /> : <StarOutlined />}
        </Star>
    );
}

export default FavoriteStar;
