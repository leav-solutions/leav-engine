// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SyncAutomationRuleEventAction} from '../../../../../_types/automation';
import {type IQueryInfos} from '../../../../../_types/queryInfos';
import {systemUserId} from '../../../../../_constants/users';
import {ActionExecutionResultStatus, type IAutomationAction} from '../../../../../domain/automation/actions/_types';
import {type NotificationActionParams} from '../../../../../domain/automation/actions/notificationAction';
import {type INotificationDomain} from '../../../../../domain/notification/notificationDomain';
import {type IRecord} from '../../../../../_types/record';
import {getCoreDep} from '../../../integrationTestUtils';
import {type IAutomationPipelineExecutionState} from '../../../../../domain/automation/pipeline/_types';

describe('notificationAction', () => {
    let notificationAction: IAutomationAction<NotificationActionParams>;
    let notificationDomain: INotificationDomain;

    const ctx: IQueryInfos = {userId: systemUserId};

    const baseState: IAutomationPipelineExecutionState = {
        trigger: {
            synchronous: false,
            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
            eventTopic: {} as any,
        },
        results: {},
        stepIndex: 0,
        lastResult: undefined,
        startDateMs: Date.now(),
    };

    beforeAll(() => {
        notificationAction = getCoreDep<IAutomationAction<NotificationActionParams>>(
            'core.domain.automation.actions.notification',
        );
        notificationDomain = getCoreDep<INotificationDomain>('core.domain.notification');
    });

    beforeEach(async () => {
        await notificationDomain.deleteAllNotifications(ctx);
    });

    describe('execute — result structure', () => {
        it('returns userIdsNotified with the recipients resolved by the Jexl expression', async () => {
            const result = await notificationAction.execute(
                {title: 'Test', recipients: `["${systemUserId}", "42"]`, message: '"hello"'},
                baseState,
                ctx,
            );

            expect(result).toEqual({
                status: ActionExecutionResultStatus.CONTINUE,
                result: {userIdsNotified: [systemUserId, '42']},
            });
        });

        it('returns CONTINUE with empty userIdsNotified when recipients evaluates to an empty array', async () => {
            const result = await notificationAction.execute(
                {title: 'Test', recipients: '[]', message: '"hello"'},
                baseState,
                ctx,
            );
            expect(result).toEqual({
                status: ActionExecutionResultStatus.CONTINUE,
                result: {userIdsNotified: []},
            });
        });
    });

    describe('execute — Jexl context without record', () => {
        it('exposes pipeline results in the recipients expression', async () => {
            const state: IAutomationPipelineExecutionState = {
                ...baseState,
                results: {targetUserId: systemUserId},
            };

            const result = await notificationAction.execute(
                {title: 'Test', recipients: '[results.targetUserId]', message: '"msg"'},
                state,
                ctx,
            );

            expect(result).toEqual({
                status: ActionExecutionResultStatus.CONTINUE,
                result: {userIdsNotified: [systemUserId]},
            });
        });

        it('exposes pipeline results in the message expression', async () => {
            const state: IAutomationPipelineExecutionState = {
                ...baseState,
                results: {greeting: 'Bonjour'},
            };

            await notificationAction.execute(
                {title: 'Test', recipients: `["${systemUserId}"]`, message: 'results.greeting + " !"'},
                state,
                ctx,
            );

            const {list} = await notificationDomain.getNotifications(ctx);
            expect(list[0]?.message).toBe('Bonjour !');
        });

        it('evaluates the message Jexl expression', async () => {
            await notificationAction.execute(
                {title: 'Alert', recipients: `["${systemUserId}"]`, message: '"Hello " + "World"'},
                baseState,
                ctx,
            );

            const {list} = await notificationDomain.getNotifications(ctx);
            expect(list[0]?.message).toBe('Hello World');
        });
    });

    describe('execute — Jexl context with record in eventTopic', () => {
        const record: IRecord = {
            id: 'rec_notif_001',
            library: 'test_library',
            assigneeId: systemUserId,
        };

        const stateWithRecord: IAutomationPipelineExecutionState = {
            ...baseState,
            trigger: {
                ...baseState.trigger,
                eventTopic: {record} as any,
            },
        };

        it('exposes currentRecord fields in the recipients expression', async () => {
            const result = await notificationAction.execute(
                {title: 'Test', recipients: '[currentRecord.assigneeId]', message: '"msg"'},
                stateWithRecord,
                ctx,
            );

            expect(result).toEqual({
                status: ActionExecutionResultStatus.CONTINUE,
                result: {userIdsNotified: [systemUserId]},
            });
        });

        it('exposes currentRecord fields in the message expression', async () => {
            await notificationAction.execute(
                {title: 'Test', recipients: `["${systemUserId}"]`, message: '"Record: " + currentRecord.id'},
                stateWithRecord,
                ctx,
            );

            const {list} = await notificationDomain.getNotifications(ctx);
            expect(list[0]?.message).toBe('Record: rec_notif_001');
        });
    });
});
