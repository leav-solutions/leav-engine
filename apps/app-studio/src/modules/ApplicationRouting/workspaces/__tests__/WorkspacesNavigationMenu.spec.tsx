import {render, screen, act} from '_ui/_tests/testUtils';
import {WorkspacesNavigationMenu} from '../WorkspacesNavigationMenu';
import {type Application} from '../../types';
import {InitTheme} from '../../../../config/theme/InitTheme';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn(),
}));

const mockApplicationWithRecordsAndLibrariesWorkspaces: Application = {
    workspaces: [
        {
            id: 'record1',
            type: 'record',
            title: {fr: 'record1', en: 'record1'},
            recordId: '1',
            libraryId: 'test1',
        },
        {
            id: 'record2',
            type: 'record',
            title: {fr: 'record2', en: 'record2'},
            recordId: '2',
            libraryId: 'test2',
        },
        {
            id: 'library1',
            title: {fr: 'library1', en: 'library1'},
            type: 'library',
            libraryId: 'test1',
        },
        {
            id: 'library2',
            title: {fr: 'library2', en: 'library2'},
            type: 'library',
            libraryId: 'test2',
        },
    ],
    libraries: {},
};

const mockApplicationWithMoreThanTenRecordsAndLibrariesWorkspaces: Application = {
    workspaces: [
        ...mockApplicationWithRecordsAndLibrariesWorkspaces.workspaces,
        {
            id: 'record3',
            type: 'record',
            title: {fr: 'record3', en: 'record3'},
            recordId: '3',
            libraryId: 'test3',
        },
        {
            id: 'record4',
            type: 'record',
            title: {fr: 'record4', en: 'record4'},
            recordId: '4',
            libraryId: 'test4',
        },
        {
            id: 'record5',
            type: 'record',
            title: {fr: 'record5', en: 'record5'},
            recordId: '5',
            libraryId: 'test5',
        },
        {
            id: 'record6',
            type: 'record',
            title: {fr: 'record6', en: 'record6'},
            recordId: '6',
            libraryId: 'test6',
        },
        {
            id: 'record7',
            type: 'record',
            title: {fr: 'record7', en: 'record7'},
            recordId: '7',
            libraryId: 'test7',
        },
        {
            id: 'record8',
            type: 'record',
            title: {fr: 'record8', en: 'record8'},
            recordId: '8',
            libraryId: 'test8',
        },
        {
            id: 'record9',
            type: 'record',
            title: {fr: 'record9', en: 'record9'},
            recordId: '9',
            libraryId: 'test9',
        },
        {
            id: 'record10',
            type: 'record',
            title: {fr: 'record10', en: 'record10'},
            recordId: '10',
            libraryId: 'test10',
        },
    ],
    libraries: {},
};

