// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import {useNavigateToPanel} from '../useNavigateToPanel';
import {type INestedPanel} from '_ui/hooks/useIFrameMessenger/types';
import {useLocation} from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useOutletContext: jest.fn(),
    useParams: jest.fn(),
    useLocation: jest.fn()
}));

describe('useNavigateToPanel', () => {
    const spyUseOutletContext = jest.spyOn(ReactRouter, 'useOutletContext');
    const spyUseNavigate = jest.spyOn(ReactRouter, 'useNavigate');
    const spyUseLocation = jest.spyOn(ReactRouter, 'useLocation');
    const spyUseParamsMock = jest.spyOn(ReactRouter, 'useParams');
    const navigateMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
        spyUseLocation.mockReturnValue({search: '?recordId=fakeId'} as any);
        spyUseOutletContext.mockReturnValue({
            currentPanel: {id: 'currentPanelId'},
            currentWorkspace: {id: 'workspaceId'}
        });
        spyUseParamsMock.mockReturnValue({panelId: 'currentPanelId'});
    });

    it('should provide a method to navigate to a panel', async () => {
        const {
            result: {current}
        } = renderHook(() => useNavigateToPanel(jest.fn()));

        current.navigateToPanel({panelId: 'panelIdTest'});

        expect(navigateMock).toHaveBeenCalledWith('/panelIdTest?recordId=fakeId');
    });

    describe('when data includes a panel', () => {
        it('should call addPanel and navigate to the panel when where is fullpage', () => {
            const addPanelMock = jest.fn();

            const {
                result: {current}
            } = renderHook(() => useNavigateToPanel(addPanelMock));

            const panelData: INestedPanel = {
                panelTargetId: 'panelIdChild',
                recordId: '1234567890',
                where: 'fullpage',
                what: {
                    id: 'panelIdTest',
                    children: [
                        {id: 'panelIdChild', content: {type: 'custom', iframeSource: 'https://test.aristid.com'}}
                    ]
                }
            };

            current.navigateToPanel(panelData);

            expect(addPanelMock).toHaveBeenCalledWith(panelData.what, {
                workspaceId: 'workspaceId',
                panelId: 'currentPanelId'
            });
            expect(navigateMock).toHaveBeenCalledWith('/panelIdChild?fullpageRecordId=1234567890');
        });

        it('should call addPanel and navigate to the panel when where is popup', () => {
            const addPanelMock = jest.fn();

            const {
                result: {current}
            } = renderHook(() => useNavigateToPanel(addPanelMock));

            const panelData: INestedPanel = {
                panelTargetId: 'panelIdChild',
                recordId: '1234567890',
                where: 'popup',
                what: {
                    id: 'popupPanelIdTest',
                    children: [
                        {id: 'panelIdChild', content: {type: 'custom', iframeSource: 'https://test.aristid.com'}}
                    ]
                }
            };

            current.navigateToPanel(panelData);

            expect(addPanelMock).toHaveBeenCalledWith(panelData.what, {
                workspaceId: 'workspaceId',
                panelId: 'currentPanelId'
            });

            expect(navigateMock).toHaveBeenCalledWith('popup/panelIdChild?recordId=fakeId');
        });

        it('should call addPanel and navigate to the panel when where is slider', () => {
            const addPanelMock = jest.fn();

            const {
                result: {current}
            } = renderHook(() => useNavigateToPanel(addPanelMock));

            const panelData: INestedPanel = {
                panelTargetId: 'panelIdChild',
                recordId: '1234567890',
                where: 'slider',
                what: {
                    id: 'sliderPanelIdTest',
                    children: [
                        {id: 'panelIdChild', content: {type: 'custom', iframeSource: 'https://test.aristid.com'}}
                    ]
                }
            };

            current.navigateToPanel(panelData);

            expect(addPanelMock).toHaveBeenCalledWith(panelData.what, {
                workspaceId: 'workspaceId',
                panelId: 'currentPanelId'
            });

            expect(navigateMock).toHaveBeenCalledWith('slider/panelIdChild?recordId=fakeId');
        });

        it('should validate the nested panel structure before navigate (error case)', async () => {
            const addPanelMock = jest.fn();
            const spyOnConsoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn);

            const {
                result: {current}
            } = renderHook(() => useNavigateToPanel(addPanelMock));

            const panelData: INestedPanel = {
                panelTargetId: 'panelIdChild',
                recordId: '1234567890',
                where: 'slider',
                what: {
                    id: 'sliderPanelIdTest',
                    name: 'wrong format',
                    children: [
                        {id: 'panelIdChild', content: {type: 'custom', iframeSource: 'https://test.aristid.com'}}
                    ]
                }
            };

            current.navigateToPanel(panelData);

            expect(addPanelMock).toHaveBeenCalledTimes(0);
            expect(navigateMock).toHaveBeenCalledTimes(0);
            expect(spyOnConsoleError).toHaveBeenCalledTimes(1);
        });
    });
});
