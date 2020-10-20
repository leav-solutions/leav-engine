import {useApolloClient, useQuery} from '@apollo/client';
import React, {useEffect, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import {StateNavigationContext} from '../../Context/StateNavigationContext';
import {getActiveTree, IGetActiveTree} from '../../queries/cache/activeTree/getActiveTreeQuery';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getTreeListQuery, IGetTreeListQuery, IGetTreeListQueryVar} from '../../queries/trees/getTreeListQuery';
import {NavigationReducer, NavigationReducerInitialState} from '../../Reducer/NavigationReducer';
import {localizedLabel} from '../../utils';
import NavigationView from '../NavigationView';

interface INavigationParams {
    treeId: string;
}

function Navigation(): JSX.Element {
    const {treeId} = useParams<INavigationParams>();

    const [state, dispatch] = useReducer(NavigationReducer, NavigationReducerInitialState);

    const client = useApolloClient();

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const {data, loading} = useQuery<IGetTreeListQuery, IGetTreeListQueryVar>(getTreeListQuery, {
        variables: {treeId}
    });

    useEffect(() => {
        const currentTree = data?.trees.list[0];
        if (!loading && currentTree) {
            // set Active Tree Data
            client.writeQuery<IGetActiveTree>({
                query: getActiveTree,
                data: {
                    activeTree: {
                        id: currentTree.id,
                        label: localizedLabel(currentTree.label, lang),
                        libraries: currentTree.libraries.map(lib => ({id: lib.id}))
                    }
                }
            });
        }
    }, [data, loading, client, lang]);

    return (
        <StateNavigationContext.Provider value={{stateNavigation: state, dispatchNavigation: dispatch}}>
            <NavigationView />
        </StateNavigationContext.Provider>
    );
}

export default Navigation;
