import {FunctionComponent} from 'react';
import {AddPanel} from '../types';
import {PanelContent} from '../PanelContent';
import {useLocation, useParams} from 'react-router-dom';
import {recordSearchParamsName} from '../routes';

interface IFullPagePanelProps {
    addPanel: AddPanel;
}

export const FullPagePanel: FunctionComponent<IFullPagePanelProps> = ({addPanel}) => {
    const {search} = useLocation();
    const params = useParams();
    const searchParams = new URLSearchParams(search);

    return (
        <PanelContent
            panelId={params.panelId}
            addPanel={addPanel}
            recordId={searchParams.get(recordSearchParamsName)}
            searchQuery={search}
        />
    );
};
