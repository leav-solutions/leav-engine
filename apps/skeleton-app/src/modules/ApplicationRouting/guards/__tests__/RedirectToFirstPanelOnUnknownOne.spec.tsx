// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {RedirectToFirstPanelOnInvalidPanel} from '../RedirectToFirstPanelOnInvalidPanel';
import {IApplication, Panel} from '../../types';
import * as ReactRouter from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useOutletContext: jest.fn(),
    Navigate: jest.fn(),
    generatePath: jest.fn()
}));

describe('RedirectToFirstPanelOnUnknownOne', () => {
    const spyNavigate = jest.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = jest.spyOn(ReactRouter, 'generatePath');
    const spyUseLocation = jest.spyOn(ReactRouter, 'useLocation');
    const spyUseOutletContext = jest.spyOn(ReactRouter, 'useOutletContext');

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

    it('should not redirect when currentPanel is defined and display child', async () => {
        spyUseOutletContext.mockReturnValue({
            currentPanel: {
                id: 'panelId',
                name: {
                    en: 'Panel 1',
                    fr: 'Panneau 1'
                },
                children: [],
                content: {
                    type: 'explorer',
                    libraryId: 'libraryTest',
                    actions: []
                }
            } satisfies Panel
        });

        render(
            <RedirectToFirstPanelOnInvalidPanel application={application}>child</RedirectToFirstPanelOnInvalidPanel>
        );

        expect(spyNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('child')).toBeVisible();
    });

    it('should redirect when currentPanel is undefined to first panel', async () => {
        spyUseOutletContext.mockReturnValue({currentPanel: null});
        spyGeneratePath.mockReturnValueOnce('/panel1_generated');

        render(
            <RedirectToFirstPanelOnInvalidPanel application={application}>child</RedirectToFirstPanelOnInvalidPanel>
        );

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('/:panelId', {panelId: 'panel1'});

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/panel1_generated?query=test'}, {});
    });
});
