import {type FunctionComponent} from 'react';
import {TreeExplorer} from '../../../tree-explorer';

interface IPanelTreeExplorerProps {
    treeId: string;
}

export const PanelTreeExplorer: FunctionComponent<IPanelTreeExplorerProps> = ({treeId}) => (
    <TreeExplorer treeId={treeId} />
);
