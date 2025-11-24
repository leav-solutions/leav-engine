// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useParams} from 'react-router-dom';
import {InformationAndHistory} from '../../information-and-history/InformationAndHistory';
import {Thread} from '../../thread/Thread';

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
