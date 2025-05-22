// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {PanelsNavigationMenu} from '../PanelsNavigationMenu';
import * as ReactRouter from 'react-router-dom';
import {IWorkspace, Panel} from '../../types';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useOutletContext: jest.fn(),
    Navigate: jest.fn(),
    generatePath: jest.fn()
}));

describe('PanelsNavigationMenu component', () => {
    it('should render correctly tabs when there are children', () => {
        const spyUseLocation = jest.spyOn(ReactRouter, 'useLocation');
        const spyUseOutletContext = jest.spyOn(ReactRouter, 'useOutletContext');

        spyUseLocation.mockReturnValue({search: '?query=test'} as any);
        spyUseOutletContext.mockReturnValue({
            currentPanel: {id: 'p2', name: {}, children: []} satisfies Panel,
            currentWorkspace: {
                entrypoint: {type: 'library', libraryId: 'test'},
                panels: [],
                id: 'w1',
                title: {}
            } satisfies IWorkspace,
            currentParentTuple: [
                {
                    id: 'p1',
                    name: {},
                    children: [
                        {
                            id: 'p2',
                            name: {},
                            children: []
                        },
                        {
                            id: 'p3',
                            name: {
                                fr: 'trois',
                                en: 'three'
                            },
                            children: []
                        }
                    ]
                } satisfies Panel
            ]
        });

        render(<PanelsNavigationMenu />);

        expect(screen.getAllByRole('tab')).toHaveLength(2);
        expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['', 'trois']);
    });
});
