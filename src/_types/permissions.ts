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

export interface IPermission {
    type: PermissionTypes;
    userGroup: string;
    actions: {[name: string]: boolean | null};
    target: string;
}
