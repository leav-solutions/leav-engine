// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {type Application} from '../../../types';
import {useNavigateToPanel} from '../useNavigateToPanel';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

jest.mock('../../../../../config/application-instance/application-settings/ApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn(),
}));

describe('useNavigateToPanel', () => {
    const spyUseNavigate = jest.spyOn(ReactRouter, 'useNavigate');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const navigateMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
    });

    it('should provide a method to navigate to a panel', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
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
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            jest.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'useless due to other fields fulfillment',
            recordId: '1234567890',
            where: 'fullpage',
            panelId: 'panelIdTest',
        });

        expect(navigateMock).toHaveBeenCalledWith('1234567890/fullpage/panelIdTest');
    });

    it('should not navigate when record not defined', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
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
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            jest.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'test1',
            where: 'fullpage',
            panelId: 'panelIdTest',
        });

        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should navigate for first panel in given library', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
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
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            jest.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'test1',
            recordId: '1234567890',
            where: 'fullpage',
        });

        expect(navigateMock).toHaveBeenCalledWith('1234567890/fullpage/panelIdTest');
    });

    it('should looking for first panel in given library and do nothing when library as no panel', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
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
                ],
                libraries: {
                    empty: {
                        libraryPanels: [],
                        recordPanels: [],
                    },
                },
            } satisfies Application,
            jest.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'test1',
            recordId: '1234567890',
            where: 'fullpage',
        });

        expect(navigateMock).not.toHaveBeenCalled();

        current.navigateToPanel({
            libraryId: 'empty',
            recordId: '1234567890',
            where: 'fullpage',
        });

        expect(navigateMock).not.toHaveBeenCalled();
    });
});
