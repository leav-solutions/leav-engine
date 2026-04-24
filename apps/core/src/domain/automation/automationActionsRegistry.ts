// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type AwilixContainer} from 'awilix';
import {type IAutomationAction} from './actions/_types';

export interface IAutomationActionsRegistry {
    getAction(type: string): IAutomationAction;
    listAvailableActions(): IAutomationAction[];
}

export interface IAutomationActionsRegistryDeps {
    'core.depsManager': AwilixContainer;
}

const ACTION_MODULE_DISCOVERY_REGEX = /^core\.domain\.automation\.actions\.[^.]+$/;

export default function ({
    'core.depsManager': depsManager,
}: IAutomationActionsRegistryDeps): IAutomationActionsRegistry {
    const loadedActionRegistry: Map<string, IAutomationAction> = new Map();
    const _loadActionsOnDemand = (): Map<string, IAutomationAction> => {
        if (loadedActionRegistry.size === 0) {
            const coreActions: IAutomationAction[] = Object.keys(depsManager.registrations)
                .filter(modName => modName.match(ACTION_MODULE_DISCOVERY_REGEX))
                .map(modName => depsManager.cradle[modName]);

            logger.verbose('Loaded pipeline actions: ' + coreActions.map(a => a.type).join(', '));
            coreActions.forEach(action => loadedActionRegistry.set(action.type, action));
        }
        return loadedActionRegistry;
    };

    return {
        getAction(type: string): IAutomationAction {
            const actions = _loadActionsOnDemand();
            const action = actions.get(type);
            if (!action) {
                throw new Error(`Action "${type}" not found in registry`);
            }
            return action;
        },
        listAvailableActions() {
            return [..._loadActionsOnDemand().values()];
        },
    };
}
