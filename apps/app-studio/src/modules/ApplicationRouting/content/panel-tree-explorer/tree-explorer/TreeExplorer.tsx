import {ErrorDisplay, ErrorDisplayTypes, Loading, useGetRecordUpdatesSubscription} from '@leav/ui';
import {useTranslation} from 'react-i18next';
import {NavigationView} from './NavigationView';
import {TreeExplorerStateProvider} from './store/TreeExplorerStateProvider';
import {useGetTreeForExplorerQuery} from '../../../../../__generated__';

/**
 * Column-based ("Miller columns") explorer of a LEAV tree, ported from the data-studio
 * `Navigation` feature. Self-contained: its navigation and selection state live in
 * `TreeExplorerStateProvider` (no Redux).
 */
export const TreeExplorer = ({treeId}: {treeId: string}) => {
    const {t} = useTranslation();

    const {data, loading, error} = useGetTreeForExplorerQuery({variables: {treeId}, skip: !treeId});

    const tree = data?.trees?.list[0];
    const hasAccess = tree?.permissions.access_tree;

    useGetRecordUpdatesSubscription({libraries: (tree?.libraries ?? []).map(lib => lib.library.id)}, !tree);

    if (loading) {
        return <Loading data-testid="loading" />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!tree) {
        return <ErrorDisplay message={t('tree_explorer.tree_not_found')} />;
    }

    if (!hasAccess) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    return (
        <TreeExplorerStateProvider activeTree={tree}>
            <NavigationView />
        </TreeExplorerStateProvider>
    );
};
