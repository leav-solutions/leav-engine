import {type Panel} from '_ui/hooks/usePanelMessenger/types';

type CreationPanel = Extract<Panel, {type: 'creationForm' | 'customCreation'}>;

/** Both creation panel flavours: LEAV form (`creationForm`) and delegated iframe (`customCreation`). */
export const isCreationPanel = (panel: Panel | null): panel is CreationPanel =>
    panel?.type === 'creationForm' || panel?.type === 'customCreation';
