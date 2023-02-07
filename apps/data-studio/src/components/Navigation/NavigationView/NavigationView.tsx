// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect} from 'react';
import {setNavigationActiveTree} from 'reduxStore/navigation';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import Column from './Column';

const Page = styled.div`
    width: auto;
    height: calc(100vh - 3rem);
    display: flex;
    flex-flow: row nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
`;

interface INavigationViewProps {
    tree: string;
}

function NavigationView({tree: treeId}: INavigationViewProps): JSX.Element {
    const navigation = useAppSelector(state => state.navigation);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setNavigationActiveTree(treeId));
    }, [treeId, dispatch]);

    const currentColumnActive = navigation.path.length === 0;

    return (
        <Page>
            <Column treeElement={null} depth={0} isActive={currentColumnActive} key="__root__" />
            {navigation.path.map((pathPart, index) => (
                <Column
                    key={`${pathPart.record.id}`}
                    treeElement={pathPart}
                    depth={index + 1}
                    isActive={index === navigation.path.length - 1}
                />
            ))}
        </Page>
    );
}

export default NavigationView;
