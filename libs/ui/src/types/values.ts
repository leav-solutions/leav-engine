export interface IValueVersionTreeNode {
    id: string;
    label: string;
}

export interface IValueVersion {
    [treeId: string]: IValueVersionTreeNode;
}
