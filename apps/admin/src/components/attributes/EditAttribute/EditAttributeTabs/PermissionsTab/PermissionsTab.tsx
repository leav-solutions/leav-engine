// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import React from 'react';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import PermissionsContent from './PermissionsContent';

interface IPermissionsTabProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
    readonly: boolean;
}

function PermissionsTab({attribute, readonly}: IPermissionsTabProps): JSX.Element {
    const [saveAttribute] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery);

    const _handleSubmitSettings = (conf: Treepermissions_confInput) => {
        saveAttribute({
            variables: {
                attrData: {
                    id: attribute.id,
                    permissions_conf: conf
                }
            }
        });
    };

    return <PermissionsContent attribute={attribute} readonly={readonly} onSubmitSettings={_handleSubmitSettings} />;
}

export default PermissionsTab;
