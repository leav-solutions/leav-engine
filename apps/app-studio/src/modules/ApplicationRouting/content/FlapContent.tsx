import {useParams} from 'react-router-dom';
import {InformationAndHistory} from './flap-information-and-history/InformationAndHistory';
import {Thread} from './flap-thread/Thread';

export const FlapContent = () => {
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();

    if (flapPanelId === 'info-history') {
        return <InformationAndHistory />;
    } else if (flapPanelId === 'thread') {
        return <Thread />;
    }

    console.error(`Flap panel ID is is not defined: ${flapPanelId}`);
    return null;
};
