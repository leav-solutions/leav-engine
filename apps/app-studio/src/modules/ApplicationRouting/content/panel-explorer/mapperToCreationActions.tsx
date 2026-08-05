import {type ComponentProps} from 'react';
import {type ExplorerV2, NEW_RECORD_ID} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {generatePath, type NavigateFunction} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type IconProp} from '@fortawesome/fontawesome-svg-core';
import {type CreationPanels} from '../../types';
import {RelativePaths} from '../../router/paths';

/**
 * Maps the library's ordered `creationPanels` config entries to the explorer's `primaryActions`:
 * each action navigates to its creation panel as a top-level creation (the `NEW_RECORD_ID`
 * sentinel fills the `:recordId` route slot), always in a popup (creation forms are forced to
 * popup by the `RedirectCreationFormPanelToPopup` guard anyway).
 */
export const mapperToCreationActions = ({
    creationPanels,
    lang,
    navigate,
}: {
    creationPanels: CreationPanels;
    lang: string[];
    navigate: NavigateFunction;
}): ComponentProps<typeof ExplorerV2>['primaryActions'] =>
    creationPanels.map(panel => {
        // As suggested by FontAwesome documentation, we need this workaround to use the string notation
        // More info: https://docs.fontawesome.com/web/use-with/react/add-icons#workaround
        // @ts-expect-error: Type 'string' is not assignable to type 'IconProp'
        const icon: IconProp = `fa-solid ${panel.icon}`;

        return {
            icon: <FontAwesomeIcon icon={icon} />,
            label: localizedTranslation(panel.name, lang),
            callback: () =>
                navigate(
                    generatePath(RelativePaths.nextLevelPanel, {
                        recordId: NEW_RECORD_ID,
                        where: 'popup',
                        recordPanelId: panel.id,
                    }),
                ),
        };
    });
