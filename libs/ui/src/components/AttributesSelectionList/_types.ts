// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributesByLibAttributeFragment,
    AttributesByLibAttributeLinkAttributeFragment,
    AttributesByLibAttributeTreeAttributeFragment
} from '_ui/_gqlTypes';

export interface ICommonAttributeComponentProps {
    attribute: AttributesByLibAttributeFragment;
    library: string;
    path: string;
    depth: number;
    parentAttribute?: AttributesByLibAttributeLinkAttributeFragment | AttributesByLibAttributeTreeAttributeFragment;
}
