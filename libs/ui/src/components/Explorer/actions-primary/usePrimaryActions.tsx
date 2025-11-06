// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitDropDown} from 'aristid-ds';
import {type IPrimaryAction} from '../_types';
import {type IViewSettingsState} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

/**
 * Hook used to get the primary actions for `<DataView />` component.
 *
 * Based on default actions and custom actions, it returns a primary with first action as "main" action and the others
 * in the dropdown accessible via a split button.
 *
 * @param view - list of actions to be display as one button: the primary action button
 * @param actions - list of actions to be display as one button: the primary action button
 * @param hideFirstActionLabel - allows to hide its label when only one primary action
 */
export const usePrimaryActionsButton = ({
    view,
    actions,
    hideFirstActionLabel,
}: {
    view: IViewSettingsState;
    actions: IPrimaryAction[];
    hideFirstActionLabel: boolean;
}) => {
    const [firstAction] = actions;

    return {
        primaryButton:
            actions.length === 0 ? null : actions.length === 1 ? (
                <KitButton
                    type="primary"
                    size="m"
                    icon={firstAction.icon}
                    disabled={firstAction.disabled || view.massSelection === MASS_SELECTION_ALL}
                    onClick={firstAction.callback}
                >
                    {!hideFirstActionLabel && firstAction.label}
                </KitButton>
            ) : (
                <KitDropDown menu={{items: mapPrimaryActionsToMenuItems(actions, view)}} trigger={['click']}>
                    <KitButton
                        type="primary"
                        size="m"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        disabled={view.massSelection === MASS_SELECTION_ALL}
                        role="dropdown-trigger"
                    />
                </KitDropDown>
            ),
    };
};

const mapPrimaryActionsToMenuItems = (actions: IPrimaryAction[], view: IViewSettingsState) =>
    actions.map((action, index) => ({
        key: index,
        label: action.label,
        disabled: action.disabled || view.massSelection === MASS_SELECTION_ALL,
        onClick: action.callback,
    }));
