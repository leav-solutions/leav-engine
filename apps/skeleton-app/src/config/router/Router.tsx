// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useRef} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {APP_ENDPOINT, APPS_ENDPOINT, Explorer} from '@leav/ui';
import {KitGrid, AntLayout} from 'aristid-ds';
import ApplicationRouting from '../../modules/ApplicationRouting/ApplicationRouting';
import {NotFoundPage} from '../../pages/NotFoundPage/NotFoundPage';
import {SIDEBAR_CONTENT_ID} from '../../constants';

export const Router: FunctionComponent = () => {
    const explorerContainerRef = useRef<HTMLDivElement>(null);

    return (
        <BrowserRouter basename={`${APPS_ENDPOINT}/${APP_ENDPOINT}`}>
            <AntLayout style={{height: '100vh', overflow: 'hidden', position: 'relative'}} ref={explorerContainerRef}>
                <Explorer.EditSettingsContextProvider panelElement={() => explorerContainerRef.current}>
                    <Routes>
                        <Route path={'/*'} element={<ApplicationRouting />} />
                        <Route element={<NotFoundPage />} />
                    </Routes>
                </Explorer.EditSettingsContextProvider>
                <KitGrid.KitCol>
                    <div id={SIDEBAR_CONTENT_ID} />
                </KitGrid.KitCol>
            </AntLayout>
        </BrowserRouter>
    );
};
