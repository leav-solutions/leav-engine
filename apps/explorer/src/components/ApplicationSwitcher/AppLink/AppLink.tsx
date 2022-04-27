import React, {ReactNode} from 'react';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

interface IAppLinkProps {
    app: GET_APPLICATIONS_applications_list;
    label: string;
    children: ReactNode;
}

function AppLink({app, label, children}: IAppLinkProps): JSX.Element {
    let endpoint = app.endpoint;
    if (endpoint[0] !== '/') {
        endpoint = '/' + endpoint;
    }

    return (
        <a href={endpoint} aria-label={label}>
            {children}
        </a>
    );
}

export default AppLink;
