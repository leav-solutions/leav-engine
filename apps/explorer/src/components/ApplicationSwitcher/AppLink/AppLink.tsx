// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {ReactNode} from 'react';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

interface IAppLinkProps {
    app: GET_APPLICATIONS_applications_list;
    label: string;
    children: ReactNode;
}

function AppLink({app, label, children}: IAppLinkProps): JSX.Element {
    return (
        <a href={app.url} aria-label={label}>
            {children}
        </a>
    );
}

export default AppLink;
