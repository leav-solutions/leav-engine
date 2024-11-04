// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';

interface IDimmerProps {
    onClick: () => void;
}

const DimmerElem = styled.div`
    position: fixed;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.2);
`;

function Dimmer({onClick}: IDimmerProps): JSX.Element {
    const _handleClick = () => onClick();

    return <DimmerElem data-testid="dimmer" onClick={_handleClick} />;
}

export default Dimmer;
