// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const retrievePreviousPanelURLParams = ({
    recordId,
    where,
    recordPanelId,
}: {
    recordId: string;
    where: string;
    recordPanelId: string;
}) => {
    const pathBeforeCurrentPanel = window.location.pathname.split(`/${recordId}/${where}/${recordPanelId}`)[0] ?? '';
    const isPreviousPanelFirstLevel =
        !pathBeforeCurrentPanel.includes('/popup/') &&
        !pathBeforeCurrentPanel.includes('/fullpage/') &&
        !pathBeforeCurrentPanel.includes('/slider/');

    const _previousLevelPanelInLocationPathname = window.location.pathname.split(
        `/${recordId}/${where}/${recordPanelId}`,
    );

    const previousPath = _previousLevelPanelInLocationPathname[0] ?? '';
    const segments = previousPath.split('/').filter(Boolean);

    if (isPreviousPanelFirstLevel) {
        return {
            previousRecordPanelId: segments[segments.length - 1],
            previousWhere: null,
            previousRecordId: null,
            isPreviousPanelFirstLevel,
        };
    }

    const flapIndex = segments.lastIndexOf('flap');
    const endIndex = flapIndex === -1 ? segments.length : flapIndex;

    return {
        previousRecordPanelId: segments[endIndex - 1],
        previousWhere: segments[endIndex - 2],
        previousRecordId: segments[endIndex - 3],
        isPreviousPanelFirstLevel,
    };
};
