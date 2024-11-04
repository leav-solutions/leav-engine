// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import React from 'react';
import {saveLibQuery} from '../../../../../queries/libraries/saveLibMutation';
import {GET_LIB_BY_ID_libraries_list} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_LIBRARY, SAVE_LIBRARYVariables} from '../../../../../_gqlTypes/SAVE_LIBRARY';
import PermissionsContent from './PermissionsContent';

interface IPermissionsTabProps {
    library: GET_LIB_BY_ID_libraries_list;
    readonly: boolean;
}

function PermissionsTab({library, readonly}: IPermissionsTabProps): JSX.Element {
    const [saveLibrary] = useMutation<SAVE_LIBRARY, SAVE_LIBRARYVariables>(saveLibQuery);

    const _handleSubmitSettings = (conf: Treepermissions_confInput) =>
        saveLibrary({
            variables: {
                libData: {
                    id: library.id,
                    permissions_conf: conf
                }
            }
        });

    return <PermissionsContent library={library} readonly={readonly} onSubmitSettings={_handleSubmitSettings} />;
}

export default PermissionsTab;
