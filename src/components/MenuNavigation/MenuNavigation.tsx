import {Breadcrumb} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {resetRecordDetail, setPath} from '../../Reducer/NavigationReducer';
import themingVar from '../../themingVar';
import {INavigationPath} from '../../_types/types';

const Menu = styled.div`
    height: 3rem;
    border-bottom: 1px solid ${themingVar['@divider-color']};

    display: flex;
    align-items: center;
    padding-left: 1rem;
`;

const MenuItem = styled.span`
    &:hover {
        color: #000;
    }
`;

function MenuNavigation(): JSX.Element {
    const {stateNavigation, dispatchNavigation} = useStateNavigation();

    const goToPath = (pathPart: INavigationPath) => {
        // flag to stop after reach current pax th
        let end = false;
        const newPath = stateNavigation.path.reduce((acc, part) => {
            if (!end) {
                if (part.id === pathPart.id && part.library === pathPart.library) {
                    end = true;
                }
                return [...acc, part];
            }
            return acc;
        }, [] as INavigationPath[]);

        dispatchNavigation(setPath(newPath));
        dispatchNavigation(resetRecordDetail());
    };

    return (
        <Menu>
            <Breadcrumb>
                {stateNavigation.path.map(pathPart => (
                    <Breadcrumb.Item onClick={() => goToPath(pathPart)} key={pathPart.id}>
                        <MenuItem>{pathPart.label || pathPart.id}</MenuItem>
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        </Menu>
    );
}

export default MenuNavigation;
