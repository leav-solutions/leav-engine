import useLocalStorage from '../../../hooks/useLocalStorage';
import styled from 'styled-components';
import {NavigationMenu} from '../../../modules/navigation-menu/NavigationMenu';
import Header from '../Header';
import {InitAdminRouter} from '../../../modules/routes/InitAdminRouter';

const headerHeight = '3rem';

const Content = styled.div`
    grid-area: content;
    height: calc(100vh - ${headerHeight});
    overflow-y: auto;
    padding: calc(var(--general-spacing-m) * 1px);
    background-color: var(--general-colors-primary-50);
`;

const HeaderWrapper = styled.div`
    grid-area: header;
`;

const HomeWrapper = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: ${headerHeight} 1fr;
    grid-template-areas:
        'header header'
        'sidebar content';
    transition: grid-template-columns 0.3s ease-in-out;
`;

function Home(): JSX.Element {
    const [isMenuCollapsed, setMenuCollapsed] = useLocalStorage('menu_collapsed', false);

    const _handleToggleMenu = () => {
        setMenuCollapsed(!isMenuCollapsed);
    };

    return (
        <HomeWrapper>
            <HeaderWrapper>
                <Header />
            </HeaderWrapper>
            <NavigationMenu isOpen={!isMenuCollapsed} onOpenChanged={_handleToggleMenu} />
            <Content className="content flex-col" style={{overflowX: 'auto'}}>
                <InitAdminRouter />
            </Content>
        </HomeWrapper>
    );
}

export default Home;
