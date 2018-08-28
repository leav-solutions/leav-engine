/* tslint:disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum PermissionsRelation {
    and = 'and',
    or = 'or'
}

export interface LibraryInput {
    id: string;
    label?: SystemTranslationInput | null;
    attributes?: (string | null)[] | null;
    permissionsConf?: TreePermissionsConfInput | null;
}

export interface SystemTranslationInput {
    fr: string;
    en?: string | null;
}

export interface TreePermissionsConfInput {
    permissionTreeAttributes: (string | null)[];
    relation: PermissionsRelation;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
