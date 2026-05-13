import {EDGE_COLLEC_PREFIX, NODE_COLLEC_PREFIX, TREES_COLLECTION_NAME} from '../treeRepo';

export const getNodesCollectionName = (treeId: string): string => NODE_COLLEC_PREFIX + treeId;
export const getEdgesCollectionName = (treeId: string): string => EDGE_COLLEC_PREFIX + treeId;
export const getRootId = (treeId: string): string => `${TREES_COLLECTION_NAME}/${treeId}`;
export const getFullNodeId = (nodeId: string, treeId: string) => `${getNodesCollectionName(treeId)}/${nodeId}`;
export const getLibraryFromDbId = (dbId: string) => dbId.split('/')[0];
