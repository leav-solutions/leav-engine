// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {WorkspacesNavigationMenu} from '../WorkspacesNavigationMenu';
import {Application} from '../../types';
import {InitTheme} from '../../../../config/theme/InitTheme';

describe('WorkspacesNavigationMenu component', () => {
    const renderWithTheme = (component: React.ReactElement) => render(<InitTheme>{component}</InitTheme>);

    it('should render correctly all workspaces', () => {
        const application: Application = {
            workspaces: [
                {
                    id: '1',
                    title: {
                        fr: 'un',
                        en: 'one'
                    },
                    panels: [],
                    entrypoint: {
                        type: 'library',
                        libraryId: 'test1'
                    }
                },
                {
                    id: '2',
                    title: {
                        fr: 'deux',
                        en: 'two'
                    },
                    panels: [],
                    entrypoint: {
                        type: 'library',
                        libraryId: 'test2'
                    }
                }
            ]
        };

        renderWithTheme(<WorkspacesNavigationMenu application={application} />);

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
                        en: 'one'
                    },
                    panels: [],
                    entrypoint: {
                        type: 'library',
                        libraryId: 'test1'
                    }
                }
            ]
        };

        renderWithTheme(<WorkspacesNavigationMenu application={application} />);

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
                        en: 'one'
                    },
                    icon: 'fa-house',
                    panels: [],
                    entrypoint: {
                        type: 'library',
                        libraryId: 'test1'
                    }
                },
                {
                    id: '2',
                    title: {
                        fr: 'deux',
                        en: 'two'
                    },
                    icon: 'fa-user',
                    panels: [],
                    entrypoint: {
                        type: 'library',
                        libraryId: 'test2'
                    }
                }
            ]
        };

        renderWithTheme(<WorkspacesNavigationMenu application={application} />);

        const houseWorkspaceItem = screen.getAllByRole('listitem')[0];
        const houseSvgIcon = houseWorkspaceItem.querySelector('svg');
        expect(houseSvgIcon).toHaveClass('fa-house');

        const userWorkspaceItem = screen.getAllByRole('listitem')[1];
        const userSvgIcon = userWorkspaceItem.querySelector('svg');
        expect(userSvgIcon).toHaveClass('fa-user');
    });
});
