import {FunctionComponent} from 'react';
import {AddPanel} from '../types';
import {PanelContent} from '../PanelContent';
import {KitModal} from 'aristid-ds';

interface IPopupPanelProps {
    addPanel: AddPanel;
}

export const PopupPanel: FunctionComponent<IPopupPanelProps> = ({addPanel}) => {
    return (
        <KitModal
            isOpen
            height="80vh"
            width="90vw"
            showCloseIcon
            close={() => {
                //TODO: Navigate to parent
            }}
        >
            <PanelContent panel={{}} addPanel={addPanel} />
        </KitModal>
    );
};
