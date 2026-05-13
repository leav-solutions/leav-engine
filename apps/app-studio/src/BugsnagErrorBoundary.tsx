import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React, {type ReactNode} from 'react';

let ErrorBoundary;
if (window.__bugsnag_api_key__ && window.__bugsnag_app_version__) {
    Bugsnag.start({
        apiKey: window.__bugsnag_api_key__,
        appVersion: window.__bugsnag_app_version__,
        releaseStage: window.__bugsnag_release_stage__,
        appType: 'app-studio',
        plugins: [new BugsnagPluginReact()],
    });

    ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);
} else {
    ErrorBoundary = ({children}: {children: ReactNode}) => <>{children}</>;
}

export const BugsnagErrorBoundary = ErrorBoundary;
