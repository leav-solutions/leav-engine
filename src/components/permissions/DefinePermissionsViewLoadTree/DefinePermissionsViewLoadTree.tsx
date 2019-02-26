import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {NodeData} from 'react-sortable-tree';
import {Header} from 'semantic-ui-react';
import {getTreesQuery, TreesQuery} from '../../../queries/trees/getTreesQuery';
import {localizedLabel} from '../../../utils/utils';
import Loading from '../../shared/Loading';
import TreeStructure from '../../trees/TreeStructure';

interface IDefinePermissionsViewLoadTreeProps extends WithNamespaces {
    treeId: string;
    onClick: (nodeData: NodeData) => void;
    selectedNode: NodeData | null;
}

function DefinePermissionsViewLoadTree({
    treeId,
    onClick,
    selectedNode,
    i18n
}: IDefinePermissionsViewLoadTreeProps): JSX.Element {
    return (
        <TreesQuery query={getTreesQuery} variables={{id: treeId}}>
            {({loading, error, data}) => {
                if (loading) {
                    return <Loading />;
                }

                if (!data || data.trees === null) {
                    return <p>Unknown tree</p>;
                }

                const treeData = data.trees[0];

                return (
                    <React.Fragment>
                        <Header as="h4">{localizedLabel(treeData.label, i18n)}</Header>
                        <TreeStructure
                            key={treeData.id}
                            treeId={treeData.id}
                            onClickNode={onClick}
                            selection={selectedNode ? [selectedNode] : null}
                            readOnly
                            withFakeRoot
                        />
                    </React.Fragment>
                );
            }}
        </TreesQuery>
    );
}

export default withNamespaces()(DefinePermissionsViewLoadTree);
