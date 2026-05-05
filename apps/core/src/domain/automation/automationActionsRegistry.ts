// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type AwilixContainer} from 'awilix';
import {type IAutomationAction, type AutomationRuleActions} from './actions/_types';

export interface IAutomationActionsRegistry {
    getAction(type: AutomationRuleActions | string): IAutomationAction | undefined;
    listAvailableActions(): IAutomationAction[];
}

export interface IAutomationActionsRegistryDeps {
    'core.depsManager': AwilixContainer;
}

const ACTION_MODULE_DISCOVERY_REGEX = /^core\.domain\.automation\.actions\.[^.]+$/;

export default function ({
    'core.depsManager': depsManager,
}: IAutomationActionsRegistryDeps): IAutomationActionsRegistry {
    let _actionsRegistry: Map<string, IAutomationAction>;

    const _getActionsRegistry = (): Map<string, IAutomationAction> => {
        if (_actionsRegistry !== undefined) {
            return _actionsRegistry;
        }

        const coreActions: IAutomationAction[] = Object.keys(depsManager.registrations)
            .filter(modName => modName.match(ACTION_MODULE_DISCOVERY_REGEX))
            .map(modName => depsManager.cradle[modName]);

        logger.verbose('Loaded pipeline actions: ' + coreActions.map(a => a.type).join(', '));
        _actionsRegistry = new Map(coreActions.map(action => [action.type, action]));
        return _actionsRegistry;
    };

    return {
        getAction(type): IAutomationAction | undefined {
            return _getActionsRegistry().get(type);
        },
        listAvailableActions() {
            return [..._getActionsRegistry().values()];
        },
    };
}
