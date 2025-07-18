// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {KitModal} from 'aristid-ds';
import {generatePath, useLocation, useNavigate, useParams} from 'react-router-dom';
import {routes} from '../routes';

export const AddModalForPopupPanel: FunctionComponent = ({children}) => {
    const {panelId} = useParams();
    const navigate = useNavigate();
    const {search} = useLocation();

    return (
        <KitModal
            isOpen
            height="80vh"
            width="90vw"
            showCloseIcon
            close={() => {
                navigate(generatePath(routes.panel, {panelId}) + search);
            }}
        >
            {children}
        </KitModal>
    );
};
