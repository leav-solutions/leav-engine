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
 * When the creation is done, we refresh all data even if the new record will not be visible due to some filters.
 *
 * It returns also two parts : one for the call action button - one for displayed the modal required by the action.
 * It also returns the modal required for default actions (like create record).
 *
 * @param isEnabled - whether the action is present
 * @param library - the library's id to add new item
 * @param refetch - method to call to refresh the list. New item will be visible if it matches filters and sorts
 */
export const usePrimaryActionsButton = (actions: IPrimaryAction[]) => {
    const [mainAction, ...dropdownActions] = actions;

    return {
        primaryButton: mainAction ? (
            <KitButton
                type="primary"
                icon={mainAction.icon}
                onClick={mainAction.callback}
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
                {mainAction.label}
            </KitButton>
        ) : null
    };
};
