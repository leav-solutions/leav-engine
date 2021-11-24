// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {resetNavigationRecordDetail} from 'redux/navigation';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {getTreeListQuery} from '../../graphQL/queries/trees/getTreeListQuery';
import {useActiveTree} from '../../hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from '../../hooks/LangHook/LangHook';
import {localizedTranslation} from '../../utils';
import {GET_TREE_LIST_QUERY, GET_TREE_LIST_QUERYVariables} from '../../_gqlTypes/GET_TREE_LIST_QUERY';
import {IBaseNotification, NotificationType, WorkspacePanels} from '../../_types/types';
import NavigationView from '../NavigationView';

interface INavigationProps {
    tree?: string;
}

function Navigation({tree}: INavigationProps): JSX.Element {
    const {t} = useTranslation();

    const dispatch = useAppDispatch();
    const {activePanel} = useAppSelector(state => state);

    const [{lang}] = useLang();
    const [activeTree, updateActiveTree] = useActiveTree();

    const {data, loading} = useQuery<GET_TREE_LIST_QUERY, GET_TREE_LIST_QUERYVariables>(getTreeListQuery, {
        variables: {treeId: tree},
        skip: !tree
    });

    useEffect(() => {
        if (activePanel !== WorkspacePanels.TREE) {
            return;
        }

        if (activeTree?.id !== tree) {
            dispatch(resetNavigationRecordDetail());
        }

        const currentTree = data?.trees?.list[0];
        if (!loading && currentTree) {
            const treeName = localizedTranslation(currentTree.label, lang);
            // set Active Tree Data
            updateActiveTree({
                id: currentTree.id,
                label: treeName,
                libraries: currentTree.libraries.map(lib => ({id: lib.library.id}))
            });

            const baseNotification: IBaseNotification = {
                content: t('notification.active-tree', {tree: treeName}),
                type: NotificationType.basic
            };

            dispatch(setNotificationBase(baseNotification));
        }
    }, [data, loading, lang, updateActiveTree, t, dispatch, activePanel, activeTree, tree]);

    return <NavigationView tree={tree} />;
}

export default Navigation;
