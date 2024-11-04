// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionsActions, PermissionTypes, useGetLibraryPermissionsQuery, useIsAllowedQuery} from '_ui/_gqlTypes';

export interface IUseCanEditRecordHook {
    loading: boolean;
    canEdit: boolean;
    isReadOnly: boolean;
}

export const useCanEditRecord = (library: {id: string}, recordId?: string): IUseCanEditRecordHook => {
    const isCreationMode = !recordId;

    // Query runs if record is specified (= record edition)
    const {
        loading: recordPermissionsLoading,
        error: recordPermissionsError,
        data: recordPermissionsData
    } = useIsAllowedQuery({
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
    const {
        loading: libraryPermissionsLoading,
        error: libraryPermissionsError,
        data: libraryPermissionsData
    } = useGetLibraryPermissionsQuery({
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
