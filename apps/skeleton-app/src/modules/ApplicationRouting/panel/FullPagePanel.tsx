import {FunctionComponent} from 'react';
import {AddPanel, IApplicationMatchingContext} from '../types';
import {PanelContent} from '../PanelContent';
import {useLocation, useOutletContext} from 'react-router-dom';
import {recordSearchParamsName} from '../routes';

interface IFullPagePanelProps {
    addPanel: AddPanel;
}

export const FullPagePanel: FunctionComponent<IFullPagePanelProps> = ({addPanel}) => {
    const {currentPanel} = useOutletContext<Omit<IApplicationMatchingContext, 'currentParentTuple'>>();
    const {search} = useLocation();

    const searchParams = new URLSearchParams(search);
    const recordId = searchParams.get(recordSearchParamsName);

    return <PanelContent panel={currentPanel} addPanel={addPanel} recordId={recordId} searchQuery={search} />;
};
