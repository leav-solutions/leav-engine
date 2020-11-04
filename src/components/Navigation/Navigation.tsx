import {useQuery} from '@apollo/client';
import React, {useEffect, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import {StateNavigationContext} from '../../Context/StateNavigationContext';
import {useActiveTree} from '../../hook/ActiveTreeHook';
import {useLang} from '../../hook/LangHook';
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

    const [{lang}] = useLang();
    const [, updateActiveTree] = useActiveTree();

    const {data, loading} = useQuery<IGetTreeListQuery, IGetTreeListQueryVar>(getTreeListQuery, {
        variables: {treeId}
    });

    useEffect(() => {
        const currentTree = data?.trees.list[0];
        if (!loading && currentTree) {
            // set Active Tree Data

            updateActiveTree({
                id: currentTree.id,
                label: localizedLabel(currentTree.label, lang),
                libraries: currentTree.libraries.map(lib => ({id: lib.id}))
            });
        }
    }, [data, loading, lang, updateActiveTree]);

    return (
        <StateNavigationContext.Provider value={{stateNavigation: state, dispatchNavigation: dispatch}}>
            <NavigationView />
        </StateNavigationContext.Provider>
    );
}

export default Navigation;
