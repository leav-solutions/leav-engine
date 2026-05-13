import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';
import PermissionsContent from './PermissionsContent';
import {type TreepermissionsConfInput, useSaveAttributeMutation} from '../../../../../_gqlTypes';

interface IPermissionsTabProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
    readonly: boolean;
}

function PermissionsTab({attribute, readonly}: IPermissionsTabProps): JSX.Element {
    const [saveAttribute] = useSaveAttributeMutation();

    const _handleSubmitSettings = (conf: TreepermissionsConfInput) => {
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
