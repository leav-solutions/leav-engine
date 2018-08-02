export enum PermissionTypes {
    RECORD = 'record'
}

export enum RecordPermissions {
    ACCESS = 'access',
    EDIT = 'edit',
    DELETE = 'delete'
}

export enum PermissionsRelations {
    AND = 'and',
    OR = 'or'
}

export interface ITreePermissionsConf {
    trees: [string];
    relation: PermissionsRelations;
}

export interface IPermissionsTreeTarget {
    tree: string;
    library: string;
    id: string;
}

export interface IPermission {
    type: PermissionTypes;
    usersGroup: string;
    actions: {[name: string]: boolean | null};
    target?: IPermissionsTreeTarget | string;
}
