import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {type Panel} from '_ui/hooks/usePanelMessenger/types';
import {type Application} from '../../../types';
import {PanelsTabs} from '../PanelsTabs';
import {InitTheme} from '../../../../../config/theme/InitTheme';
import * as ApplicationSettingsContext from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {matomo} from '../../../../../services/analytics';
import {matomoEvents} from '../../../../../services/analytics/constants/matomoEvents';

const mockNavigate = vi.fn();

vi.mock('../../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => mockNavigate,
    generatePath: vi.fn((path, params) => {
        if (!params) {
            return path;
        }
        let result = path;
        Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`:${key}`, value as string);
        });
        return result;
    }),
}));

const mockUseGetPanelsAttributeCounts = vi.fn();

vi.mock('../panels-attribute-counts/useGetPanelsAttributeCounts', () => ({
    useGetPanelsAttributeCounts: (...args: any[]) => mockUseGetPanelsAttributeCounts(...args),
}));

vi.mock('../../../../../services/analytics', async () => ({
    ...(await vi.importActual('../../../../../services/analytics')),
    matomo: {trackNavigationEvent: vi.fn()},
}));

describe('PanelsTabs', () => {
    const renderWithTheme: typeof render = component => render(<InitTheme>{component}</InitTheme>);
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    let user: ReturnType<typeof userEvent.setup>;

    const mockPanel1: Panel = {
        id: 'panel1',
        type: 'explorer',
        isViewSettingsActive: false,
        name: {fr: 'Panneau 1', en: 'Panel 1'},
        actions: [],
    };

    const mockPanel2: Panel = {
        id: 'panel2',
        type: 'explorer',
        isViewSettingsActive: false,
        name: {fr: 'Panneau 2', en: 'Panel 2'},
        actions: [],
    };

    const mockPanel3: Panel = {
        id: 'panel3',
        type: 'explorer',
        isViewSettingsActive: false,
        name: {fr: 'Panneau 3', en: 'Panel 3'},
        actions: [],
        isStandalone: true,
    };

    const mockPanel4: Panel = {
        id: 'panel4',
        type: 'explorer',
        isViewSettingsActive: false,
        name: {fr: 'Panneau 4', en: 'Panel 4'},
        actions: [],
        hideInCompactMode: true,
    };

    const mockPanel5: Panel = {
        id: 'panel5',
        type: 'explorer',
        isViewSettingsActive: false,
        name: {fr: 'Panneau 5', en: 'Panel 5'},
        actions: [],
        icon: 'fa-ice-cream',
    };

    const mockPanelWithAttribute: Panel & {attributeSource: string; libraryId: string} = {
        id: 'panelWithAttr',
        type: 'explorer',
        isViewSettingsActive: false,
        name: {fr: 'Panneau avec attribut', en: 'Panel with attribute'},
        actions: [],
        attributeSource: 'campaigns_link',
        libraryId: 'campaigns',
    };

    const mockApplication: Application = {
        libraries: {
            testLib: {
                recordPanel: [mockPanel1, mockPanel2, mockPanel3, mockPanel4],
                libraryPanel: [mockPanel1, mockPanel2],
            },
        },
    } as any;

    const mockApplicationWithAttributePanel: Application = {
        libraries: {
            testLib: {
                recordPanel: [mockPanel1, mockPanelWithAttribute],
            },
        },
    } as any;

    const mockEmptyApplication: Application = {
        libraries: {
            testLib: {
                recordPanel: [],
            },
        },
    } as any;

    const mockSinglePanelApplication: Application = {
        libraries: {
            testLib: {
                recordPanel: [mockPanel1],
            },
        },
    } as any;

    const mockStandalonePanelApplication: Application = {
        libraries: {
            testLib: {
                recordPanel: [mockPanel3],
            },
        },
    } as any;

    const mockLibraryPanelApplication: Application = {
        libraries: {
            testLib: {
                libraryPanel: [mockPanel1, mockPanel2],
            },
        },
    } as any;

    const mockRecordPanelWithIcon: Application = {
        libraries: {
            testLib: {
                recordPanel: [mockPanel1, mockPanel5],
                libraryPanel: [mockPanel1, mockPanel5],
            },
        },
    } as any;

    const defaultProps = {
        enabled: true,
        workspaceId: 'workspace1',
        recordId: undefined,
        where: undefined,
        libraryId: 'testLib',
        panelType: 'recordPanel',
        hasFlapPanel: false,
        currentPanelId: 'panel1',
        className: 'test-class',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGetPanelsAttributeCounts.mockReturnValue({
            panelsCounts: {},
        });
        user = userEvent.setup();
    });

    it('should not render anything when enabled is false', () => {
        spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

        renderWithTheme(<PanelsTabs {...defaultProps} enabled={false} />);

        expect(screen.queryByText('Panneau 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Panneau 2')).not.toBeInTheDocument();
    });

    it('should not render anything when there are no panels to display', () => {
        spyUseApplicationSettingsContext.mockReturnValue([mockEmptyApplication] as any);

        renderWithTheme(<PanelsTabs {...defaultProps} />);

        expect(screen.queryByText('Panneau 1')).not.toBeInTheDocument();
    });

    it('should not render anything when there is only one panel to display', () => {
        spyUseApplicationSettingsContext.mockReturnValue([mockSinglePanelApplication] as any);

        renderWithTheme(<PanelsTabs {...defaultProps} />);

        expect(screen.queryByText('Panneau 1')).not.toBeInTheDocument();
    });

    it('should render the tabs when enabled is true and there are 2+ panels', () => {
        spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

        renderWithTheme(<PanelsTabs {...defaultProps} />);

        expect(screen.getByText('Panneau 1')).toBeInTheDocument();
        expect(screen.getByText('Panneau 2')).toBeInTheDocument();
    });

    it('should render the tabs with the correct icons', () => {
        spyUseApplicationSettingsContext.mockReturnValue([mockRecordPanelWithIcon] as any);

        renderWithTheme(<PanelsTabs {...defaultProps} />);

        expect(screen.getByText('Panneau 1')).toBeInTheDocument();
        expect(screen.getByText('Panneau 5')).toBeInTheDocument();

        const panel5Tab = screen.getByText('Panneau 5').closest('[role="tab"]');
        const svgIcon = panel5Tab?.querySelector('svg');
        expect(svgIcon).toHaveClass('fa-ice-cream');
    });

    describe('Panel filtering', () => {
        it('should filter out standalone panels (not display them)', () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} />);

            expect(screen.queryByText('Panneau 3')).not.toBeInTheDocument();
        });

        it('should filter out panels with hideInCompactMode when where === "slider"', () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} where="slider" />);

            expect(screen.queryByText('Panneau 4')).not.toBeInTheDocument();
        });

        it('should filter out panels with hideInCompactMode when where === "popup"', () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} where="popup" />);

            expect(screen.queryByText('Panneau 4')).not.toBeInTheDocument();
        });

        it('should not display the tabs when all panels are filtered out', () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockStandalonePanelApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} />);

            expect(screen.queryByText('Panneau 3')).not.toBeInTheDocument();
        });
    });

    describe('Badge counts', () => {
        it('should display a badge with the correct count for panels with attributeSource', () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplicationWithAttributePanel] as any);
            mockUseGetPanelsAttributeCounts.mockReturnValueOnce({
                panelsCounts: {
                    panelWithAttr: 42,
                },
            });

            const {container} = renderWithTheme(<PanelsTabs {...defaultProps} recordId="123" />);

            expect(screen.getByText('Panneau avec attribut')).toBeInTheDocument();
            const badgeCount = container.querySelector('.ant-badge-count[data-show="true"]');
            expect(badgeCount).toBeInTheDocument();
            expect(badgeCount).toHaveTextContent('42');
        });

        it('should not display a badge for panels without attributeSource', () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);
            mockUseGetPanelsAttributeCounts.mockReturnValueOnce({
                panelsCounts: {},
            });

            const {container} = renderWithTheme(<PanelsTabs {...defaultProps} recordId="123" />);

            expect(screen.getByText('Panneau 1')).toBeInTheDocument();
            expect(screen.getByText('Panneau 2')).toBeInTheDocument();

            // Checking that no badge count is displayed (badge count is in sup.ant-badge-count with data-show="true")
            expect(container.querySelector('.ant-badge-count[data-show="true"]')).toBeNull();
        });
    });

    describe('On Tab Click', () => {
        it('should navigate to the correct path when the tab is clicked and also close the flap panel if it is open', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} hasFlapPanel recordId="123" where="popup" />);

            const panel2Tab = screen.getByText('Panneau 2');
            await user.click(panel2Tab);

            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('123/popup/panel2'), {relative: 'path'});
        });

        it('should navigate to the correct path when the tab is clicked and recordId is defined', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} recordId="123" hasFlapPanel={false} />);

            const panel2Tab = screen.getByText('Panneau 2');
            await user.click(panel2Tab);

            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('panel2'), {relative: 'path'});
        });

        it('should navigate to the correct path when the tab is clicked and libraryId and panelType are defined', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockLibraryPanelApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} panelType="libraryPanel" recordId={undefined} />);

            const panel2Tab = screen.getByText('Panneau 2');
            await user.click(panel2Tab);

            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('workspace1'));
        });
    });

    describe('navigation tracking', () => {
        it('track a tab clicked event with the tab fullpage information', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} recordId="123" hasFlapPanel={false} where="fullpage" />);

            const panel2Tab = screen.getByText('Panneau 2');
            await user.click(panel2Tab);

            expect(matomo.trackNavigationEvent).toHaveBeenCalledWith(
                matomoEvents.actions.tab_clicked_fullpage,
                'Panneau 2',
            );
        });

        it('track a tab clicked event with the tab popup information', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} recordId="123" hasFlapPanel={false} where="popup" />);

            const panel2Tab = screen.getByText('Panneau 2');
            await user.click(panel2Tab);

            expect(matomo.trackNavigationEvent).toHaveBeenCalledWith(
                matomoEvents.actions.tab_clicked_popup,
                'Panneau 2',
            );
        });

        it('track a tab clicked event with the tab slider information', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} recordId="123" hasFlapPanel={false} where="slider" />);

            const panel2Tab = screen.getByText('Panneau 2');
            await user.click(panel2Tab);

            expect(matomo.trackNavigationEvent).toHaveBeenCalledWith(
                matomoEvents.actions.tab_clicked_slider,
                'Panneau 2',
            );
        });

        it('does not track when a flap panel is open', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([mockApplication] as any);

            renderWithTheme(<PanelsTabs {...defaultProps} recordId="123" hasFlapPanel where="fullpage" />);

            const panel2Tab = screen.getByText('Panneau 2');
            await user.click(panel2Tab);

            expect(matomo.trackNavigationEvent).not.toHaveBeenCalled();
        });
    });
});
