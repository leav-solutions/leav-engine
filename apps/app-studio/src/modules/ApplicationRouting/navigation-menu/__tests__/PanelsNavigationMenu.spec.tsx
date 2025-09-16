// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import * as ReactRouter from 'react-router-dom';
import * as Hook from '../usePanelHeader';
import {PanelsNavigationMenu} from '../PanelsNavigationMenu';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useOutletContext: jest.fn(),
    Navigate: jest.fn(),
    useNavigate: jest.fn(),
    generatePath: jest.fn()
}));

jest.mock('../usePanelHeader', () => ({
    usePanelHeader: jest.fn()
}));

const fakeSearch = '?query=test';

describe('PanelsNavigationMenu component', () => {
    const spyNavigateComponent = jest.spyOn(ReactRouter, 'Navigate');
    const spyNavigateMethod = jest.spyOn(ReactRouter, 'useNavigate');
    const spyOutletContext = jest.spyOn(ReactRouter, 'useOutletContext');
    const spyGeneratePath = jest.spyOn(ReactRouter, 'generatePath');
    const spyLocation = jest.spyOn(ReactRouter, 'useLocation');
    const spyUsePanelHeader = jest.spyOn(Hook, 'usePanelHeader');
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        jest.clearAllMocks();
        spyLocation.mockReturnValue({search: fakeSearch} as any);
        spyUsePanelHeader.mockReturnValue({recordId: null, PanelHeaderComponent: null});

        user = userEvent.setup();
    });

    describe('redirect to first panel when current one has children', () => {
        it('should redirect to first fullpage panel when current fullpage panel has children', async () => {
            spyOutletContext.mockReturnValue({
                currentFullpagePanel: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    children: [
                        {
                            id: 'test'
                        }
                    ]
                }
            });
            spyGeneratePath.mockReturnValueOnce('/panel1_generated');

            render(<PanelsNavigationMenu level="fullpage" />);

            expect(spyGeneratePath).toHaveBeenCalledTimes(1);
            expect(spyGeneratePath).toHaveBeenCalledWith('/:panelId', {panelId: 'test'});

            expect(spyNavigateComponent).toHaveBeenCalledTimes(1);
            expect(spyNavigateComponent).toHaveBeenCalledWith({replace: true, to: '/panel1_generated?query=test'}, {});
        });
        it('should redirect to first popup panel when current popup panel has children', async () => {
            spyOutletContext.mockReturnValue({
                currentPopupPanel: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    children: [
                        {
                            id: 'test'
                        }
                    ]
                }
            });
            spyGeneratePath.mockReturnValueOnce('/panel1_generated');

            render(<PanelsNavigationMenu level="popup" />);

            expect(spyGeneratePath).toHaveBeenCalledTimes(1);
            expect(spyGeneratePath).toHaveBeenCalledWith('popup?/:popupPanelId', {popupPanelId: 'test'});

            expect(spyNavigateComponent).toHaveBeenCalledTimes(1);
            expect(spyNavigateComponent).toHaveBeenCalledWith({replace: true, to: '/panel1_generated?query=test'}, {});
        });
        it('should redirect to first slider panel when current slider panel has children', async () => {
            spyOutletContext.mockReturnValue({
                currentSliderPanel: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    children: [
                        {
                            id: 'test'
                        }
                    ]
                }
            });
            spyGeneratePath.mockReturnValueOnce('/panel1_generated');

            render(<PanelsNavigationMenu level="slider" />);

            expect(spyGeneratePath).toHaveBeenCalledTimes(1);
            expect(spyGeneratePath).toHaveBeenCalledWith('slider?/:sliderPanelId', {sliderPanelId: 'test'});

            expect(spyNavigateComponent).toHaveBeenCalledTimes(1);
            expect(spyNavigateComponent).toHaveBeenCalledWith({replace: true, to: '/panel1_generated?query=test'}, {});
        });
    });

    describe.each([
        {
            level: 'fullpage',
            hookName: 'currentFullpagePanel',
            hookParentName: 'currentFullpageParentTuple',
            expectedToNavigate: ['/:panelId', {panelId: 'test1'}]
        },
        {
            level: 'slider',
            hookName: 'currentSliderPanel',
            hookParentName: 'currentSliderParentTuple',
            expectedToNavigate: ['slider?/:sliderPanelId', {sliderPanelId: 'test1'}]
        },
        {
            level: 'popup',
            hookName: 'currentPopupPanel',
            hookParentName: 'currentPopupParentTuple',
            expectedToNavigate: ['popup?/:popupPanelId', {popupPanelId: 'test1'}]
        }
    ] as const)('change tabs, change url', ({level, hookName, hookParentName, expectedToNavigate}) => {
        it(`[${level}] should not display tabs when panel has not brothers`, async () => {
            spyOutletContext.mockReturnValue({
                [hookName]: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    content: {
                        type: 'custom',
                        iframeSource: 'https://test.com'
                    }
                }
            });

            render(<PanelsNavigationMenu level={level} />);

            expect(screen.queryAllByRole('tab')).toHaveLength(0);
        });
        it(`[${level}] should print all tabs`, async () => {
            const currentPanel = {
                id: 'test2',
                name: {
                    en: 'test2'
                }
            };
            spyOutletContext.mockReturnValue({
                [hookName]: currentPanel,
                [hookParentName]: [
                    {
                        id: 'panelId',
                        name: {
                            en: 'Panel 1',
                            fr: 'Panneau 1'
                        },
                        children: [
                            {
                                id: 'test1',
                                name: {
                                    en: 'test1'
                                }
                            },
                            currentPanel,
                            {
                                id: 'test3',
                                name: {
                                    en: 'test3'
                                }
                            }
                        ]
                    }
                ]
            });

            render(<PanelsNavigationMenu level={level} />);

            expect(screen.getAllByRole('tab')).toHaveLength(3);
        });
        it(`[${level}] should change url when clicking on tab`, async () => {
            const mockNavigate = jest.fn();
            spyNavigateMethod.mockReturnValue(mockNavigate);
            const fakePath = '/fake_path';
            spyGeneratePath.mockReturnValue(fakePath);
            const currentPanel = {
                id: 'test2',
                name: {
                    en: 'test2'
                }
            };
            spyOutletContext.mockReturnValue({
                [hookName]: currentPanel,
                [hookParentName]: [
                    {
                        id: 'panelId',
                        name: {
                            en: 'Panel 1',
                            fr: 'Panneau 1'
                        },
                        children: [
                            {
                                id: 'test1',
                                name: {
                                    en: 'test1'
                                }
                            },
                            currentPanel,
                            {
                                id: 'test3',
                                name: {
                                    en: 'test3'
                                }
                            }
                        ]
                    }
                ]
            });

            render(<PanelsNavigationMenu level={level} />);

            const [tab1, tab2, tab3] = screen.getAllByRole('tab');

            await user.click(tab1);

            expect(spyGeneratePath).toHaveBeenCalledTimes(1);
            expect(spyGeneratePath).toHaveBeenCalledWith(...expectedToNavigate);

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(fakePath + fakeSearch);
        });
    });

    describe('Header', () => {
        it('[fullpage] should display header on this level', async () => {
            spyUsePanelHeader.mockReturnValue({recordId: 'dont care', PanelHeaderComponent: <span>HEADER</span>});
            const currentPanel = {
                id: 'test2',
                name: {
                    en: 'test2'
                }
            };
            spyOutletContext.mockReturnValue({
                currentFullpagePanel: currentPanel
            });
            render(<PanelsNavigationMenu level="fullpage" />);

            expect(screen.getByText('HEADER')).toBeVisible();
        });
        it.each([
            ['slider', 'currentSliderPanel'],
            ['popup', 'currentPopupPanel']
        ] as const)('[%s] should hide header on level', async (level, hookName) => {
            spyUsePanelHeader.mockReturnValue({recordId: 'dont care', PanelHeaderComponent: <span>HEADER</span>});
            const currentPanel = {
                id: 'test2',
                name: {
                    en: 'test2'
                }
            };
            spyOutletContext.mockReturnValue({
                [hookName]: currentPanel
            });

            render(<PanelsNavigationMenu level={level} />);

            expect(screen.queryByText('HEADER')).not.toBeInTheDocument();
        });
    });
});
