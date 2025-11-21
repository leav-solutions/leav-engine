// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import {RedirectToFirstWorkspace} from '../RedirectToFirstWorkspace';

jest.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Navigate: jest.fn(),
    generatePath: jest.fn(),
}));

describe('RedirectToFirstWorkspace component guard', () => {
    const spyNavigate = jest.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = jest.spyOn(ReactRouter, 'generatePath');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    const firstWorkspaceId = '42';
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
                        id: 'maps',
                        name: {
                            fr: 'Gestion des PACs',
                            en: 'MAPs Management',
                        },
                        type: 'explorer',
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
                recordPanels: [],
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should redirect to first workspace', async () => {
        spyGeneratePath.mockReturnValueOnce(`/${firstWorkspaceId}`);
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        render(<RedirectToFirstWorkspace />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('/:workspaceId/*', {workspaceId: firstWorkspaceId});

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: `/${firstWorkspaceId}`}, {});
    });
});
