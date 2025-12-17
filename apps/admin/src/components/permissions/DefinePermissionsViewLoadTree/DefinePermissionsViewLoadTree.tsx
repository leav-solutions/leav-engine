// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {useTranslation} from 'react-i18next';
import {Header} from 'semantic-ui-react';
import {type ITreeNodeData} from '_types/trees';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import Loading from '../../shared/Loading';
import TreeExplorer from '../../trees/TreeExplorer';
import {useGetTreeByIdQuery} from '_gqlTypes';
import {type GET_TREE_BY_ID_trees_list} from '_gqlTypes/GET_TREE_BY_ID';

interface IDefinePermissionsViewLoadTreeProps {
    treeId: string;
    onClick: (nodeData: ITreeNodeData) => void;
    selectedNode: ITreeNodeData | null;
}

const DefinePermissionsViewLoadTree = ({
    treeId,
    onClick,
    selectedNode,
}: IDefinePermissionsViewLoadTreeProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const {loading, error, data} = useGetTreeByIdQuery({
        variables: {id: [treeId]},
    });

    if (loading) {
        return <Loading />;
    }

    if (error || !data?.trees) {
        return <ErrorDisplay message={error.message} />;
    }

    const treeData = data.trees.list[0];
    const treeLabel = localizedLabel(treeData.label, availableLanguages);

    return (
        <>
            <Header as="h4">{treeLabel}</Header>
            <TreeExplorer
                compact
                key={treeData.id}
                tree={treeData as GET_TREE_BY_ID_trees_list}
                onClickNode={onClick}
                selection={selectedNode ? [selectedNode] : null}
                readOnly
                withFakeRoot
                fakeRootLabel={t('permissions.any_entity', {
                    entityName: treeLabel,
                    interpolation: {escapeValue: false},
                })}
            />
        </>
    );
};

export default DefinePermissionsViewLoadTree;
