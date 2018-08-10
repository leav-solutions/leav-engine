export enum PermissionTypes {
    RECORD = 'record'
}

export enum RecordPermissions {
    ACCESS = 'access',
    CREATE = 'create',
    EDIT = 'edit',
    DELETE = 'delete'
}

export enum PermissionsRelations {
    AND = 'and',
    OR = 'or'
}

export interface ITreePermissionsConf {
    permissionTreeAttributes: [string];
    relation: PermissionsRelations;
}

export interface IPermissionsTreeTarget {
    tree: string;
    library: string;
    id: string | number;
}

export interface IPermission {
    type: PermissionTypes;
    usersGroup: string;
    actions: {[name: string]: boolean | null};
    permissionTreeTarget?: IPermissionsTreeTarget | string;
}
