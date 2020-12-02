// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useMutation} from '@apollo/react-hooks';
import {History} from 'history';
import React from 'react';
import useLang from '../../../../../hooks/useLang';
import {getLibsQuery} from '../../../../../queries/libraries/getLibrariesQuery';
import {saveLibQuery} from '../../../../../queries/libraries/saveLibMutation';
import {clearCacheQueriesFromRegexp} from '../../../../../utils';
import {
    GET_LIBRARIES,
    GET_LIBRARIESVariables,
    GET_LIBRARIES_libraries_list
} from '../../../../../_gqlTypes/GET_LIBRARIES';
import {IFormError} from '../../../../../_types/errors';
import InfosForm from './InfosForm';

interface IInfosTabProps {
    library: GET_LIBRARIES_libraries_list | null;
    readonly: boolean;
    history: History;
}

function InfosTab({library, history, readonly}: IInfosTabProps): JSX.Element {
    const {lang} = useLang();
    const [saveLibrary, {error: errorSave}] = useMutation(saveLibQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: e => undefined,
        update: async (cache, {data: {saveLibrary: savedLibraryData}}) => {
            // There might be a lot of different lists with different
            // filters in cache, thus we just revoke everything
            clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.libraries/);

            // Write library data to cache on a query with ID filter
            const newlibraries = {
                totalCount: 1,
                list: [savedLibraryData],
                __typename: 'Library'
            };

            cache.writeQuery({
                query: getLibsQuery,
                data: {libraries: newlibraries},
                variables: {id: savedLibraryData.id, lang}
            });
        }
    });

    const [getLibById, {data: dataLibById}] = useLazyQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery);

    const _handleCheckIdExists = async val => {
        await getLibById({variables: {id: val}});

        return !!dataLibById && !!dataLibById.libraries && !dataLibById.libraries.list.length;
    };

    const _handleSubmit = async libData => {
        await saveLibrary({
            variables: {
                libData: {
                    id: libData.id,
                    label: {
                        fr: libData.label.fr,
                        en: libData.label.en
                    },
                    behavior: libData.behavior,
                    recordIdentityConf:
                        libData.recordIdentityConf !== null
                            ? {
                                  label: libData.recordIdentityConf.label,
                                  preview: libData.recordIdentityConf.preview,
                                  color: libData.recordIdentityConf.color
                              }
                            : null
                }
            }
        });
        history.replace({pathname: '/libraries/edit/' + libData.id});
    };

    const formErrors = errorSave?.graphQLErrors?.length ? errorSave.graphQLErrors[0] : null;

    return (
        <InfosForm
            library={library}
            onSubmit={_handleSubmit}
            readonly={readonly}
            errors={(formErrors as unknown) as IFormError}
            onCheckIdExists={_handleCheckIdExists}
        />
    );
}

export default InfosTab;
