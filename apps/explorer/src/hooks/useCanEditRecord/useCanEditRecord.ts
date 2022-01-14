// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getLibraryPermissionsQuery} from 'graphQL/queries/libraries/getLibraryPermissionsQuery';
import {
    getRecordPermissionsQuery,
    IGetRecordPermissions,
    IGetRecordPermissionsVariables
} from 'graphQL/queries/records/getRecordPermissions';
import {GET_LIBRARY_PERMISSIONS, GET_LIBRARY_PERMISSIONSVariables} from '_gqlTypes/GET_LIBRARY_PERMISSIONS';
import {RecordIdentity_whoAmI_library_gqlNames} from '_gqlTypes/RecordIdentity';

export interface IUseCanEditRecordHook {
    loading: boolean;
    canEdit: boolean;
    isReadOnly: boolean;
}

export const useCanEditRecord = (
    library: {id: string; gqlNames?: RecordIdentity_whoAmI_library_gqlNames},
    recordId?: string
): IUseCanEditRecordHook => {
    const isCreationMode = !recordId;

    // Query runs if record is specified (= record edition)
    const {loading: recordPermissionsLoading, error: recordPermissionsError, data: recordPermissionsData} = useQuery<
        IGetRecordPermissions,
        IGetRecordPermissionsVariables
    >(getRecordPermissionsQuery(library.gqlNames?.query), {
        variables: {recordId},
        skip: isCreationMode
    });

    // Query runs if record is not specified (= record creation)
    const {loading: libraryPermissionsLoading, error: libraryPermissionsError, data: libraryPermissionsData} = useQuery<
        GET_LIBRARY_PERMISSIONS,
        GET_LIBRARY_PERMISSIONSVariables
    >(getLibraryPermissionsQuery, {
        variables: {libraryId: library.id},
        skip: !isCreationMode
    });

    if (recordPermissionsError || libraryPermissionsError) {
        return {loading: false, canEdit: false, isReadOnly: true};
    }

    const libraryPermissionsElem = libraryPermissionsData?.libraries.list[0];
    const recordPermissionsElem = recordPermissionsData?.[library.gqlNames?.query]?.list[0];

    return {
        loading: recordPermissionsLoading || libraryPermissionsLoading,
        canEdit: isCreationMode
            ? libraryPermissionsElem?.permissions.create_record
            : recordPermissionsElem?.permissions.access_record,
        isReadOnly: isCreationMode
            ? !libraryPermissionsElem?.permissions.create_record
            : !recordPermissionsElem?.permissions.edit_record
    };
};
