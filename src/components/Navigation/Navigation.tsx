import {useQuery} from '@apollo/client';
import React, {useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {StateNavigationContext} from '../../Context/StateNavigationContext';
import {useActiveTree} from '../../hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from '../../hooks/LangHook/LangHook';
import {useNotifications} from '../../hooks/NotificationsHook/NotificationsHook';
import {getTreeListQuery, IGetTreeListQuery, IGetTreeListQueryVar} from '../../queries/trees/getTreeListQuery';
import {NavigationReducer, NavigationReducerInitialState} from '../../Reducer/NavigationReducer';
import {localizedLabel} from '../../utils';
import {NotificationType} from '../../_types/types';
import NavigationView from '../NavigationView';

interface INavigationParams {
    treeId: string;
}

function Navigation(): JSX.Element {
    const {t} = useTranslation();
    const {treeId} = useParams<INavigationParams>();

    const [state, dispatch] = useReducer(NavigationReducer, NavigationReducerInitialState);

    const [{lang}] = useLang();
    const [, updateActiveTree] = useActiveTree();
    const {updateBaseNotification} = useNotifications();

    const {data, loading} = useQuery<IGetTreeListQuery, IGetTreeListQueryVar>(getTreeListQuery, {
        variables: {treeId}
    });

    useEffect(() => {
        const currentTree = data?.trees.list[0];
        if (!loading && currentTree) {
            const treeName = localizedLabel(currentTree.label, lang);
            // set Active Tree Data
            updateActiveTree({
                id: currentTree.id,
                label: treeName,
                libraries: currentTree.libraries.map(lib => ({id: lib.id}))
            });

            updateBaseNotification({
                content: t('notification.active-tree', {tree: treeName}),
                type: NotificationType.basic
            });
        }
    }, [data, loading, lang, updateActiveTree, t, updateBaseNotification]);

    return (
        <StateNavigationContext.Provider value={{stateNavigation: state, dispatchNavigation: dispatch}}>
            <NavigationView />
        </StateNavigationContext.Provider>
    );
}

export default Navigation;
