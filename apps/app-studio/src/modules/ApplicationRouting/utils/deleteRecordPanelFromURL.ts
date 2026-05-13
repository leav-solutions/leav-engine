export const deleteRecordPanelFromURL = (
    pathname: string,
    recordPanel: {recordId: string; where: string; recordPanelId: string},
): string => pathname.split(`/${recordPanel.recordId}/${recordPanel.where}/${recordPanel.recordPanelId}`).join('');
