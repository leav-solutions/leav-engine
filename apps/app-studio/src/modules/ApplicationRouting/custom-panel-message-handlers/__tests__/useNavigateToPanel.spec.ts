// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import {useNavigateToPanel} from '../useNavigateToPanel';
import {INestedPanel} from '_ui/hooks/useIFrameMessenger/types';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useOutletContext: jest.fn(),
    useParams: jest.fn()
}));

describe('useNavigateToPanel', () => {
    const spyUseOutletContext = jest.spyOn(ReactRouter, 'useOutletContext');
    const spyUseNavigate = jest.spyOn(ReactRouter, 'useNavigate');
    const spyUseParamsMock = jest.spyOn(ReactRouter, 'useParams');
    const navigateMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
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

        expect(navigateMock).toHaveBeenCalledWith('/panelIdTest');
    });

    describe('when data includes a panel', () => {
        it('should call addPanel and navigate to the panel when where is fullpage', () => {
            const addPanelMock = jest.fn();

            const {
                result: {current}
            } = renderHook(() => useNavigateToPanel(addPanelMock));

            const panelData: INestedPanel = {
                where: 'fullpage',
                what: {id: 'panelIdTest', name: 'Test Panel', children: []}
            };

            current.navigateToPanel(panelData);

            expect(addPanelMock).toHaveBeenCalledWith(panelData.what, {
                workspaceId: 'workspaceId',
                panelId: 'currentPanelId'
            });
            expect(navigateMock).toHaveBeenCalledWith('/panelIdTest');
        });

        it('should call addPanel and navigate to the panel when where is popup', () => {
            const addPanelMock = jest.fn();

            const {
                result: {current}
            } = renderHook(() => useNavigateToPanel(addPanelMock));

            const panelData: INestedPanel = {
                where: 'popup',
                what: {id: 'popupPanelIdTest', name: 'Test Panel', children: []}
            };

            current.navigateToPanel(panelData);

            expect(addPanelMock).toHaveBeenCalledWith(panelData.what, {
                workspaceId: 'workspaceId',
                panelId: 'currentPanelId'
            });

            expect(navigateMock).toHaveBeenCalledWith('popup/popupPanelIdTest');
        });

        it('should call addPanel and navigate to the panel when where is slider', () => {
            const addPanelMock = jest.fn();

            const {
                result: {current}
            } = renderHook(() => useNavigateToPanel(addPanelMock));

            const panelData: INestedPanel = {
                where: 'slider',
                what: {id: 'sliderPanelIdTest', name: 'Test Panel', children: []}
            };

            current.navigateToPanel(panelData);

            expect(addPanelMock).toHaveBeenCalledWith(panelData.what, {
                workspaceId: 'workspaceId',
                panelId: 'currentPanelId'
            });

            expect(navigateMock).toHaveBeenCalledWith('slider/sliderPanelIdTest');
        });
    });
});
