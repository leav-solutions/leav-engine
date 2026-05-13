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

const EMPTY_VALUE_KEY = '0';

export const EmptyValueCheckbox: FunctionComponent<IEmptyValueCheckboxProps> = ({filter, onSelect, count}) => {
    const {t} = useSharedTranslation();

    const onChange = () => {
        onSelect(!filter.withEmptyValues);
    };

    return (
        <KitTree
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
