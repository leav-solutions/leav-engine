// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent} from 'react';
import {KitTree, KitTypography} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IFilterChildrenDropDownProps} from './_types';
import {type ITreeMapElement} from '_ui/components/SelectTreeNode/_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const TreeNodeTitleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const KitTreeStyled = styled(KitTree)`
    .ant-tree-title {
        width: 100% !important;
    }
`;

const CheckIcon = styled(FontAwesomeIcon)`
    color: var(--general-utilities-text-blue);
    font-size: calc(var(--general-typography-fontSize7) * 1px);
`;

export const BooleanAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({filter, onFilterChange}) => {
    const {t} = useSharedTranslation();

    const _onSelectionChanged: ComponentProps<typeof KitTree>['onSelect'] = values => {
        const value = values[0] ? String(values[0]) : undefined;

        const filterData =
            value === undefined
                ? {
                      ...filter,
                      condition: null,
                      value: null,
                      formattedValue: undefined,
                  }
                : {
                      ...filter,
                      condition: AttributeConditionFilter.EQUAL,
                      value,
                      formattedValue: value === 'true' ? t('explorer.true') : t('explorer.false'),
                  };

        onFilterChange(filterData);
    };

    const valuesOptions = [
        {
            title: t('explorer.true'),
            key: 'true',
        },
        {
            title: t('explorer.false'),
            key: 'false',
        },
    ];

    const TreeNodeTitle = ({node}: {node: ITreeMapElement}) => (
        <TreeNodeTitleContainer>
            <KitTypography.Text size="fontSize5">{node.title}</KitTypography.Text>
            {node.key === filter.value && <CheckIcon icon={faCheck} />}
        </TreeNodeTitleContainer>
    );

    return (
        <KitTreeStyled
            treeData={valuesOptions}
            selectedKeys={[filter.value]}
            titleRender={node => <TreeNodeTitle node={node as ITreeMapElement} />}
            onSelect={_onSelectionChanged}
        />
    );
};
