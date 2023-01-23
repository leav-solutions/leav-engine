// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql, useApolloClient} from '@apollo/client';
import {EditApplication, IEditApplicationProps, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Modal} from 'antd';
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

export interface IEditApplicationModalProps extends Omit<IEditApplicationProps, 'onSetSubmitFunction'> {
    open: boolean;
    onClose: () => void;
}

function EditApplicationModal({
    open,
    applicationId,
    onClose,
    appsBaseUrl,
    activeTab
}: IEditApplicationModalProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [submitFunction, setSubmitFunction] = useState<() => Promise<void>>();
    const [submitLoading, setSubmitLoading] = useState(false);
    const isEditing = !!applicationId;

    const apolloClient = useApolloClient();

    // Get application label from apollo cache if present
    const applicationLabel = useMemo(
        () =>
            isEditing
                ? apolloClient.readFragment({
                      id: apolloClient.cache.identify({
                          __typename: 'Application',
                          id: applicationId
                      }),
                      fragment: gql`
                          fragment ApplicationLabel on Application {
                              label
                          }
                      `
                  })?.label
                : null,
        [applicationId, isEditing, apolloClient]
    );

    const _handleSetSubmitFunction = submitFunc => {
        setSubmitFunction(() => submitFunc);
    };

    const _handleSubmit = async () => {
        try {
            if (submitFunction) {
                setSubmitLoading(true);
                await submitFunction();
            }
            onClose();
        } catch (e) {
            // Nothing to do, errors are handled by the form
        } finally {
            setSubmitLoading(false);
        }
    };

    const buttons = [
        <Button key="cancel" onClick={onClose}>
            {t(isEditing ? 'global.close' : 'global.cancel')}
        </Button>
    ];

    if (!isEditing) {
        buttons.push(
            <Button key="submit" type="primary" loading={submitLoading} onClick={_handleSubmit}>
                {t('global.submit')}
            </Button>
        );
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            bodyStyle={{minHeight: '20vh', maxHeight: 'calc(100vh - 10rem)', overflowY: 'auto'}}
            width={800}
            title={isEditing ? localizedTranslation(applicationLabel, lang) : t('application.new_app')}
            centered
            footer={buttons}
        >
            <EditApplication
                applicationId={applicationId}
                appsBaseUrl={appsBaseUrl}
                onSetSubmitFunction={_handleSetSubmitFunction}
                activeTab={activeTab}
                tabContentStyle={{maxHeight: 'calc(100vh - 15rem)', overflowY: 'auto'}}
            />
        </Modal>
    );
}

export default EditApplicationModal;
