import {render, screen} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import {RedirectToPreviousPanel} from '../RedirectToPreviousPanel';

vi.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    Navigate: vi.fn(),
    useParams: vi.fn(),
}));

describe('RedirectToPreviousPanel component guard', () => {
    const spyOnNavigate = vi.spyOn(ReactRouter, 'Navigate');
    const spyOnUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyOnUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    const firstWorkspaceId = '42';
    const panelId = 'maps';
    const recordPanelId = 'edition-form';
    const application: Application = {
        workspaces: [
            {
                id: firstWorkspaceId,
                icon: 'fa-layer-group',
                title: {
                    fr: 'PACs',
                    en: 'Roadmap',
                },
                type: 'library',
                libraryId: 'map',
            },
        ],
        libraries: {
            map: {
                libraryPanels: [
                    {
                        id: panelId,
                        name: {
                            fr: 'Gestion des PACs',
                            en: 'MAPs Management',
                        },
                        type: 'explorer',
                        isViewSettingsActive: false,
                        viewId: '885451776',
                        actions: [
                            {
                                where: 'fullpage',
                                what: 'record',
                                label: {
                                    en: 'Open PAC',
                                    fr: 'Ouvrir le PAC',
                                },
                            },
                        ],
                    },
                ],
                recordPanels: [
                    {
                        id: recordPanelId,
                        type: 'editionForm',
                        formId: 'edition',
                    },
                ],
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([[{panelId}], [{recordPanelId}]])(
        'should print children when current panel can be found in application %s',
        async panelDetails => {
            spyOnUseParams.mockReturnValue(panelDetails);
            spyOnUseApplicationSettingsContext.mockReturnValue([application] as any);
            const child = 'child';

            render(<RedirectToPreviousPanel>{child}</RedirectToPreviousPanel>);

            expect(screen.getByText(child));
            expect(spyOnNavigate).not.toHaveBeenCalled();
        },
    );

    it.each([[{panelId: 'unknown'}], [{recordPanelId: 'unknown'}]])(
        'should redirect to previous panel when current panel is not found %s',
        async panelDetails => {
            spyOnUseParams.mockReturnValue(panelDetails);
            spyOnUseApplicationSettingsContext.mockReturnValue([application] as any);
            const child = 'child';

            render(<RedirectToPreviousPanel>{child}</RedirectToPreviousPanel>);

            expect(screen.queryByText(child)).not.toBeInTheDocument();
            expect(spyOnNavigate).toHaveBeenCalledWith(
                {
                    relative: 'path',
                    replace: true,
                    to: '../../..',
                },
                {},
            );
        },
    );
});
