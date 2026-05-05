// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {type ITreeNode} from './useGetTreeData';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useState} from 'react';

export const useTreesSearch = (tree: ITreeNode[]) => {
    const {t} = useSharedTranslation();
    const [searchValue, setSearchValue] = useState('');

    const normalizedSearch = searchValue.trim().toLowerCase();
    const nodeIds: string[] = [];

    const _filterNodes = (nodes: ITreeNode[]): ITreeNode[] =>
        nodes
            .map(node => {
                const filteredChildren = node.children ? _filterNodes(node.children) : [];
                const matchesSelf = node.title.toLowerCase().includes(normalizedSearch);

                if (!matchesSelf && filteredChildren.length === 0) {
                    return null;
                }

                nodeIds.push(node.id);

                return {
                    ...node,
                    children: filteredChildren,
                };
            })
            .filter((node): node is ITreeNode => node !== null);

    return {
        filteredTree: !normalizedSearch ? tree : _filterNodes(tree),
        expandedNodeIdsFromSearch: !normalizedSearch ? [] : nodeIds,
        SearchInput: (
            <KitInput
                prefix={<FontAwesomeIcon icon={faSearch} />}
                placeholder={t('global.search')}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                allowClear
            />
        ),
    };
};
