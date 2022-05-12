// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import {installApplicationMutation} from 'queries/applications/installApplicationMutation';
import React from 'react';
import {INSTALL_APPLICATION, INSTALL_APPLICATIONVariables} from '_gqlTypes/INSTALL_APPLICATION';
import InstallView from './InstallView';

function InstallTab(): JSX.Element {
    const {application} = useEditApplicationContext();

    const [runInstall, {loading}] = useMutation<INSTALL_APPLICATION, INSTALL_APPLICATIONVariables>(
        installApplicationMutation,
        {
            variables: {id: application.id},
            update: (cache, {data}) => {
                const cacheKey = cache.identify({...application, __typename: 'Application'});
                // console.log('go update', cacheKey, data);
                cache.modify({
                    id: cacheKey,
                    fields: {
                        install: () => data.installApplication
                    }
                });
            }
        }
    );

    const _handleInstall = () => {
        runInstall();
    };

    return <InstallView onInstall={_handleInstall} loading={loading} />;
}

export default InstallTab;
