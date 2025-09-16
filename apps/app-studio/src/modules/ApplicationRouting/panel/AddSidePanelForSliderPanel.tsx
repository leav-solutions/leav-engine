// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {generatePath, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {KitSidePanel} from 'aristid-ds';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {routes, sliderRecordSearchParamsName} from '../routes';
import {usePanelHeader} from '../navigation-menu/usePanelHeader';

export const AddSidePanelForSliderPanel: FunctionComponent = ({children}) => {
    const refPanel = useRef<KitSidePanelRef | null>(null);
    const navigate = useNavigate();
    const {panelId} = useParams();
    const [searchParams] = useSearchParams();

    const {PanelHeaderComponent} = usePanelHeader({level: 'slider'});

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
                  headerExtra={PanelHeaderComponent}
                  onClose={() => {
                      // TODO: Remove this setTimeout by calling onCloseAfterAnimation when it's implemented in the design system
                      setTimeout(() => {
                          searchParams.delete(sliderRecordSearchParamsName);
                          navigate(generatePath(routes.panel, {panelId}) + '?' + searchParams.toString());
                      }, 300);
                  }}
                  closeOnEsc
              >
                  {children}
              </KitSidePanel>,
              divToInsertSidePanel
          )
        : null;
};
