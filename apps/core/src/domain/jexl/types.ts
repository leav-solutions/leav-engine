// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IRecord} from '../../_types/record';
import {type ITreeNode} from '../../_types/tree';
import {type IStandardValue} from '../../_types/value';

export enum JexlContextType {
    ROOT = 'root',
    RECORD = 'record',
    TREE_NODE = 'treeNode',
    USER = 'user',
}

export type JexlContext<T extends JexlContextType = JexlContextType> = {
    /**
     * This property is used internally to identify the type of context (root, record, tree node, user)
     * and should not be used in Jexl expressions as it may cause conflicts with user-defined properties.
     */
    __jexlContextType: T;
    /**
     * This method is used internally to retrieve the IQueryInfos context for the current Jexl evaluation.
     * It should not be used in Jexl expressions as it may cause conflicts with user-defined properties and is not intended for direct use in expressions.
     */
    __getJexlQueryCtx(): IQueryInfos;
};

/**
 * The jexl context to be passed in jexl evaluation
 * Still subject to change but the idea is to have a clear separation between root context (which can be defined by the user of the jexl domain)
 * and record/tree node contexts which are built from values payload when using getValues transform or function in jexl expressions
 */
export type JexlRootContext<T = unknown> = T &
    JexlContext<JexlContextType.ROOT> & {
        currentUser: JexlUserContext;
    };

export type JexlRecordContext = IRecord & JexlContext<JexlContextType.RECORD>;

export type JexlTreeNodeContext = ITreeNode & JexlContext<JexlContextType.TREE_NODE>;

export type JexlUserContext = JexlContext<JexlContextType.USER> & {
    record: JexlRecordContext;
    lang?: string;
};

export type JexlValueContext = IStandardValue['payload'] | JexlRecordContext | JexlTreeNodeContext;
