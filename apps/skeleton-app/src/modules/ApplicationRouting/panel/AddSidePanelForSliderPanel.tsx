// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createPortal} from 'react-dom';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {KitSidePanel} from 'aristid-ds';
import {FunctionComponent, useEffect, useRef} from 'react';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {routes} from '../routes';

export const AddSidePanelForSliderPanel: FunctionComponent = ({children}) => {
    const refPanel = useRef<KitSidePanelRef | null>(null);
    const navigate = useNavigate();
    const {panelId} = useParams();

    const divToInsertSidePanel = document.getElementById(SIDE_PANEL_CONTENT_ID);

    useEffect(() => {
        refPanel.current?.open();
    }, []);

    return divToInsertSidePanel
        ? createPortal(
              <KitSidePanel
                  ref={refPanel}
                  floating
                  closable
                  size="m"
                  onClose={() => {
                      //TODO: Remove this setTimeout by calling onCloseAfterAnimation when it's implemented in the design system
                      setTimeout(() => {
                          navigate(generatePath(routes.panel, {panelId}));
                      }, 300);
                  }}
                  closeOnEsc
                  closeOnOutsideClick
              >
                  {children}
              </KitSidePanel>,
              divToInsertSidePanel
          )
        : null;
};
