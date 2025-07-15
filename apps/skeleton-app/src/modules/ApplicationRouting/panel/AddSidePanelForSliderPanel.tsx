import {createPortal} from 'react-dom';
import {generatePath, Outlet, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import {ApplicationMatchingContextWithoutParentTuple} from '../types';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {KitSidePanel} from 'aristid-ds';
import {FunctionComponent, useEffect, useRef} from 'react';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {routes} from '../routes';

export const AddSidePanelForSliderPanel: FunctionComponent = () => {
    const {currentPanel, currentPopupPanel, currentSliderPanel, currentWorkspace} =
        useOutletContext<ApplicationMatchingContextWithoutParentTuple>();

    const refPanel = useRef<KitSidePanelRef | null>(null);
    const navigate = useNavigate();
    const params = useParams();

    const domElement = document.getElementById(SIDE_PANEL_CONTENT_ID);
    console.log('dom', domElement);

    // TODO: Comment garder l'animation à la fermeture ? Déplacer le KitSidePanel à la place de la div side panel content ?
    useEffect(() => {
        refPanel.current?.open();
    }, []);

    return domElement
        ? createPortal(
              <KitSidePanel
                  initialOpen
                  ref={refPanel}
                  floating
                  closable
                  size="m"
                  onClose={() => navigate(generatePath(routes.panel, {panelId: params.panelId}))}
                  closeOnEsc
                  closeOnOutsideClick
              >
                  <Outlet
                      context={
                          {
                              currentPanel,
                              currentPopupPanel,
                              currentSliderPanel,
                              currentWorkspace
                          } satisfies ApplicationMatchingContextWithoutParentTuple
                      }
                  />
              </KitSidePanel>,
              document.getElementById(SIDE_PANEL_CONTENT_ID)
          )
        : null;
};
