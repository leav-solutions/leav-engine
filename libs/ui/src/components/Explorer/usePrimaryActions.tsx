// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPrimaryAction} from './_types';
import {KitButton, KitSpace} from 'aristid-ds';

/**
 * Hook used to get the primary actions for `<DataView />` component.
 *
 * Based on default actions and custom actions, it returns a primary with first action as "main" action and the others
 * in the dropdown accessible via a split button.
 *
 * @param {Object[]} actions - list of actions to be display as one button: the primary action button
 */
export const usePrimaryActionsButton = (actions: IPrimaryAction[]) => {
    const [firstAction, ...dropdownActions] = actions;

    return {
        primaryButton:
            actions.length === 0 ? null : (
                <KitButton
                    type="primary"
                    icon={firstAction.icon}
                    onClick={firstAction.callback}
                    items={dropdownActions.map((action, index) => ({
                        key: index,
                        label: (
                            <KitSpace size={8}>
                                {action.icon} {action.label}
                            </KitSpace>
                        ),
                        onClick: action.callback
                    }))}
                >
                    {firstAction.label}
                </KitButton>
            )
    };
};