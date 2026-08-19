import {useParams} from 'react-router-dom';

// All param names used across the routes in `paths.ts`,
// as an inline object type so the fields show up when hovering `useRouteParams`.
// Typing them here turns a misnamed destructured key into a compile error instead of a silent `undefined`.
export const useRouteParams = (): Readonly<{
    workspaceId?: string;
    panelId?: string;
    recordId?: string;
    where?: string;
    recordPanelId?: string;
    flapRecordId?: string;
    flapLibraryId?: string;
    flapPanelId?: string;
    '*'?: string;
}> => useParams();
