import {useQuery} from '@apollo/client';
import {Spin} from 'antd';
import React from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {
    getTreeContentQuery,
    IGetTreeContentQuery,
    IGetTreeContentQueryVar
} from '../../queries/trees/getTreeContentQuery';
import ColumnNavigation from '../ColumnNavigation';

const Page = styled.div`
    width: 100vw;
    height: calc(100vh - 3rem);
    display: grid;
    grid-template-columns: repeat(auto-fit, 15rem);
`;

interface INavigationParams {
    treeId: string;
}

function NavigationView(): JSX.Element {
    const {stateNavigation} = useStateNavigation();

    const {treeId} = useParams<INavigationParams>();

    const depth = stateNavigation.path.length + 1; // add 1 to depth to count children

    const {data, loading, error} = useQuery<IGetTreeContentQuery, IGetTreeContentQueryVar>(getTreeContentQuery(depth), {
        variables: {
            treeId
        }
    });

    if (error) {
        return <>error</>;
    }

    return (
        <Page>
            {data && <ColumnNavigation treeElements={data.treeContent} />}
            {loading && <Spin />}
        </Page>
    );
}

export default NavigationView;
