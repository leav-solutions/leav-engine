import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../../../types';
import {useNavigateToIframe} from '../useNavigateToIframe';

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: vi.fn(),
}));

vi.mock('../../../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

describe('useNavigateToIframe', () => {
    const spyUseNavigate = vi.spyOn(ReactRouter, 'useNavigate');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const navigateMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
    });

    it('should provide a method to navigate to a panel and modify application configuration', async () => {
        const mockSetApplication = vi.fn();
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
                                isViewSettingsActive: false,
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            mockSetApplication,
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToIframe());

        current.navigateToIframe({
            panel: {
                id: 'panelIdTest',
                type: 'custom',
                iframeSource: 'https://fakeurl.aristid.com/fake/path',
                isStandalone: true,
            },
            destination: {
                libraryId: 'test1',
            },
            recordId: '1234567890',
            where: 'fullpage',
            recordPanelId: 'panelIdTest',
        });

        expect(mockSetApplication).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith('1234567890/fullpage/panelIdTest');
    });
});
