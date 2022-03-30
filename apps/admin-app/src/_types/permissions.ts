import {PermissionsActions} from '_gqlTypes/globalTypes';

export interface IGroupedPermissionsActions {
    [groupName: string]: PermissionsActions[];
}
