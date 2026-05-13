import {type PermissionsActions} from '../_gqlTypes';

export interface IGroupedPermissionsActions {
    [groupName: string]: PermissionsActions[];
}
