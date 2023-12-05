// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getLibraryPermissionsQuery} from 'graphQL/queries/libraries/getLibraryPermissionsQuery';
import {isAllowedQuery} from 'graphQL/queries/permissions/isAllowedQuery';
import {GET_LIBRARY_PERMISSIONS, GET_LIBRARY_PERMISSIONSVariables} from '_gqlTypes/GET_LIBRARY_PERMISSIONS';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {IS_ALLOWED, IS_ALLOWEDVariables} from '_gqlTypes/IS_ALLOWED';

export interface IUseCanEditRecordHook {
    loading: boolean;
    canEdit: boolean;
    isReadOnly: boolean;
}

export const useCanEditRecord = (library: {id: string}, recordId?: string): IUseCanEditRecordHook => {
    const isCreationMode = !recordId;

    // Query runs if record is specified (= record edition)
    const {loading: recordPermissionsLoading, error: recordPermissionsError, data: recordPermissionsData} = useQuery<
        IS_ALLOWED,
        IS_ALLOWEDVariables
    >(isAllowedQuery, {
        variables: {
            type: PermissionTypes.record,
            applyTo: library.id,
            target: {
                recordId
            },
            actions: [
                PermissionsActions.access_record,
                PermissionsActions.create_record,
                PermissionsActions.edit_record,
                PermissionsActions.delete_record
            ]
        },
        skip: isCreationMode,
        fetchPolicy: 'cache-and-network'
    });

    // Query runs if record is not specified (= record creation)
    const {loading: libraryPermissionsLoading, error: libraryPermissionsError, data: libraryPermissionsData} = useQuery<
        GET_LIBRARY_PERMISSIONS,
        GET_LIBRARY_PERMISSIONSVariables
    >(getLibraryPermissionsQuery, {
        variables: {libraryId: [library.id]},
        skip: !isCreationMode,
        fetchPolicy: 'cache-and-network'
    });

    if (recordPermissionsError || libraryPermissionsError) {
        return {loading: false, canEdit: false, isReadOnly: true};
    }

    const libraryPermissionsElem = libraryPermissionsData?.libraries.list[0];
    const recordPermissionsElem: {[key in PermissionsActions]?: boolean} = recordPermissionsData?.isAllowed.reduce(
        (recordPerms, perm) => {
            recordPerms[perm.name] = perm.allowed;
            return recordPerms;
        },
        {}
    );

    return {
        loading: recordPermissionsLoading || libraryPermissionsLoading,
        canEdit: isCreationMode
            ? libraryPermissionsElem?.permissions.create_record
            : recordPermissionsElem?.access_record,
        isReadOnly: isCreationMode
            ? !libraryPermissionsElem?.permissions.create_record
            : !recordPermissionsElem?.edit_record
    };
};
