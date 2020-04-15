import {useLazyQuery, useMutation, useQuery} from '@apollo/react-hooks';
import {History, Location} from 'history';
import {i18n} from 'i18next';
import React from 'react';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {saveLibQuery} from '../../../queries/libraries/saveLibMutation';
import {clearCacheQueriesFromRegexp} from '../../../utils';
import {GET_LIBRARIES, GET_LIBRARIESVariables, GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditLibraryForm from '../EditLibraryForm';

interface IEditLibraryProps {
    match: any;
    history: History;
    location: Location;
    i18n: i18n;
}

/* tslint:disable-next-line:variable-name */
const EditLibrary = ({match, history, location}: IEditLibraryProps): JSX.Element => {
    const libraryId = match.params.id;
    const {lang} = useLang();
    const userData = useUserData();
    const readOnly = !userData.permissions[PermissionsActions.admin_edit_library];

    const {loading, error, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
        variables: {id: libraryId, lang}
    });

    const [saveLibrary, {error: errorSave}] = useMutation(saveLibQuery, {
        update: async (cache, {data: dataCached}) => {
            const cachedData: any = cache.readQuery({query: getLibsQuery, variables: {lang}});
            const newLibrarie = dataCached.saveLibrary;

            clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.libraries/);

            let libraries;
            let index;

            cachedData.libraries.list.filter((e, i) => {
                if (e.id === newLibrarie.id) {
                    index = i;
                }
                return false;
            });

            if (index !== undefined) {
                cachedData.libraries.list[index] = newLibrarie;
                libraries = {
                    totalCount: cachedData.libraries.totalCount + 1,
                    list: [...cachedData.libraries.list],
                    __typename: cachedData.libraries.__typename
                };
            } else {
                libraries = {
                    totalCount: cachedData.libraries.totalCount + 1,
                    list: [...cachedData.libraries.list, newLibrarie],
                    __typename: cachedData.libraries.__typename
                };
            }

            const newlibraries = {
                totalCount: 1,
                list: [newLibrarie],
                __typename: cachedData.libraries.__typename
            };

            cache.writeQuery({
                query: getLibsQuery,
                data: {libraries: newlibraries},
                variables: {id: dataCached.saveLibrary.id, lang}
            });

            cache.writeQuery({
                query: getLibsQuery,
                data: {libraries},
                variables: {lang}
            });
            //   refetch();
        }
    });

    const [getLibById, {data: dataLibById}] = useLazyQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery);

    const _isIdUnique = async val => {
        await getLibById({variables: {id: val}});

        return !!dataLibById && !!dataLibById.libraries && !dataLibById.libraries.list.length;
    };

    /**
     * Retrieve EditLibraryForm, wrapped by mutation component
     * @param libToEdit
     * @param history
     */
    const _getEditLibraryForm = (libToEdit: GET_LIBRARIES_libraries_list | null) => {
        const onFormSubmit = async libData => {
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

        const formErrors = errorSave && errorSave.graphQLErrors.length ? errorSave.graphQLErrors[0] : null;

        const onPermissionsFormSubmit = async libData => {
            await saveLibrary({
                variables: {
                    libData: {
                        id: libData.id,
                        permissions_conf: {
                            permissionTreeAttributes: libData.permissions_conf.permissionTreeAttributes,
                            relation: libData.permissions_conf.relation
                        }
                    }
                },
                refetchQueries: [{query: getLibsQuery, variables: {id: libData.id}}]
            });
        };

        return (
            <EditLibraryForm
                library={libToEdit}
                onSubmit={onFormSubmit}
                errors={formErrors}
                onPermsSettingsSubmit={onPermissionsFormSubmit}
                readOnly={readOnly}
                onCheckIdExists={_isIdUnique}
                history={history}
                location={location}
            />
        );
    };

    if (!libraryId) {
        return _getEditLibraryForm(null);
    }

    if (loading) {
        return <Loading />;
    }

    if (typeof error !== 'undefined') {
        return <p>Error: {error.message}</p>;
    }

    if (!data || !data.libraries || !data.libraries.list.length) {
        return <p>Unknown library</p>;
    }

    return _getEditLibraryForm(data.libraries.list[0]);
};

export default EditLibrary;
