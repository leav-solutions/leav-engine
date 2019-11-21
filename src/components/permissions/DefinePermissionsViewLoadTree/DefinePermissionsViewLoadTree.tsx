import React from 'react';
import {useTranslation} from 'react-i18next';
import {NodeData} from 'react-sortable-tree';
import {Header} from 'semantic-ui-react';
import {getTreesQuery, TreesQuery} from '../../../queries/trees/getTreesQuery';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import Loading from '../../shared/Loading';
import TreeStructure from '../../trees/TreeStructure';

interface IDefinePermissionsViewLoadTreeProps {
    treeId: string;
    onClick: (nodeData: NodeData) => void;
    selectedNode: NodeData | null;
}

/* tslint:disable-next-line:variable-name */
const DefinePermissionsViewLoadTree = ({
    treeId,
    onClick,
    selectedNode
}: IDefinePermissionsViewLoadTreeProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    return (
        <TreesQuery query={getTreesQuery} variables={{id: treeId}}>
            {({loading, error, data}) => {
                if (loading) {
                    return <Loading />;
                }

                if (!data || data.trees === null) {
                    return <p>Unknown tree</p>;
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
            }}
        </TreesQuery>
    );
};

export default DefinePermissionsViewLoadTree;
