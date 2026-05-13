import {type GET_LIB_BY_ID_libraries_list} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import PermissionsContent from './PermissionsContent';
import {type TreepermissionsConfInput, useSaveLibraryMutation} from '../../../../../_gqlTypes';

interface IPermissionsTabProps {
    library: GET_LIB_BY_ID_libraries_list;
    readonly: boolean;
}

function PermissionsTab({library, readonly}: IPermissionsTabProps): JSX.Element {
    const [saveLibrary] = useSaveLibraryMutation();

    const _handleSubmitSettings = (conf: TreepermissionsConfInput) =>
        saveLibrary({
            variables: {
                libData: {
                    id: library.id,
                    permissions_conf: conf,
                },
            },
        });

    return <PermissionsContent library={library} readonly={readonly} onSubmitSettings={_handleSubmitSettings} />;
}

export default PermissionsTab;
