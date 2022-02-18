// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseSquareOutlined} from '@ant-design/icons';
import {Button, Checkbox, Tooltip} from 'antd';
import {ITreeContentRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {resetNavigationRecordDetail, setNavigationPath} from 'redux/navigation';
import {resetSelection, setSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {ISharedSelected, SharedStateSelectionType} from '_types/types';
import {useActiveTree} from '../../../../hooks/ActiveTreeHook/ActiveTreeHook';
import themingVar from '../../../../themingVar';
import HeaderColumnNavigationActions from './HeaderColumnNavigationActions';

interface IHeaderColumnProps {
    isActive: boolean;
}

const HeaderColumn = styled.header<IHeaderColumnProps>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: ${themingVar['@item-active-bg']};
    height: 4rem;
    flex-shrink: 0;
    cursor: pointer;

    ${({isActive}) =>
        !isActive &&
        `&:hover {
        background: ${themingVar['@item-hover-bg']};
    }`}

    &:not(:hover) .select-all-checkbox {
        visibility: hidden;
    }
`;

interface IHeaderColumnNavigationProps {
    depth: number;
    isDetail?: boolean;
    isActive?: boolean;
    treeElement?: ITreeContentRecordAndChildren;
}

function HeaderColumnNavigation({depth, isDetail, isActive, treeElement}: IHeaderColumnNavigationProps): JSX.Element {
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
        dispatch(resetNavigationRecordDetail());
    };

    const goToPath = () => {
        dispatch(setNavigationPath(navigation.path.slice(0, currentPositionInPath)));
        dispatch(resetNavigationRecordDetail());
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
        const columnSelection: ISharedSelected[] = treeElement.children.map(child => ({
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
        <HeaderColumn onClick={headerClickFn} isActive={isActive}>
            {!!selectionCount && isActive ? (
                <Tooltip
                    title={t('navigation.header.nb-selection', {
                        nb: selectionCount,
                        selectionType: t(`search.type.${SharedStateSelectionType[selectionState.selection.type]}`)
                    })}
                    placement="right"
                >
                    {selectionCount}
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
                    {isActive && !isDetail && (
                        <Checkbox className="select-all-checkbox" onClick={_handleClickCheckbox} />
                    )}
                    <span>{label}</span>
                </>
            )}
            {isActive && <HeaderColumnNavigationActions depth={depth} isDetail={isDetail} />}
        </HeaderColumn>
    );
}

export default HeaderColumnNavigation;
