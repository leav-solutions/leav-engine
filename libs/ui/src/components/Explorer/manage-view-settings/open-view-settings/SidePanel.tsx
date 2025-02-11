// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ButtonHTMLAttributes, FunctionComponent} from 'react';
import {KitSidePanel} from 'aristid-ds';
import {useEditSettings} from './useEditSettings';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const SidePanel: FunctionComponent = () => {
    const {t} = useSharedTranslation();

    const {activeSettings, onClose} = useEditSettings();

    if (!activeSettings) {
        return null;
    }

    // TODO: handle transition opening/closing on floating prop true

    const makeA11yBackButton: ButtonHTMLAttributes<HTMLButtonElement> = {
        title: String(t('explorer.back')) /* TODO: avoid transform null to 'null' */
    };

    return (
        <KitSidePanel
            initialOpen
            floating
            closable
            closeOnEsc
            // TODO: à remettre en prenant en compte la Modal de Save As...
            // closeOnOutsideClick
            idCardProps={{title: activeSettings.title}}
            leftActionProps={
                activeSettings.onClickLeftButton
                    ? {onClick: activeSettings.onClickLeftButton, ...makeA11yBackButton}
                    : undefined
            }
            onClose={onClose}
        >
            {activeSettings.content}
        </KitSidePanel>
    );
};
