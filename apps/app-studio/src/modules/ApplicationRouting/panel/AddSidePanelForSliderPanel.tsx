// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createPortal} from 'react-dom';
import {generatePath, useLocation, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {KitSidePanel, KitTypography} from 'aristid-ds';
import {FunctionComponent, useEffect, useRef} from 'react';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {routes} from '../routes';
import {IApplicationMatchingContext} from '../types';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';

export const AddSidePanelForSliderPanel: FunctionComponent = ({children}) => {
    const refPanel = useRef<KitSidePanelRef | null>(null);
    const {lang} = useLang();
    const navigate = useNavigate();
    const {panelId} = useParams();
    const {search} = useLocation();
    const {currentSliderPanel} = useOutletContext<IApplicationMatchingContext>();

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
                  headerExtra={
                      <KitTypography.Title level="h2">
                          {localizedTranslation(currentSliderPanel?.name, lang)}
                      </KitTypography.Title>
                  }
                  onClose={() => {
                      //TODO: Remove this setTimeout by calling onCloseAfterAnimation when it's implemented in the design system
                      setTimeout(() => {
                          navigate(generatePath(routes.panel, {panelId}) + search);
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
