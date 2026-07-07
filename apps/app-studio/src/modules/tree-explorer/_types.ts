import {type GetTreeForExplorerQuery, type GetTreeNodeChildrenQuery} from '../../__generated__';

/** Tree metadata (id, label, behavior, libraries, permissions) loaded once for the whole explorer. */
export type ITreeExplorerTree = NonNullable<GetTreeForExplorerQuery['trees']>['list'][number];

/** A single tree node as returned by the children query. */
export type ITreeExplorerNode = GetTreeNodeChildrenQuery['treeNodeChildren']['list'][number];

/** A node that lives in the current navigation path — may have its detail panel expanded. */
export interface INavigationElement extends ITreeExplorerNode {
    showDetails?: boolean;
}

/** A node selected via its checkbox, kept in the local selection state. */
export interface ITreeExplorerSelectedNode {
    id: string;
    nodeId: string;
    library: string;
    label: string;
}

export interface IMessages {
    countValid: number;
    errors: {[errorMessage: string]: string[]};
}

/**
 * Shape of the Apollo error thrown by the tree element mutations (add / move / detach), narrowed to
 * the fields these actions actually read. `extensions.fields.{parent,element}` carries the per-field
 * validation message that gets keyed into `IMessages.errors`.
 */
export interface ITreeMutationError {
    graphQLErrors?: ReadonlyArray<{extensions?: {fields?: {parent?: string; element?: string}}}>;
    message?: string;
}

export type OnMessagesFunc = (tMessageSuccess: string, tMessageFail: string, messages: IMessages) => void;
