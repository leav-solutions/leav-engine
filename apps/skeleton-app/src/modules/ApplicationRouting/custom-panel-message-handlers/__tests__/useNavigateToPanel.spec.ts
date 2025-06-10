// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import {useNavigateToPanel} from '../useNavigateToPanel';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));

describe('useNavigateToPanel', () => {
    it('should provide a method to navigate to a panel', async () => {
        const navigateMock = jest.fn();
        jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateMock);
        const {
            result: {current}
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({panelId: 'panelIdTest'});

        expect(navigateMock).toHaveBeenCalledWith('/panelIdTest');
    });
});
