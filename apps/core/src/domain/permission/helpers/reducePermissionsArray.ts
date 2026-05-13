export interface IReducePermissionsArrayHelper {
    reducePermissionsArray: (permissions: boolean[]) => boolean;
}

export default function (): IReducePermissionsArrayHelper {
    return {
        reducePermissionsArray: permissions =>
            permissions.reduce((globalPerm, valuePerm) => globalPerm || valuePerm, false),
    };
}
