// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Tab, TabProps} from 'semantic-ui-react';
import styled from 'styled-components';

const GridTabElem = styled(Tab)`
    display: grid;
    grid-template-rows: 4rem minmax(500px, 1fr);
`;
GridTabElem.displayName = 'Tab';

function GridTab(props: TabProps): JSX.Element {
    return <GridTabElem {...props} />;
}

export default GridTab;
