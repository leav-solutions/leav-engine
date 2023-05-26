// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    height: calc(100vh - ${themeVars.headerHeight});
    overflow-y: auto;
    padding: 1rem;
`;

interface ITabContentWrapperProps {
    children?: React.ReactNode;
}

function TabContentWrapper({children}: ITabContentWrapperProps): JSX.Element {
    return <Wrapper>{children}</Wrapper>;
}

export default TabContentWrapper;
