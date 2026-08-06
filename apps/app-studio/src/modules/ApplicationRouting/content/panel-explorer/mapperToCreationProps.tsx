import {type ComponentProps} from 'react';
import {type ExplorerV2, NEW_RECORD_ID} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {generatePath, type NavigateFunction} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type IconProp} from '@fortawesome/fontawesome-svg-core';
import {type CreationPanels} from '../../types';
import {RelativePaths} from '../../router/paths';
import {INIIAL_VALUES_QUERY_PARAMS} from '../panel-custom/message-handlers/useNavigateToPanel';

// Stable reference: disables the explorer built-in `create` when `creationPanels` are declared.
const NO_DEFAULT_PRIMARY_ACTIONS: Array<'create'> = [];

/**
 * Maps the library's ordered `creationPanels` config entries to the explorer's creation props:
 * each entry becomes a `primaryActions` item navigating to its creation panel as a top-level
 * creation (the `NEW_RECORD_ID` sentinel fills the `:recordId` route slot), always in a popup
 * (creation panels are forced to popup by the `RedirectCreationPanelToPopup` guard anyway), and
 * `defaultPrimaryActions` disables the explorer built-in `create`. Without any declared entry,
 * returns no props at all so the built-in `create` stays untouched.
 */
export const mapperToCreationProps = ({
    creationPanels,
    lang,
    navigate,
    initialValues,
}: {
    creationPanels: CreationPanels;
    lang: string[];
    navigate: NavigateFunction;
    // Link context of the opener (e.g. an attribute explorer): forwarded as the `formInitialValues`
    // query param — consumed at record creation by the form flavour (`EditRecordPage`), passed
    // through as-is to the iframe by the `customCreation` flavour.
    initialValues?: Record<string, string[]>;
}): Pick<ComponentProps<typeof ExplorerV2>, 'primaryActions' | 'defaultPrimaryActions'> => {
    if (creationPanels.length === 0) {
        return {};
    }

    const search = initialValues
        ? `?${INIIAL_VALUES_QUERY_PARAMS}=${encodeURIComponent(JSON.stringify(initialValues))}`
        : '';

    const primaryActions = creationPanels.map(panel => {
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
                    }) + search,
                ),
        };
    });

    return {primaryActions, defaultPrimaryActions: NO_DEFAULT_PRIMARY_ACTIONS};
};
