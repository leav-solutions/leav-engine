// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled, {CSSObject} from 'styled-components';
import {SidebarContentType} from '_ui/types/search';
import FiltersPanel from '../FiltersPanel';
import useSearchReducer from '../hooks/useSearchReducer';
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

function Sidebar(): JSX.Element {
    const {state} = useSearchReducer();
    const {visible, type} = state.sideBar;

    return (
        <Wrapper $visible={visible} className={visible ? 'wrapped-filter-open' : 'wrapped-filter-close'}>
            {visible && type === SidebarContentType.filters && <FiltersPanel />}
            {visible && type === SidebarContentType.view && <ViewPanel />}
            {visible && type === SidebarContentType.versions && <VersionsPanel />}
        </Wrapper>
    );
}

export default Sidebar;
