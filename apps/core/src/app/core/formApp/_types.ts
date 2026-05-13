import {type IForm, type IFormDependentElements, type IFormElement} from '../../../_types/forms';
import {type IPaginationParams, type ISortParams} from '../../../_types/list';

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
    version?: Array<{treeId: string; treeNodeId: string}>;
}

export interface ISaveFormArgs {
    form: IFormForGraphql;
}

export interface IDeleteFormArgs {
    library: string;
    id: string;
}
