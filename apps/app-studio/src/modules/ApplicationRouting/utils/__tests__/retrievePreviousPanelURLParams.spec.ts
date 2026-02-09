// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {retrievePreviousPanelURLParams} from '../retrievePreviousPanelURLParams';

describe('retrievePreviousPanelURLParams', () => {
    const setLocationPathname = (pathname: string) => {
        // Utilise l'API standard de l'history pour mettre à jour location.pathname
        window.history.pushState({}, '', pathname);
    };

    it('should retrieve previous panel params when there is no flap', () => {
        setLocationPathname(
            '/app/app-studio/maps-management/map-list/9986581/fullpage/planning/2246488065/fullpage/planning_campaigns_form',
        );

        const result = retrievePreviousPanelURLParams({
            recordId: '2246488065',
            where: 'fullpage',
            recordPanelId: 'planning_campaigns_form',
        });

        expect(result).toEqual({
            previousRecordId: '9986581',
            previousWhere: 'fullpage',
            previousRecordPanelId: 'planning',
            isPreviousPanelFirstLevel: false,
        });
    });

    it('should retrieve previous panel params when there is a flap after previous panel', () => {
        setLocationPathname(
            '/app/app-studio/maps-management/map-list/9986581/fullpage/planning/flap/1234/campaigns/thread/2246488065/fullpage/planning_campaigns_form',
        );

        const result = retrievePreviousPanelURLParams({
            recordId: '2246488065',
            where: 'fullpage',
            recordPanelId: 'planning_campaigns_form',
        });

        expect(result).toEqual({
            previousRecordId: '9986581',
            previousWhere: 'fullpage',
            previousRecordPanelId: 'planning',
            isPreviousPanelFirstLevel: false,
        });
    });

    it('should retrieve previous panel params when current panel has a flap', () => {
        setLocationPathname(
            '/app/app-studio/maps-management/map-list/9986581/fullpage/planning/flap/1234/campaigns/thread',
        );

        const result = retrievePreviousPanelURLParams({
            recordId: '1234',
            where: 'campaigns',
            recordPanelId: 'thread',
        });

        expect(result).toEqual({
            previousRecordId: '9986581',
            previousWhere: 'fullpage',
            previousRecordPanelId: 'planning',
            isPreviousPanelFirstLevel: false,
        });
    });

    it('should detect first level previous panel', () => {
        setLocationPathname('/app/app-studio/maps-management/map-list');

        const result = retrievePreviousPanelURLParams({
            recordId: '9986581',
            where: 'fullpage',
            recordPanelId: 'planning',
        });

        expect(result).toEqual({
            previousRecordId: null,
            previousWhere: null,
            previousRecordPanelId: 'map-list',
            isPreviousPanelFirstLevel: true,
        });
    });
});
