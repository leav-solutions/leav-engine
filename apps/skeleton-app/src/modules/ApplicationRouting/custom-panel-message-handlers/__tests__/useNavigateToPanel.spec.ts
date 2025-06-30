// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import {useNavigateToPanel} from '../useNavigateToPanel';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useOutletContext: jest.fn()
}));

describe('useNavigateToPanel', () => {
    const spyUseOutletContext = jest.spyOn(ReactRouter, 'useOutletContext');
    const spyUseNavigate = jest.spyOn(ReactRouter, 'useNavigate');
    const navigateMock = jest.fn();

    beforeEach(() => {
        spyUseNavigate.mockReturnValue(navigateMock);
        spyUseOutletContext.mockReturnValue({
            currentPanel: {id: 'currentPanelId'},
            currentWorkspace: {id: 'workspaceId'}
        });
    });

    it('should provide a method to navigate to a panel', async () => {
        const {
            result: {current}
        } = renderHook(() => useNavigateToPanel(jest.fn()));

        current.navigateToPanel({panelId: 'panelIdTest'});

        expect(navigateMock).toHaveBeenCalledWith('/panelIdTest');
    });

    it('should call addPanel when data includes a panel', () => {
        const addPanelMock = jest.fn();

        const {
            result: {current}
        } = renderHook(() => useNavigateToPanel(addPanelMock));

        const panelData = {
            panelId: 'panelIdTest',
            panel: {id: 'panelIdTest', name: 'Test Panel', children: []}
        };

        current.navigateToPanel(panelData);

        expect(addPanelMock).toHaveBeenCalledWith(panelData.panel, {
            workspaceId: 'workspaceId',
            panelId: 'currentPanelId'
        });
        expect(navigateMock).toHaveBeenCalledWith('/panelIdTest');
    });
});
