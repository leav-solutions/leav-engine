import {useMutation} from '@apollo/react-hooks';
import {DataProxy} from 'apollo-cache';
import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {getFormsQuery} from '../../../../../../../../queries/forms/getFormsQuery';
import {saveFormQuery} from '../../../../../../../../queries/forms/saveFormMutation';
import {clearCacheQueriesFromRegexp} from '../../../../../../../../utils';
import {GET_FORM_forms_list} from '../../../../../../../../_gqlTypes/GET_FORM';
import {GET_FORMS_LIST, GET_FORMS_LISTVariables} from '../../../../../../../../_gqlTypes/GET_FORMS_LIST';
import {FormInput} from '../../../../../../../../_gqlTypes/globalTypes';
import {SAVE_FORM, SAVE_FORMVariables} from '../../../../../../../../_gqlTypes/SAVE_FORM';
import InfosForm from './InfosForm';

interface IInfosTabProps {
    library: string;
    form: GET_FORM_forms_list | null;
    readonly?: boolean;
}

function InfosTab({library, form, readonly = false}: IInfosTabProps): JSX.Element {
    const [saveForm] = useMutation<SAVE_FORM, SAVE_FORMVariables>(saveFormQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: e => undefined,
        update: (cache: DataProxy, {data: {saveForm: savedForm}}: any) => {
            // On form creation, handle cache
            if (!form) {
                // Get cached data for library's forms list
                const cacheData = cache.readQuery<GET_FORMS_LIST, GET_FORMS_LISTVariables>({
                    query: getFormsQuery,
                    variables: {library}
                });

                // Clear everything in cache related to this library's forms list. There might be
                // some filtered list here
                clearCacheQueriesFromRegexp(
                    cache,
                    new RegExp(`ROOT_QUERY.forms\\({"filters":{.*"library":"${library}"}}`)
                );

                // Rewrite cache for the full forms list only (no filters).
                // If a filtered list is being displayed, it won't refresh automatically.
                // It's not optimal, but we consider the most common use case when creating form is
                // displaying the full list. As it's not trivial at all to refresh every possible
                // filters properly, we don't do it.
                const newCacheData = {
                    forms: {
                        list: [...(cacheData?.forms?.list || []), {...savedForm, __typename: 'Form'}],
                        totalCount: (cacheData?.forms?.totalCount || 0) + 1,
                        __typename: 'FormsList'
                    }
                };

                cache.writeQuery({
                    query: getFormsQuery,
                    variables: {library},
                    data: newCacheData
                });

                if (history?.replace) {
                    history.replace({pathname, hash: 'forms', search: `fid=${savedForm.id}`});
                }
            }
        }
    });

    const history = useHistory();
    const {pathname} = useLocation();

    const _handleSubmit = (formData: FormInput) => {
        return saveForm({
            variables: {
                formData: {...formData, id: formData.id, library}
            }
        });
    };
    return <InfosForm form={form} library={library} readonly={readonly} onSubmit={_handleSubmit} />;
}

export default InfosTab;
