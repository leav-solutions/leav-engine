// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient, useMutation} from '@apollo/client';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import {getApplicationByIdQuery} from 'queries/applications/getApplicationByIdQuery';
import {saveApplicationMutation} from 'queries/applications/saveApplicationMutation';
import {useHistory} from 'react-router-v5';
import {GET_APPLICATION_BY_ID, GET_APPLICATION_BY_IDVariables} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {SAVE_APPLICATION, SAVE_APPLICATIONVariables} from '_gqlTypes/SAVE_APPLICATION';
import {IFormError} from '_types/errors';
import InfosForm from './InfosForm';
import {ApplicationInfosFormValues} from './_types';

function InfosTab(): JSX.Element {
    const apolloClient = useApolloClient();
    const {application} = useEditApplicationContext();
    const history = useHistory();
    const isNewApp = !application;

    const [saveApplication, {error, loading}] = useMutation<SAVE_APPLICATION, SAVE_APPLICATIONVariables>(
        saveApplicationMutation,
        {
            // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
            onError: () => undefined,
            onCompleted: res => {
                if (isNewApp) {
                    // Redirect to new app editing
                    history.push(`/applications/edit/${res.saveApplication.id}`);
                }
            },
            update: cache => {
                // We created a new application, invalidate all applications list cache
                if (isNewApp) {
                    cache.evict({fieldName: 'applications'});
                }
            }
        }
    );

    const _handleSubmit = async (submitData: ApplicationInfosFormValues) => {
        // We specify each field individually to make sure
        // we don't have unwanted values sneaking in (eg. __typename or permissions)
        const dataToSave = {
            application: {
                id: submitData.id,
                label: submitData.label,
                description: submitData.description,
                module: submitData.module,
                endpoint: submitData.endpoint,
                icon: submitData.icon?.whoAmI
                    ? {
                          libraryId: submitData.icon.whoAmI.library.id,
                          recordId: submitData.icon.whoAmI.id
                      }
                    : null
            }
        };

        await saveApplication({
            variables: dataToSave
        });
    };

    const _handleCheckIdIsUnique = async (value: string): Promise<boolean> => {
        if (!value) {
            return true;
        }

        try {
            // Using apolloClient.query to be able to await query result
            const res = await apolloClient.query<GET_APPLICATION_BY_ID, GET_APPLICATION_BY_IDVariables>({
                query: getApplicationByIdQuery,
                fetchPolicy: 'no-cache',
                variables: {id: value}
            });

            // No result means id is unique
            return !res?.data?.applications?.list?.length;
        } catch (err) {
            return true;
        }
    };

    const formErrors = error?.graphQLErrors?.length ? error.graphQLErrors[0] : null;

    return (
        <InfosForm
            onSubmitInfos={_handleSubmit}
            onCheckIdIsUnique={_handleCheckIdIsUnique}
            loading={loading}
            errors={(formErrors as unknown) as IFormError}
        />
    );
}

export default InfosTab;
