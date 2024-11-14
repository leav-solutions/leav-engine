import {FunctionComponent} from 'react';
import {KitSidePanel} from 'aristid-ds';
import {Explorer} from '@leav/ui';

export const ExplorerSettingsSidePanel: FunctionComponent = () => {
    // TODO: handle conflict with app side panel
    const {activeSettings, onClose} = Explorer.useEditSettings();

    if (!activeSettings) {
        return null;
    }

    // TODO: handle transition opening/closing on floating prop true

    return (
        <KitSidePanel
            initialOpen
            floating
            closable
            idCardProps={{title: activeSettings.title}}
            leftActionProps={activeSettings.onClickLeftButton ? {onClick: activeSettings.onClickLeftButton} : undefined}
            onClose={onClose}
        >
            {activeSettings.content}
        </KitSidePanel>
    );
};
