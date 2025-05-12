// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {APP_ENDPOINT, APPS_ENDPOINT} from '@leav/ui';
import {InitTranslation} from './config/translation/InitTranslation';
import {InitTheme} from './config/theme/InitTheme';
import {InitNetwork} from './config/network/InitNetwork';
import {GuardApplicationAccess} from './config/authentification/GuardApplicationAccess';
import {InitUser} from './config/user/InitUser';
import {InitRouting} from './config/router/InitRouting';
import {InitLayout} from './modules/layout/InitLayout';
import {InitApplicationRouter} from './modules/ApplicationRouting/InitApplicationRouter';

export const Index: FunctionComponent = () => (
    <InitNetwork>
        <InitTranslation>
            <InitUser>
                <InitTheme>
                    <GuardApplicationAccess>
                        <InitRouting>
                            <InitLayout>
                                <InitApplicationRouter />
                            </InitLayout>
                        </InitRouting>
                    </GuardApplicationAccess>
                </InitTheme>
            </InitUser>
        </InitTranslation>
    </InitNetwork>
);

const root = createRoot(document.getElementById('root'));
root.render(<Index />);
