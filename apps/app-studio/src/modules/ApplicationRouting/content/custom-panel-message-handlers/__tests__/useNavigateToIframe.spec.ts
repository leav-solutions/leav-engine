// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {type Application} from '../../../types';
import {useNavigateToIframe} from '../useNavigateToIframe';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));

jest.mock('../../../../../config/application-instance/application-settings/ApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn()
}));

describe('useNavigateToIframe', () => {
    const spyUseNavigate = jest.spyOn(ReactRouter, 'useNavigate');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const navigateMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
    });

    it('should provide a method to navigate to a panel and modify application configuration', async () => {
        const mockSetApplication = jest.fn();
        spyUseApplicationSettingsContext.mockReturnValue([
            {
                workspaces: [
                    {
                        id: '1',
                        title: {
                            fr: 'un',
                            en: 'one'
                        },
                        icon: 'fa-house',
                        type: 'library',
                        libraryId: 'test1'
                    }
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                actions: []
                            }
                        ]
                    }
                }
            } satisfies Application,
            mockSetApplication
        ]);

        const {
            result: {current}
        } = renderHook(() => useNavigateToIframe());

        current.navigateToIframe({
            panel: {
                id: 'panelIdTest',
                type: 'custom',
                iframeSource: 'https://fakeurl.aristid.com/fake/path',
                isStandalone: true
            },
            destination: {
                libraryId: 'test1'
            },
            recordId: '1234567890',
            where: 'fullpage',
            recordPanelId: 'panelIdTest'
        });

        expect(mockSetApplication).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith('1234567890/fullpage/panelIdTest');
    });
});
