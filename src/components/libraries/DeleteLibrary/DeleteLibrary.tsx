import {DataProxy} from 'apollo-cache';
import React from 'react';
import {useTranslation} from 'react-i18next';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {DeleteLibMutation, deleteLibQuery} from '../../../queries/libraries/deleteLibMutation';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {clearCacheQueriesFromRegexp} from '../../../utils';
import {addWildcardToFilters} from '../../../utils/utils';
import {GET_LIBRARIES, GET_LIBRARIESVariables, GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteLibraryProps {
    library: GET_LIBRARIES_libraries_list;
    filters?: any;
}

const DeleteLibrary = ({library, filters}: IDeleteLibraryProps): JSX.Element | null => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const userData = useUserData();
    const _updateCache = (cache: DataProxy, {data: {deleteLibrary}}: any) => {
        const cacheData = cache.readQuery<GET_LIBRARIES, GET_LIBRARIESVariables>({
            query: getLibsQuery,
            variables: {...addWildcardToFilters(filters), lang}
        });

        if (!cacheData) {
            return;
        }

        clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.libraries/);

        const newCount = cacheData.libraries?.totalCount ? cacheData.libraries?.totalCount - 1 : 0;
        const newList = cacheData.libraries?.list
            ? cacheData.libraries.list.filter(l => l.id !== deleteLibrary.id)
            : [];

        cache.writeQuery<GET_LIBRARIES, GET_LIBRARIESVariables>({
            query: getLibsQuery,
            variables: {...addWildcardToFilters(filters), lang},
            data: {libraries: {...cacheData.libraries, totalCount: newCount, list: newList}}
        });
    };

    return userData.permissions[PermissionsActions.app_delete_library] ? (
        <DeleteLibMutation mutation={deleteLibQuery} update={_updateCache}>
            {deleteLib => {
                const onDelete = async () =>
                    deleteLib({
                        variables: {libID: library.id}
                    });

                const libLabel =
                    library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

                return (
                    <ConfirmedButton action={onDelete} confirmMessage={t('libraries.confirm_delete', {libLabel})}>
                        <DeleteButton disabled={!!library.system} />
                    </ConfirmedButton>
                );
            }}
        </DeleteLibMutation>
    ) : null;
};

export default DeleteLibrary;
