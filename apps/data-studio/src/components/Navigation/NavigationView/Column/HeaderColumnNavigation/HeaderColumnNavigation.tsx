// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseSquareOutlined} from '@ant-design/icons';
import {themeVars} from '@leav/ui';
import {Button, Checkbox, Tooltip} from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import {useTranslation} from 'react-i18next';
import {setNavigationPath} from 'reduxStore/navigation';
import {resetSelection, setSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {ISharedSelected, SharedStateSelectionType} from '_types/types';
import {useActiveTree} from 'hooks/useActiveTree';
import HeaderColumnNavigationActions from './HeaderColumnNavigationActions';

interface IHeaderColumnProps {
    $isActive: boolean;
}

const HeaderColumn = styled.header<IHeaderColumnProps>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: ${themeVars.secondaryBg};
    height: 4rem;
    flex-shrink: 0;
    cursor: pointer;
    max-width: ${themeVars.navigationColumnWidth};

    &:not(:hover) .select-all-checkbox {
        visibility: hidden;
    }
`;

interface IHeaderColumnNavigationProps {
    depth: number;
    isDetail?: boolean;
    isActive?: boolean;
    treeElement?: TREE_NODE_CHILDREN_treeNodeChildren_list;
    children?: TREE_NODE_CHILDREN_treeNodeChildren_list[];
}

function HeaderColumnNavigation({
    depth,
    isDetail,
    isActive,
    treeElement,
    children
}: IHeaderColumnNavigationProps): JSX.Element {
    const {t} = useTranslation();
    const {navigation, selectionState} = useAppSelector(state => ({
        navigation: state.navigation,
        selectionState: state.selection
    }));

    const dispatch = useAppDispatch();
    const currentPositionInPath = depth;

    const [activeTree] = useActiveTree();
    const selectionCount = selectionState.selection.selected.length;

    const parent = navigation.path[currentPositionInPath - 1];

    const resetPath = () => {
        dispatch(setNavigationPath([]));
    };

    const goToPath = () => {
        dispatch(setNavigationPath(navigation.path.slice(0, currentPositionInPath)));
    };

    const headerClickFn = () => {
        if (!isActive) {
            if (parent) {
                goToPath();
            } else {
                resetPath();
            }
        }
    };

    const label = treeElement?.record
        ? treeElement.record.whoAmI.label || treeElement.record.id
        : activeTree?.label || activeTree?.id;

    const _handleClearSelection = () => {
        dispatch(resetSelection());
    };

    const _handleClickCheckbox = () => {
        // Select all elements from current column
        const columnSelection: ISharedSelected[] = children
            .filter(child => child.permissions.access_tree)
            .map(child => ({
                id: child.record.whoAmI.id,
                nodeId: child.id,
                library: child.record.whoAmI.library.id,
                label: child.record.whoAmI.label
            }));

        dispatch(
            setSelection({
                type: SharedStateSelectionType.navigation,
                selected: columnSelection,
                parent: treeElement?.id ?? null
            })
        );
    };

    return (
        <HeaderColumn onClick={headerClickFn} $isActive={isActive}>
            {!!selectionCount && isActive ? (
                <Tooltip
                    title={t('navigation.header.nb-selection', {
                        nb: selectionCount,
                        selectionType: t(`search.type.${SharedStateSelectionType[selectionState.selection.type]}`)
                    })}
                    placement="right"
                >
                    {t('navigation.header.selection_label', {count: selectionCount})}
                    <Button
                        icon={<CloseSquareOutlined />}
                        aria-label="clear-selection"
                        onClick={_handleClearSelection}
                        style={{border: 'none', color: '#000'}}
                        ghost
                    />
                </Tooltip>
            ) : (
                <>
                    {isActive && !!treeElement?.childrenCount && (
                        <Checkbox className="select-all-checkbox" onClick={_handleClickCheckbox} />
                    )}
                    <Paragraph ellipsis={{tooltip: label, rows: 1}} style={{marginBottom: 0, marginRight: '.5em'}}>
                        {label}
                    </Paragraph>
                </>
            )}
            {isActive && <HeaderColumnNavigationActions depth={depth} isDetail={isDetail} />}
        </HeaderColumn>
    );
}

export default HeaderColumnNavigation;
