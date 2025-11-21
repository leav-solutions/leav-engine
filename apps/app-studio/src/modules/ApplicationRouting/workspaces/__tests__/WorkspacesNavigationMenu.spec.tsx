// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {WorkspacesNavigationMenu} from '../WorkspacesNavigationMenu';
import {type Application} from '../../types';
import {InitTheme} from '../../../../config/theme/InitTheme';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';

jest.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn(),
}));

describe('WorkspacesNavigationMenu component', () => {
    const renderWithTheme: typeof render = component => render(<InitTheme>{component}</InitTheme>);
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly all workspaces', () => {
        const application: Application = {
            workspaces: [
                {
                    id: '1',
                    title: {
                        fr: 'un',
                        en: 'one',
                    },
                    type: 'library',
                    libraryId: 'test1',
                },
                {
                    id: '2',
                    title: {
                        fr: 'deux',
                        en: 'two',
                    },
                    type: 'library',
                    libraryId: 'test2',
                },
            ],
            libraries: {},
        };
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        renderWithTheme(<WorkspacesNavigationMenu />);

        expect(screen.getByRole('navigation')).toBeVisible();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getAllByRole('listitem').map(listItem => listItem.textContent)).toEqual(['un', 'deux']);
    });

    it('should render default icons when no icon is specified', () => {
        const application: Application = {
            workspaces: [
                {
                    id: '1',
                    title: {
                        fr: 'un',
                        en: 'one',
                    },
                    type: 'library',
                    libraryId: 'test1',
                },
            ],
            libraries: {},
        };
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        renderWithTheme(<WorkspacesNavigationMenu />);

        const workspaceItem = screen.getByRole('listitem');
        const svgIcon = workspaceItem.querySelector('svg');
        expect(svgIcon).toHaveClass('fa-star-of-life');
    });

    it('should render custom icons when icon is specified in workspace', () => {
        const application: Application = {
            workspaces: [
                {
                    id: '1',
                    title: {
                        fr: 'un',
                        en: 'one',
                    },
                    icon: 'fa-house',
                    type: 'library',
                    libraryId: 'test1',
                },
                {
                    id: '2',
                    title: {
                        fr: 'deux',
                        en: 'two',
                    },
                    icon: 'fa-user',
                    type: 'library',
                    libraryId: 'test2',
                },
            ],
            libraries: {},
        };
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        renderWithTheme(<WorkspacesNavigationMenu />);

        const houseWorkspaceItem = screen.getAllByRole('listitem')[0];
        const houseSvgIcon = houseWorkspaceItem.querySelector('svg');
        expect(houseSvgIcon).toHaveClass('fa-house');

        const userWorkspaceItem = screen.getAllByRole('listitem')[1];
        const userSvgIcon = userWorkspaceItem.querySelector('svg');
        expect(userSvgIcon).toHaveClass('fa-user');
    });
});
