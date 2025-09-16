// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, renderHook} from '_ui/_tests/testUtils';
import {usePanelHeader} from '../usePanelHeader';
import {fullpageRecordSearchParamsName, popupRecordSearchParamsName, sliderRecordSearchParamsName} from '../../routes';
import * as ReactRouter from 'react-router-dom';
import * as LibraryIdCardComponent from '../LibraryIdCard';
import * as RecordIdCardComponent from '../RecordIdCard';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useOutletContext: jest.fn()
}));

jest.mock('../LibraryIdCard', () => ({
    LibraryIdCard: jest.fn()
}));

jest.mock('../RecordIdCard', () => ({
    RecordIdCard: jest.fn()
}));

const fakeSearch = '?query=test';

describe('usePanelHeader hook', () => {
    const spyLocation = jest.spyOn(ReactRouter, 'useLocation');
    const spyOutletContext = jest.spyOn(ReactRouter, 'useOutletContext');
    const spyLibraryIdCard = jest.spyOn(LibraryIdCardComponent, 'LibraryIdCard');
    const spyRecordIdCard = jest.spyOn(RecordIdCardComponent, 'RecordIdCard');

    beforeEach(() => {
        jest.clearAllMocks();
        spyLocation.mockReturnValue({search: fakeSearch} as any);
    });

    describe.each([
        {
            level: 'fullpage',
            hookName: 'currentFullpagePanel'
        },
        {
            level: 'popup',
            hookName: 'currentPopupPanel'
        },
        {
            level: 'slider',
            hookName: 'currentSliderPanel'
        }
    ] as const)('library whatMode', ({level, hookName}) => {
        it(`[${level}] should use name from configuration when given`, async () => {
            spyOutletContext.mockReturnValue({
                [hookName]: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    content: {
                        type: 'custom',
                        iframeSource: '/app/amont'
                    }
                }
            });

            const {result} = renderHook(() => usePanelHeader({level}));

            render(result.current.PanelHeaderComponent);

            expect(spyLibraryIdCard).toHaveBeenCalledTimes(1);
            expect(spyLibraryIdCard).toHaveBeenCalledWith({libraryId: null, title: 'Panneau 1'}, {});
        });

        it(`[${level}] should find libraryId if name not given`, async () => {
            spyOutletContext.mockReturnValue({
                [hookName]: {
                    id: 'panelId',
                    content: {
                        type: 'explorer',
                        libraryId: 'users'
                    }
                }
            });

            const {result} = renderHook(() => usePanelHeader({level}));

            render(result.current.PanelHeaderComponent);

            expect(spyLibraryIdCard).toHaveBeenCalledTimes(1);
            expect(spyLibraryIdCard).toHaveBeenCalledWith({libraryId: 'users', title: null}, {});
        });

        it(`[${level}] should retrieve libraryId from workspace`, async () => {
            spyOutletContext.mockReturnValue({
                [hookName]: {
                    id: 'panelId',
                    content: {
                        type: 'explorer',
                        libraryId: '<props>'
                    }
                },
                currentWorkspace: {
                    entrypoint: {
                        libraryId: 'fromWorkspace'
                    }
                }
            });

            const {result} = renderHook(() => usePanelHeader({level}));

            render(result.current.PanelHeaderComponent);

            expect(spyLibraryIdCard).toHaveBeenCalledTimes(1);
            expect(spyLibraryIdCard).toHaveBeenCalledWith({libraryId: 'fromWorkspace', title: null}, {});
        });

        it(`[${level}] should not fill the record`, async () => {
            spyOutletContext.mockReturnValue({
                [hookName]: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    content: {
                        type: 'custom',
                        iframeSource: '/app/amont'
                    }
                }
            });

            const {result} = renderHook(() => usePanelHeader({level}));

            expect(result.current.recordId).toBe(null);
        });
    });

    describe('record whatMode', () => {
        it.each([
            ['fullpage', fullpageRecordSearchParamsName],
            ['popup', popupRecordSearchParamsName],
            ['slider', sliderRecordSearchParamsName]
        ] as const)('[%s] should provide good recordId', async (level, searchParamName) => {
            spyOutletContext.mockReturnValue({
                currentFullpagePanel: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    content: {
                        type: 'custom',
                        iframeSource: '/app/amont'
                    }
                }
            });
            const searchValue = '0123456789';
            spyLocation.mockReturnValue({search: `${fakeSearch}&${searchParamName}=${searchValue}`} as any);

            const {result} = renderHook(() => usePanelHeader({level}));

            expect(result.current.recordId).toBe(searchValue);
        });

        it('[fullpage] should fill libraryId correctly from ascendancy', async () => {
            spyOutletContext.mockReturnValue({
                currentFullpageParentTuple: [
                    {
                        id: 'panelId',
                        name: {
                            en: 'Panel 1',
                            fr: 'Panneau 1'
                        },
                        libraryId: 'libraryId',
                        children: []
                    }
                ]
            });
            const searchValue = '0123456789';
            spyLocation.mockReturnValue({
                search: `${fakeSearch}&${fullpageRecordSearchParamsName}=${searchValue}`
            } as any);

            const {result} = renderHook(() => usePanelHeader({level: 'fullpage'}));

            render(result.current.PanelHeaderComponent);

            expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
            expect(spyRecordIdCard).toHaveBeenCalledWith(
                {
                    currentRecordId: '0123456789',
                    libraryId: 'libraryId'
                },
                {}
            );
        });

        it.each([
            ['popup', popupRecordSearchParamsName],
            ['slider', sliderRecordSearchParamsName]
        ] as const)('[%s] should fill libraryId correctly from ascendancy', async (level, searchParamsName) => {
            spyOutletContext.mockReturnValue({
                currentFullpagePanel: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    content: {
                        type: 'explorer',
                        libraryId: 'libraryId'
                    }
                }
            });
            const searchValue = '0123456789';
            spyLocation.mockReturnValue({
                search: `${fakeSearch}&${searchParamsName}=${searchValue}`
            } as any);

            const {result} = renderHook(() => usePanelHeader({level}));

            render(result.current.PanelHeaderComponent);

            expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
            expect(spyRecordIdCard).toHaveBeenCalledWith(
                {
                    currentRecordId: '0123456789',
                    libraryId: 'libraryId'
                },
                {}
            );
        });

        it('[fullpage] should fill libraryId correctly from workspace', async () => {
            const currentPanel = {
                id: 'test'
            };
            spyOutletContext.mockReturnValue({
                currentFullpageParentTuple: [
                    {
                        id: 'panelId',
                        name: {
                            en: 'Panel 1',
                            fr: 'Panneau 1'
                        },
                        libraryId: '<props>',
                        children: [
                            {
                                currentPanel
                            }
                        ]
                    }
                ],
                currentWorkspace: {
                    entrypoint: {
                        libraryId: 'fromWorkspace'
                    }
                }
            });
            const searchValue = '0123456789';
            spyLocation.mockReturnValue({
                search: `${fakeSearch}&${fullpageRecordSearchParamsName}=${searchValue}`
            } as any);

            const {result} = renderHook(() => usePanelHeader({level: 'fullpage'}));

            render(result.current.PanelHeaderComponent);

            expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
            expect(spyRecordIdCard).toHaveBeenCalledWith(
                {
                    currentRecordId: '0123456789',
                    libraryId: 'fromWorkspace'
                },
                {}
            );
        });

        it.each([
            ['popup', popupRecordSearchParamsName],
            ['slider', sliderRecordSearchParamsName]
        ] as const)('[%s] should fill libraryId correctly from workspace', async (level, searchParamsName) => {
            spyOutletContext.mockReturnValue({
                currentFullpagePanel: {
                    id: 'panelId',
                    name: {
                        en: 'Panel 1',
                        fr: 'Panneau 1'
                    },
                    content: {
                        type: 'explorer',
                        libraryId: '<props>'
                    }
                },
                currentWorkspace: {
                    entrypoint: {
                        libraryId: 'fromWorkspace'
                    }
                }
            });
            const searchValue = '0123456789';
            spyLocation.mockReturnValue({
                search: `${fakeSearch}&${searchParamsName}=${searchValue}`
            } as any);

            const {result} = renderHook(() => usePanelHeader({level}));

            render(result.current.PanelHeaderComponent);

            expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
            expect(spyRecordIdCard).toHaveBeenCalledWith(
                {
                    currentRecordId: '0123456789',
                    libraryId: 'fromWorkspace'
                },
                {}
            );
        });
    });
});