describe('WorkspacesNavigationMenu component', () => {
    const renderWithTheme: typeof render = component => render(<InitTheme>{component}</InitTheme>);
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        jest.clearAllMocks();
        user = userEvent.setup();
    });

    it('should render correctly all workspaces types', () => {
        spyUseApplicationSettingsContext.mockReturnValue([mockApplicationWithRecordsAndLibrariesWorkspaces] as any);

        renderWithTheme(<WorkspacesNavigationMenu />);

        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(6); // 2 records + 2 libraries + 1 shortcuts + 1 separator
        expect(screen.getByText('workspaces_navigation_menu.shortcuts')).toBeInTheDocument();
        expect(screen.getByText('record1')).toBeInTheDocument();
        expect(screen.getByText('record2')).toBeInTheDocument();
        expect(screen.getByText('library1')).toBeInTheDocument();
        expect(screen.getByText('library2')).toBeInTheDocument();
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

    describe('searching workspaces', () => {
        it('should not render search input when there are less than 10 workspaces', () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplicationWithRecordsAndLibrariesWorkspaces] as any);

            renderWithTheme(<WorkspacesNavigationMenu />);

            expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
        });

        it('should render only workspaces of type record with group item when searching for records', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([
                mockApplicationWithMoreThanTenRecordsAndLibrariesWorkspaces,
            ] as any);

            renderWithTheme(<WorkspacesNavigationMenu />);

            const searchInput = screen.getByPlaceholderText(/search/i);

            await act(async () => {
                await user.type(searchInput, 'record');
            });

            expect(screen.getAllByRole('listitem')).toHaveLength(11); // 10 records + 1 shortcuts
            expect(screen.getByText('workspaces_navigation_menu.shortcuts')).toBeInTheDocument();
            expect(screen.getByText('record1')).toBeInTheDocument();
            expect(screen.getByText('record2')).toBeInTheDocument();
            expect(screen.getByText('record3')).toBeInTheDocument();
            expect(screen.getByText('record4')).toBeInTheDocument();
            expect(screen.getByText('record5')).toBeInTheDocument();
            expect(screen.getByText('record6')).toBeInTheDocument();
            expect(screen.getByText('record7')).toBeInTheDocument();
            expect(screen.getByText('record8')).toBeInTheDocument();
            expect(screen.getByText('record9')).toBeInTheDocument();
            expect(screen.getByText('record10')).toBeInTheDocument();
            expect(screen.queryByText('library1')).not.toBeInTheDocument();
            expect(screen.queryByText('library2')).not.toBeInTheDocument();
        });

        it('should render only workspaces of type library without separator when searching for libraries', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([
                mockApplicationWithMoreThanTenRecordsAndLibrariesWorkspaces,
            ] as any);

            renderWithTheme(<WorkspacesNavigationMenu />);

            const searchInput = screen.getByPlaceholderText(/search/i);

            await act(async () => {
                await user.type(searchInput, 'library');
            });

            expect(screen.getAllByRole('listitem')).toHaveLength(2); // 2 libraries without separator
            expect(screen.getByText('library1')).toBeInTheDocument();
            expect(screen.getByText('library2')).toBeInTheDocument();
            expect(screen.queryByText('workspaces_navigation_menu.shortcuts')).not.toBeInTheDocument();
            expect(screen.queryByText('record1')).not.toBeInTheDocument();
            expect(screen.queryByText('record2')).not.toBeInTheDocument();
        });

        it('should render only workspaces of type record with group item and workspaces of type library with separator when searching for records and libraries', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([
                {
                    workspaces: [
                        ...mockApplicationWithMoreThanTenRecordsAndLibrariesWorkspaces.workspaces,
                        {
                            id: 'recordLibrary3',
                            type: 'library',
                            title: {fr: 'recordLibrary3', en: 'recordLibrary3'},
                        },
                    ],
                },
            ] as any);

            renderWithTheme(<WorkspacesNavigationMenu />);

            const searchInput = screen.getByPlaceholderText(/search/i);

            await act(async () => {
                await user.type(searchInput, 'record');
            });

            expect(screen.getAllByRole('listitem')).toHaveLength(13); // 10 records + 1 library + 1 shortcuts + 1 separator
            expect(screen.getByText('workspaces_navigation_menu.shortcuts')).toBeInTheDocument();
            expect(screen.getByText('record1')).toBeInTheDocument();
            expect(screen.getByText('record2')).toBeInTheDocument();
            expect(screen.getByText('record3')).toBeInTheDocument();
            expect(screen.getByText('record4')).toBeInTheDocument();
            expect(screen.getByText('record5')).toBeInTheDocument();
            expect(screen.getByText('record6')).toBeInTheDocument();
            expect(screen.getByText('record7')).toBeInTheDocument();
            expect(screen.getByText('record8')).toBeInTheDocument();
            expect(screen.getByText('record9')).toBeInTheDocument();
            expect(screen.getByText('record10')).toBeInTheDocument();
            expect(screen.getByText('recordLibrary3')).toBeInTheDocument();
            expect(screen.queryByText('library1')).not.toBeInTheDocument();
            expect(screen.queryByText('library2')).not.toBeInTheDocument();
        });

        it('should render workspaces without being case sensitive', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([
                mockApplicationWithMoreThanTenRecordsAndLibrariesWorkspaces,
            ] as any);

            renderWithTheme(<WorkspacesNavigationMenu />);

            const searchInput = screen.getByPlaceholderText(/search/i);

            await act(async () => {
                await user.type(searchInput, 'Record');
            });

            expect(screen.getByText('record1')).toBeInTheDocument();
            expect(screen.getByText('record2')).toBeInTheDocument();
            expect(screen.queryByText('record3')).toBeInTheDocument();
            expect(screen.queryByText('record4')).toBeInTheDocument();
            expect(screen.queryByText('record5')).toBeInTheDocument();
            expect(screen.queryByText('record6')).toBeInTheDocument();
            expect(screen.queryByText('record7')).toBeInTheDocument();
            expect(screen.queryByText('record8')).toBeInTheDocument();
            expect(screen.queryByText('record9')).toBeInTheDocument();
            expect(screen.queryByText('record10')).toBeInTheDocument();
        });

        it('should render no results when no workspaces are found', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([
                mockApplicationWithMoreThanTenRecordsAndLibrariesWorkspaces,
            ] as any);

            renderWithTheme(<WorkspacesNavigationMenu />);

            const searchInput = screen.getByPlaceholderText(/search/i);

            await act(async () => {
                await user.type(searchInput, 'record30');
            });

            expect(screen.getAllByRole('listitem')).toHaveLength(1);
            expect(screen.queryByText('workspaces_navigation_menu.shortcuts')).not.toBeInTheDocument();
            expect(screen.getByText('workspaces_navigation_menu.no_results')).toBeInTheDocument();
        });
    });
});
