// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import {useApplicationEventsSubscription} from 'hooks/useApplicationEventsSubscription';
import {installApplicationMutation} from 'queries/applications/installApplicationMutation';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {addMessage, MessagesTypes} from 'redux/messages/messages';
import {INSTALL_APPLICATION, INSTALL_APPLICATIONVariables} from '_gqlTypes/INSTALL_APPLICATION';
import InstallView from './InstallView';

function InstallTab(): JSX.Element {
    const {t} = useTranslation();
    const {application} = useEditApplicationContext();
    const dispatch = useDispatch();

    useApplicationEventsSubscription(application.id);

    const [runInstall, {loading}] = useMutation<INSTALL_APPLICATION, INSTALL_APPLICATIONVariables>(
        installApplicationMutation,
        {
            variables: {id: application.id},
            onCompleted: () => {
                dispatch(
                    addMessage({
                        type: MessagesTypes.SUCCESS,
                        title: t('applications.install_request_success'),
                        icon: 'clock'
                    })
                );
            }
        }
    );

    const _handleInstall = () => {
        runInstall();
    };

    return <InstallView onInstall={_handleInstall} loading={loading} />;
}

export default InstallTab;
