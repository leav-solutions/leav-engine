// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Radio} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import {PlusOutlined} from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';
import {localizedTranslation} from '../../../utils';
import {ICommonTreeComponentProps} from '../_types';
import {TreesSelectionListActionTypes} from '../reducer/treesSelectionListReducer';
import {useTreesSelectionListState} from '../reducer/treesSelectionListStateContext';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {SmallText, TextAttribute, WrapperTree} from '../sharedComponents';

const Item = styled.div`
    padding: 0.5rem 0;
`;

function Tree({tree}: ICommonTreeComponentProps): JSX.Element {
    const {state, dispatch} = useTreesSelectionListState();
    const [{lang}] = useLang();

    const _handleClick = () => {
        dispatch({
            type: TreesSelectionListActionTypes.TOGGLE_TREE_ADD,
            tree
        });
    };

    const label = localizedTranslation(tree.label, lang);
    const isSelected = typeof state.selectedTrees.find(t => t.id === tree.id) !== 'undefined';

    const treeComp = (
        <WrapperTree>
            <TextAttribute>
                {label ? (
                    <span>
                        {label} <SmallText>{tree.id}</SmallText>
                    </span>
                ) : (
                    tree.id
                )}
            </TextAttribute>
            {state.multiple ? (
                <PrimaryBtn onClick={_handleClick} icon={<PlusOutlined />} shape="circle" />
            ) : (
                <Radio checked={isSelected} onChange={_handleClick} />
            )}
        </WrapperTree>
    );

    return <Item>{treeComp}</Item>;
}

export default Tree;
