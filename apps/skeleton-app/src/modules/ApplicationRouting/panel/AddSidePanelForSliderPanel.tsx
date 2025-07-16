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

    // TODO: Comment garder l'animation à la fermeture ? Déplacer le KitSidePanel à la place de la div side panel content ?
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
                      setTimeout(() => {
                          navigate(generatePath(routes.panel, {panelId: panelId}));
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
