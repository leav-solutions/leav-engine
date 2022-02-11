// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IDbDocument {
    _id: string;
    _key: string;
    _rev: string;
    [key: string]: any;
}

export interface IDbEdge extends IDbDocument {
    _from: string;
    _to: string;
}
