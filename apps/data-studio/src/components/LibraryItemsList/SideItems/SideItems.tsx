// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useAppSelector} from 'reduxStore/store';
import styled, {CSSObject} from 'styled-components';
import {TypeSideItem} from '../../../_types/types';
import FiltersPanel from '../FiltersPanel';
import VersionsPanel from '../VersionsPanel';
import ViewPanel from '../ViewPanel';

interface IWrapperProps {
    $visible: boolean;
    style?: CSSObject;
}

const Wrapper = styled.div<IWrapperProps>`
    grid-area: side;
    display: ${({$visible}) => ($visible ? 'flex' : 'none')};
    position: relative;
    height: calc(100vh - 7rem);
    overflow: hidden;

    &.wrapped-filter-open {
        animation-name: filter-animation-open;
        animation-duration: 1s;
        animation-timing-function: ease;
    }

    @keyframes filter-animation-open {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    &.wrapped-filter-close {
        animation-name: filter-animation-close;
        animation-duration: 1s;
        animation-timing-function: ease-out;
    }

    @keyframes filter-animation-close {
        from {
            /* transform: translate(0); */
            opacity: 1;
        }

        to {
            /* transform: translate(-50rem); */
            opacity: 0;
        }
    }
`;

function SideItems(): JSX.Element {
    const {visible, type} = useAppSelector(state => state.display.side);

    return (
        <Wrapper $visible={visible} className={visible ? 'wrapped-filter-open' : 'wrapped-filter-close'}>
            {visible && type === TypeSideItem.filters && <FiltersPanel />}
            {visible && type === TypeSideItem.view && <ViewPanel />}
            {visible && type === TypeSideItem.versions && <VersionsPanel />}
        </Wrapper>
    );
}

export default SideItems;
