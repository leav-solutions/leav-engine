// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '_ui/_tests/testUtils';
import {RedirectToFirstPanelOnHome} from '../RedirectToFirstPanelOnHome';
import {IApplication, Panel} from '../../types';
import * as ReactRouter from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useOutletContext: jest.fn(),
    Navigate: jest.fn(),
    generatePath: jest.fn()
}));

describe('RedirectToFirstPanelOnHome', () => {
    const spyNavigate = jest.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = jest.spyOn(ReactRouter, 'generatePath');
    const spyUseLocation = jest.spyOn(ReactRouter, 'useLocation');

    spyUseLocation.mockReturnValue({search: '?query=test'} as any);

    const application: IApplication = {
        workspaces: [
            {
                id: '1',
                title: {
                    en: 'Workspace 1',
                    fr: 'Espace de travail 1'
                },
                entrypoint: {
                    type: 'library',
                    libraryId: 'libraryTest'
                },
                panels: [
                    {
                        id: 'panel1',
                        name: {
                            en: 'Panel 1',
                            fr: 'Panneau 1'
                        },
                        content: {
                            type: 'explorer',
                            libraryId: 'libraryTest',
                            actions: []
                        }
                    }
                ]
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should redirect to first panel', async () => {
        spyGeneratePath.mockReturnValueOnce('/panel1_generated');

        render(<RedirectToFirstPanelOnHome application={application} />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('/:panelId', {panelId: 'panel1'});

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/panel1_generated?query=test'}, {});
    });
});
