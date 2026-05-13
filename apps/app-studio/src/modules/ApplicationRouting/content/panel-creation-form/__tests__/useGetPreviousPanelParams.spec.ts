import {useGetPreviousPanelParams} from '../useGetPreviousPanelParams';

describe('useGetPreviousPanelParams', () => {
    it('should provide previous panel params', async () => {
        window.history.pushState(
            {},
            '',
            '/42/firstFullpagePanelId/secondRecordId/secondWhere/secondRecordPanelId/thirdRecordId/thirdWhere/thirdRecordPanelId',
        );

        const {previousRecordPanelId, previousWhere, previousRecordId} = useGetPreviousPanelParams({
            currentRecordId: 'thirdRecordId',
            currentWhere: 'thirdWhere',
            currentRecordPanelId: 'thirdRecordPanelId',
        });

        expect(previousRecordPanelId).toBe('secondRecordPanelId');
        expect(previousWhere).toBe('secondWhere');
        expect(previousRecordId).toBe('secondRecordId');
    });

    it('should provide first fullpage panel params if we are in the second panel', async () => {
        window.history.pushState({}, '', '/42/firstFullpagePanelId/secondRecordId/secondWhere/secondRecordPanelId');

        const {previousRecordPanelId, previousWhere, previousRecordId} = useGetPreviousPanelParams({
            currentRecordId: 'secondRecordId',
            currentWhere: 'secondWhere',
            currentRecordPanelId: 'secondRecordPanelId',
        });

        expect(previousRecordPanelId).toBe('firstFullpagePanelId');
        expect(previousWhere).toBe('fullpage');
        expect(previousRecordId).toBe(undefined);
    });
});
