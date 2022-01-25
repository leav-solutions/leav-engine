// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IForm, IFormDependentElements, IFormElement} from '_types/forms';
import {IPaginationParams, ISortParams} from '_types/list';

export type IFormForGraphql = Omit<IForm, 'elements'> & {elements: IFormDependentElementsForGraphQL[]};
export type IFormDependentElementsForGraphQL = Omit<IFormDependentElements, 'elements'> & {
    elements: IFormElementForGraphQL[];
};
export type IFormElementForGraphQL = Omit<IFormElement, 'settings'> & {settings: Array<{key: string; value: any}>};

export interface IGetFormArgs {
    filters: ICoreEntityFilterOptions & {library: string; system?: boolean};
    pagination: IPaginationParams;
    sort: ISortParams;
}

export interface IGetRecordFormArgs {
    recordId: string;
    libraryId: string;
    formId: string;
}

export interface ISaveFormArgs {
    form: IFormForGraphql;
}

export interface IDeleteFormArgs {
    library: string;
    id: string;
}
