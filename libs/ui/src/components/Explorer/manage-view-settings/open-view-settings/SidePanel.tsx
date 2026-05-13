import {type ButtonHTMLAttributes, type FunctionComponent} from 'react';
import {KitSidePanel} from 'aristid-ds';
import {useEditSettings} from './useEditSettings';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const SidePanel: FunctionComponent = () => {
    const {t} = useSharedTranslation();

    const {activeSettings, closeSettingsPanel} = useEditSettings();

    if (!activeSettings) {
        return null;
    }

    // TODO: handle transition opening/closing on floating prop true

    const makeA11yBackButton: ButtonHTMLAttributes<HTMLButtonElement> = {
        title: String(t('explorer.back')) /* TODO: avoid transform null to 'null' */,
    };

    return (
        <KitSidePanel
            initialOpen
            floating
            closable
            closeOnEsc
            idCardProps={{title: activeSettings.title}}
            leftActionProps={
                activeSettings.onClickLeftButton
                    ? {onClick: activeSettings.onClickLeftButton, ...makeA11yBackButton}
                    : undefined
            }
            onClose={closeSettingsPanel}
        >
            {activeSettings.content}
        </KitSidePanel>
    );
};
