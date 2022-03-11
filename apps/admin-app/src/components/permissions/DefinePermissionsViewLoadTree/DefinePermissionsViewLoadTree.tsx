// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getTreeByIdQuery} from 'queries/trees/getTreeById';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header} from 'semantic-ui-react';
import {GET_TREE_BY_ID, GET_TREE_BY_IDVariables} from '_gqlTypes/GET_TREE_BY_ID';
import {ITreeNodeData} from '_types/trees';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import Loading from '../../shared/Loading';
import TreeStructure from '../../trees/TreeStructure';

interface IDefinePermissionsViewLoadTreeProps {
    treeId: string;
    onClick: (nodeData: ITreeNodeData) => void;
    selectedNode: ITreeNodeData | null;
}

const DefinePermissionsViewLoadTree = ({
    treeId,
    onClick,
    selectedNode
}: IDefinePermissionsViewLoadTreeProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const {loading, error, data} = useQuery<GET_TREE_BY_ID, GET_TREE_BY_IDVariables>(getTreeByIdQuery, {
        variables: {id: treeId}
    });

    if (loading) {
        return <Loading />;
    }

    if (error || !data?.trees) {
        return <ErrorDisplay message={error.message} />;
    }

    const treeData = data.trees.list[0];

    return (
        <>
            <Header as="h4">{localizedLabel(treeData.label, availableLanguages)}</Header>
            <TreeStructure
                key={treeData.id}
                tree={treeData}
                onClickNode={onClick}
                selection={selectedNode ? [selectedNode] : null}
                readOnly
                withFakeRoot
                fakeRootLabel={t('permissions.any_record')}
            />
        </>
    );
};

export default DefinePermissionsViewLoadTree;
