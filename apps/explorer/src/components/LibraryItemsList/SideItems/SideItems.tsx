// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {panelSize} from '../../../constants/constants';
import {useStateItem} from '../../../Context/StateItemsContext';
import {TypeSideItem} from '../../../_types/types';
import FiltersPanel from '../FiltersPanel';
import ViewPanel from '../ViewPanel';

interface IWrapperProps {
    visible: boolean;
    style?: CSSObject;
}

const Wrapper = styled.div<IWrapperProps>`
    display: ${({visible}) => (visible ? 'flex' : 'none')};
    position: relative;
    height: calc(100vh - 7rem);
    animation: ${({visible}) => (visible ? 'slide-in 250ms ease' : 'none')};

    @keyframes slide-in {
        from {
            transform: translateX(-${panelSize});
        }
        to {
            transform: translateX(0rem);
        }
    }
`;

function SideItems(): JSX.Element {
    const {stateItems} = useStateItem();

    return (
        <Wrapper
            visible={stateItems.sideItems.visible}
            className={stateItems.sideItems.visible ? 'wrapped-filter-open' : 'wrapped-filter-close'}
        >
            {stateItems.sideItems.visible && stateItems.sideItems.type === TypeSideItem.filters && <FiltersPanel />}
            {stateItems.sideItems.visible && stateItems.sideItems.type === TypeSideItem.view && <ViewPanel />}
        </Wrapper>
    );
}

export default SideItems;
