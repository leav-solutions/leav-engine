import {useContext} from 'react';
import {type ITreeExplorerContextValue, TreeExplorerStateContext} from './TreeExplorerStateContext';

export const useTreeExplorerState = (): ITreeExplorerContextValue => {
    const context = useContext(TreeExplorerStateContext);
    if (context === null) {
        throw new Error('useTreeExplorerState must be used within a TreeExplorerStateProvider');
    }
    return context;
};
