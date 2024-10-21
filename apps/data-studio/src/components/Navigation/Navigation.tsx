// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {ErrorDisplay, ErrorDisplayTypes, Loading, useGetRecordUpdatesSubscription, useLang} from '@leav/ui';
import {useApplicationContext} from 'context/ApplicationContext';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setInfoBase} from 'reduxStore/infos';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {GET_TREES, GET_TREESVariables} from '_gqlTypes/GET_TREES';
import {useActiveTree} from 'hooks/useActiveTree';
import {isTreeInApp, localizedTranslation} from '../../utils';
import {IBaseInfo, InfoType, WorkspacePanels} from '../../_types/types';
import NavigationView from './NavigationView';

interface INavigationProps {
    tree?: string;
}

function Navigation({tree}: INavigationProps): JSX.Element {
    const {t} = useTranslation();

    const appData = useApplicationContext();

    const dispatch = useAppDispatch();
    const {activePanel} = useAppSelector(state => state);

    const {lang} = useLang();
    const [activeTree, updateActiveTree] = useActiveTree();

    const {data, loading, error} = useQuery<GET_TREES, GET_TREESVariables>(getTreeListQuery, {
        variables: {
            filters: {id: [tree]}
        },
        skip: !tree
    });

    const treeData = data?.trees?.list[0];
    const hasAccess = data?.trees?.list[0]?.permissions.access_tree;
    const isInApp = isTreeInApp(appData.currentApp, tree);

    useGetRecordUpdatesSubscription(
        {libraries: (treeData?.libraries ?? []).map(lib => lib.library.id)},
        !treeData || !isInApp
    );

    useEffect(() => {
        if (activePanel !== WorkspacePanels.TREE || !hasAccess) {
            return;
        }

        const currentTree = data?.trees?.list[0];
        if (!loading && currentTree) {
            const treeName = localizedTranslation(currentTree.label, lang);
            // set Active Tree Data
            updateActiveTree({
                id: currentTree.id,
                label: treeName,
                behavior: currentTree.behavior,
                libraries: currentTree.libraries.map(lib => ({id: lib.library.id, behavior: lib.library.behavior})),
                permissions: currentTree.permissions
            });

            const baseInfo: IBaseInfo = {
                content: t('info.active-tree', {
                    tree: treeName,
                    appLabel: localizedTranslation(appData.currentApp.label, lang),
                    interpolation: {escapeValue: false}
                }),
                type: InfoType.basic
            };

            dispatch(setInfoBase(baseInfo));
        }
    }, [data, loading, lang, updateActiveTree, t, dispatch, activePanel, activeTree, tree, hasAccess]);

    if (loading) {
        return <Loading data-testid="loading" />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!hasAccess) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    if (!isInApp) {
        return <ErrorDisplay message={t('navigation.not_in_app')} />;
    }

    return <NavigationView tree={tree} />;
}

export default Navigation;
