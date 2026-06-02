import {type FunctionComponent} from 'react';
import {createRoot} from 'react-dom/client';
import {InitNetwork} from './config/network/InitNetwork';
import {InitTranslation} from './config/translation/InitTranslation';
import {InitUser} from './config/user/InitUser';
import {InitTheme} from './config/theme/InitTheme';
import {InitNotificationsSubscription, PanelMessengerProvider} from '@leav/ui';
import {InitRouting} from './config/router/InitRouting';
import {InitApplicationSettingProvider} from './config/application-instance/application-settings/InitApplicationSettingProvider';
import {InitDocumentTitle} from './config/application-instance/document-title/InitDocumentTitle';
import {GuardAccess} from './config/application-instance/guard-access/GuardAccess';
import {InitLayout} from './modules/layout/InitLayout';
import {InitApplicationRouter} from './modules/ApplicationRouting/InitApplicationRouter';
import {BugsnagErrorBoundary} from './BugsnagErrorBoundary';
import './index.css';

export const Index: FunctionComponent = () => (
    <InitNetwork>
        <InitTranslation>
            <InitUser>
                <InitTheme>
                    <InitNotificationsSubscription>
                        <InitRouting>
                            <InitApplicationSettingProvider>
                                <InitDocumentTitle>
                                    <GuardAccess>
                                        <InitLayout>
                                            <PanelMessengerProvider>
                                                <InitApplicationRouter />
                                            </PanelMessengerProvider>
                                        </InitLayout>
                                    </GuardAccess>
                                </InitDocumentTitle>
                            </InitApplicationSettingProvider>
                        </InitRouting>
                    </InitNotificationsSubscription>
                </InitTheme>
            </InitUser>
        </InitTranslation>
    </InitNetwork>
);

const root = createRoot(document.getElementById('root'));
root.render(
    <BugsnagErrorBoundary>
        <Index />
    </BugsnagErrorBoundary>,
);
