import {Column} from './Column/Column';
import {useTreeExplorerState} from './store/useTreeExplorerState';
import {page} from './navigationView.module.css';

export const NavigationView = () => {
    const {activeTree, path} = useTreeExplorerState();

    const currentColumnActive = path.length === 0;

    return (
        <div className={page}>
            <Column treeId={activeTree.id} treeElement={null} depth={0} isActive={currentColumnActive} key="__root__" />
            {path.map((pathPart, index) => (
                <Column
                    treeId={activeTree.id}
                    key={pathPart.record.id}
                    treeElement={pathPart}
                    depth={index + 1}
                    isActive={index === path.length - 1}
                />
            ))}
        </div>
    );
};
