// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {KitModal} from 'aristid-ds';
import {generatePath, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {popupRecordSearchParamsName, routes} from '../routes';
import {usePanelHeader} from '../navigation-menu/usePanelHeader';

export const AddModalForPopupPanel: FunctionComponent = ({children}) => {
    const navigate = useNavigate();
    const {panelId} = useParams();
    const [searchParams] = useSearchParams();

    const {PanelHeaderComponent} = usePanelHeader({level: 'popup'});

    return (
        <KitModal
            isOpen
            height="80vh"
            width="90vw"
            title={PanelHeaderComponent}
            showCloseIcon
            close={() => {
                searchParams.delete(popupRecordSearchParamsName);
                navigate(generatePath(routes.panel, {panelId}) + '?' + searchParams.toString());
            }}
            appElement={document.getElementById('root')}
        >
            {children}
        </KitModal>
    );
};
