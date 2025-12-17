// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {type Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import PermissionsContent from './PermissionsContent';
import {useSaveAttributeMutation} from '_gqlTypes';

interface IPermissionsTabProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
    readonly: boolean;
}

function PermissionsTab({attribute, readonly}: IPermissionsTabProps): JSX.Element {
    const [saveAttribute] = useSaveAttributeMutation();

    const _handleSubmitSettings = (conf: Treepermissions_confInput) => {
        saveAttribute({
            variables: {
                attrData: {
                    id: attribute.id,
                    permissions_conf: conf,
                },
            },
        });
    };

    return <PermissionsContent attribute={attribute} readonly={readonly} onSubmitSettings={_handleSubmitSettings} />;
}

export default PermissionsTab;
