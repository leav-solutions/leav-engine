import {systemUserId} from '../../../../_constants/users';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {getCoreDep} from '../../integrationTestUtils';
import {type IAutomationActionsRegistry} from '../../../../domain/automation/automationActionsRegistry';
import {AutomationRuleActions} from '../../../../domain/automation/actions/_types';

describe('pipelineExecutor', () => {
    let actionsRegistry: IAutomationActionsRegistry;
    const ctx: IQueryInfos = {userId: systemUserId};

    beforeAll(async () => {
        actionsRegistry = getCoreDep<IAutomationActionsRegistry>('core.domain.automation.actionsRegistry');
    });

    describe('listAvailableActions', () => {
        it('should list available actions', async () => {
            const availableActions = actionsRegistry.listAvailableActions();
            expect(availableActions).toBeDefined();
            expect(availableActions.length).toBeGreaterThanOrEqual(3);
            expect(availableActions).toEqual(
                expect.arrayContaining([expect.objectContaining({type: AutomationRuleActions.CONDITION})]),
            );
        });
    });

    describe('getAction', () => {
        it('should get an action by type', async () => {
            const action = actionsRegistry.getAction(AutomationRuleActions.CONDITION);
            expect(action).toBeDefined();
            expect(action.type).toBe(AutomationRuleActions.CONDITION);
        });

        it('should return undefined if action type is not found', async () => {
            const action = actionsRegistry.getAction('nonExistingType');
            expect(action).toBeUndefined();
        });
    });
});
