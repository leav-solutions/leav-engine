// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import * as ReactRouter from 'react-router-dom';
import {useDisplayConditions} from '../useDisplayConditions';

import {AbsolutePaths} from '../../router/paths';

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(() => ({pathname: ''})),
    useMatch: jest.fn(() => ({
        params: {
            '*': '',
        },
    })),
    useParams: jest.fn(() => ({})),
}));

describe('useDisplayConditions hook', () => {
    const spyOnUseLocation = jest.spyOn(ReactRouter, 'useLocation');
    const spyOnUseMatch = jest.spyOn(ReactRouter, 'useMatch');
    const spyOnUseParams = jest.spyOn(ReactRouter, 'useParams');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should provide 3 flags', async () => {
        const {
            result: {current},
        } = renderHook(() => useDisplayConditions());

        expect(spyOnUseMatch).toHaveBeenCalledWith(AbsolutePaths.panel);
        expect(current).toEqual({
            isLastFullpagePanel: expect.any(Boolean),
            isLastLevelRecordPanel: expect.any(Boolean),
            isFirstPanel: expect.any(Boolean),
        });
    });

    it('should flag the first panel', async () => {
        spyOnUseParams.mockReturnValue({where: undefined});

        const {
            result: {current},
        } = renderHook(() => useDisplayConditions());

        expect(current.isFirstPanel).toBe(true);
    });

    it('should flag the last level record panel', async () => {
        const recordId = '1234567890';
        const where = 'slider';
        const recordPanelId = 'panelIdTest';
        spyOnUseParams.mockReturnValue({
            recordId,
            where,
            recordPanelId,
        });
        spyOnUseLocation.mockReturnValue({
            pathname: `/workspaceId/firstFullpagePanelId/0987654321/fullpage/fakeRecordPanelId/${recordId}/${where}/${recordPanelId}`,
        } as any);

        const {
            result: {current},
        } = renderHook(() => useDisplayConditions());

        expect(current.isLastLevelRecordPanel).toBe(true);
    });

    describe('flag the last fullpage panel', () => {
        it('should be true when first panel is the only one in fullpage', async () => {
            const levels = '0987654321/slider/fakeRecordPanelId/1234567890/popup/panelIdTest';
            spyOnUseParams.mockReturnValue({
                recordId: undefined,
                where: undefined,
                recordPanelId: undefined,
            });
            spyOnUseMatch.mockReturnValue({
                params: {
                    '*': levels,
                },
            } as any);
            spyOnUseLocation.mockReturnValue({
                pathname: `/workspaceId/firstFullpagePanelId/${levels}`,
            } as any);

            const {
                result: {current},
            } = renderHook(() => useDisplayConditions());

            expect(current.isLastFullpagePanel).toBe(true);
        });
        it('should be false when first panel is followed by at least one fullpage panel', async () => {
            const levels = '0987654321/fullpage/fakeRecordPanelId/1234567890/fullpage/panelIdTest';
            spyOnUseParams.mockReturnValue({
                recordId: undefined,
                where: undefined,
                recordPanelId: undefined,
            });
            spyOnUseMatch.mockReturnValue({
                params: {
                    '*': levels,
                },
            } as any);
            spyOnUseLocation.mockReturnValue({
                pathname: `/workspaceId/firstFullpagePanelId/${levels}`,
            } as any);

            const {
                result: {current},
            } = renderHook(() => useDisplayConditions());

            expect(current.isLastFullpagePanel).toBe(false);
        });
        it('should be true when current panel is fullpage panel and is not followed by another fullpage panel', async () => {
            const recordId = '1234567890';
            const where = 'fullpage';
            const recordPanelId = 'panelIdTest';
            const levels = `0987654321/fullpage/fakeRecordPanelId/${recordId}/${where}/${recordPanelId}`;
            spyOnUseParams.mockReturnValue({
                recordId,
                where,
                recordPanelId,
            });
            spyOnUseMatch.mockReturnValue({
                params: {
                    '*': levels,
                },
            } as any);
            spyOnUseLocation.mockReturnValue({
                pathname: `/workspaceId/firstFullpagePanelId/${levels}`,
            } as any);

            const {
                result: {current},
            } = renderHook(() => useDisplayConditions());

            expect(current.isLastFullpagePanel).toBe(true);
        });
        it('should be false when current panel is fullpage panel and is followed by other fullpage panels', async () => {
            const recordId = '1234567890';
            const where = 'fullpage';
            const recordPanelId = 'panelIdTest';
            const levels = `${recordId}/${where}/${recordPanelId}/0987654321/fullpage/fakeRecordPanelId`;
            spyOnUseParams.mockReturnValue({
                recordId,
                where,
                recordPanelId,
            });
            spyOnUseMatch.mockReturnValue({
                params: {
                    '*': levels,
                },
            } as any);
            spyOnUseLocation.mockReturnValue({
                pathname: `/workspaceId/firstFullpagePanelId/${levels}`,
            } as any);

            const {
                result: {current},
            } = renderHook(() => useDisplayConditions());

            expect(current.isLastFullpagePanel).toBe(false);
        });
    });
});
