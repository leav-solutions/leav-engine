// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {WorkspacesNavigationMenu} from '../WorkspacesNavigationMenu';
import {IApplication} from '../../types';

describe('WorkspacesNavigationMenu component', () => {
    it('should render correctly all workspaces', () => {
        const application: IApplication = {
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

        render(<WorkspacesNavigationMenu application={application} />);

        expect(screen.getByRole('navigation')).toBeVisible();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getAllByRole<HTMLLIElement>('listitem').map(listItem => listItem.textContent)).toEqual([
            'un',
            'deux'
        ]);
    });
});
