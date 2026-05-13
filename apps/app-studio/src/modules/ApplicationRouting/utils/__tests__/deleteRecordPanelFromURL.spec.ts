import {deleteRecordPanelFromURL} from '../deleteRecordPanelFromURL';

describe('deleteRecordPanelFromURL method', () => {
    it('should do nothing when pattern not found', async () => {
        const recordPanel = {
            recordId: 'recordId',
            where: 'where',
            recordPanelId: 'recordPanelId',
        };
        const emptyPathname = '/42/firstFullpagePanelId';

        const newPathname = deleteRecordPanelFromURL(emptyPathname, recordPanel);

        expect(newPathname).toBe(emptyPathname);
    });

    it('should delete recordPanel from URL (middle)', async () => {
        const recordPanel = {
            recordId: 'recordId',
            where: 'where',
            recordPanelId: 'recordPanelId',
        };
        const middlePathname = `/42/firstFullpagePanelId/${recordPanel.recordId}/${recordPanel.where}/${recordPanel.recordPanelId}/thirdRecordId/thirdWhere/thirdRecordPanelId`;

        const newPathname = deleteRecordPanelFromURL(middlePathname, recordPanel);

        expect(newPathname).toBe('/42/firstFullpagePanelId/thirdRecordId/thirdWhere/thirdRecordPanelId');
    });

    it('should delete recordPanel from URL (end)', async () => {
        const recordPanel = {
            recordId: 'recordId',
            where: 'where',
            recordPanelId: 'recordPanelId',
        };
        const endPathname = `/42/firstFullpagePanelId/secondRecordId/secondWhere/secondRecordPanelId/${recordPanel.recordId}/${recordPanel.where}/${recordPanel.recordPanelId}`;

        const newPathname = deleteRecordPanelFromURL(endPathname, recordPanel);

        expect(newPathname).toBe('/42/firstFullpagePanelId/secondRecordId/secondWhere/secondRecordPanelId');
    });
});
