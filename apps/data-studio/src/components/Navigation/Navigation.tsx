// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useApplicationContext} from 'context/ApplicationContext';
import useGetTreesListQuery from 'hooks/useGetTreesListQuery/useGetTreesListQuery';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setInfoBase} from 'reduxStore/infos';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {useActiveTree} from '../../hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from '../../hooks/LangHook/LangHook';
import {localizedTranslation} from '../../utils';
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

    const [{lang}] = useLang();
    const [activeTree, updateActiveTree] = useActiveTree();

    const {data, loading, error} = useGetTreesListQuery({onlyAllowed: false, treeId: tree, skip: !tree});
    const hasAccess = data?.trees?.list[0]?.permissions.access_tree;

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
                libraries: currentTree.libraries.map(lib => ({id: lib.library.id})),
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
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!hasAccess) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    return <NavigationView tree={tree} />;
}

export default Navigation;
