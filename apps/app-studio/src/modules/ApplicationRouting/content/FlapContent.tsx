import {useRouteParams} from '../router/useRouteParams';
import {InformationAndHistory} from './flap-information-and-history/InformationAndHistory';
import {Thread} from './flap-thread/Thread';

export const FlapContent = () => {
    const {flapPanelId} = useRouteParams();

    if (flapPanelId === 'info-history') {
        return <InformationAndHistory />;
    } else if (flapPanelId === 'thread') {
        return <Thread />;
    }

    console.error(`Flap panel ID is is not defined: ${flapPanelId}`);
    return null;
};
