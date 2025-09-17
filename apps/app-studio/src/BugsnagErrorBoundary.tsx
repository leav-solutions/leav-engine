// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import packageJson from '../package.json';
import React, {type ReactNode} from 'react';

let ErrorBoundary;
if (process.env.NODE_ENV !== 'development') {
    Bugsnag.start({
        apiKey: '543f33a6388fa7b8e2dce8151e4cec0b',
        appVersion: packageJson.version,
        plugins: [new BugsnagPluginReact()]
    });

    ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);
} else {
    ErrorBoundary = ({children}: {children: ReactNode}) => <>{children}</>;
}

export const BugsnagErrorBoundary = ErrorBoundary;
