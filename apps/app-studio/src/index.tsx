// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {createRoot} from 'react-dom/client';
import {InitNetwork} from './config/network/InitNetwork';
import {InitTranslation} from './config/translation/InitTranslation';
import {InitUser} from './config/user/InitUser';
import {InitTheme} from './config/theme/InitTheme';
import {InitRouting} from './config/router/InitRouting';
import {InitApplicationSettingProvider} from './config/application-instance/application-settings/ApplicationSettingsContext';
import {InitDocumentTitle} from './config/application-instance/document-title/InitDocumentTitle';
import {GuardAccess} from './config/application-instance/guard-access/GuardAccess';
import {InitLayout} from './modules/layout/InitLayout';
import {InitApplicationRouter} from './modules/ApplicationRouting/InitApplicationRouter';

export const Index: FunctionComponent = () => (
    <InitNetwork>
        <InitTranslation>
            <InitUser>
                <InitTheme>
                    <InitRouting>
                        <InitApplicationSettingProvider>
                            <InitDocumentTitle>
                                <GuardAccess>
                                    <InitLayout>
                                        <InitApplicationRouter />
                                    </InitLayout>
                                </GuardAccess>
                            </InitDocumentTitle>
                        </InitApplicationSettingProvider>
                    </InitRouting>
                </InitTheme>
            </InitUser>
        </InitTranslation>
    </InitNetwork>
);

const root = createRoot(document.getElementById('root'));
root.render(<Index />);
