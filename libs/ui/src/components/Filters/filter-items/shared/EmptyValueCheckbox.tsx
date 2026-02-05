// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import styled from 'styled-components';
import {KitTree} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type UIFilter} from '../../_types';
import {FilterTreeNodeTitle} from './FilterTreeNodeTitle';

interface IEmptyValueCheckboxProps {
    filter: UIFilter;
    onSelect: (selected: boolean) => void;
    count?: number;
}

const TreeStyled = styled(KitTree)`
    span.ant-typography {
        font-style: italic;
    }
`;

const EMPTY_VALUE_KEY = '0';

export const EmptyValueCheckbox: FunctionComponent<IEmptyValueCheckboxProps> = ({filter, onSelect, count}) => {
    const {t} = useSharedTranslation();

    const onChange = () => {
        onSelect(!filter.withEmptyValues);
    };

    return (
        <TreeStyled
            checkable
            treeData={[{title: t('filters.empty-value'), key: EMPTY_VALUE_KEY, isLeaf: true}]}
            titleRender={
                () => <FilterTreeNodeTitle title={t('filters.empty-value')} count={count} /> // We don't need to use node from props as it's a static tree of one node
            }
            checkedKeys={filter.withEmptyValues ? [EMPTY_VALUE_KEY] : []}
            selectedKeys={filter.withEmptyValues ? [EMPTY_VALUE_KEY] : []}
            onSelect={onChange}
            onCheck={onChange}
        />
    );
};
