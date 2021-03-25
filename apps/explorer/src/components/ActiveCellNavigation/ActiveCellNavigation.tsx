// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RightOutlined} from '@ant-design/icons';
import {Badge, Tooltip} from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import {useLang} from 'hooks/LangHook/LangHook';
import {setSharedSelection} from 'hooks/SharedStateHook/SharedReducerActions';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import {ISharedSelected, SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {localizedLabel} from 'utils';
import {TreeElementInput} from '_gqlTypes/globalTypes';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../graphQL/queries/trees/getTreeContentQuery';
import {resetRecordDetail, setPath, setRecordDetail} from '../../Reducer/NavigationReducerActions';
import themingVar from '../../themingVar';
import {INavigationPath, IRecordIdentityWhoAmI, PreviewSize} from '../../_types/types';
import RecordCard from '../shared/RecordCard';

interface ICellProps {
    style?: CSSObject;
    isInPath: boolean;
}

const Cell = styled.div<ICellProps>`
    display: grid;
    place-items: center;
    grid-template-columns: 2rem auto auto 2rem;
    padding: 1rem;
    background: ${props => {
        if (props.isInPath) {
            return themingVar['@item-active-bg'];
        }
        return 'none';
    }};

    &:hover {
        background: ${themingVar['@item-hover-bg']};

        .checkbox-wrapper {
            opacity: 1;
        }
    }

    .counter {
        justify-self: flex-end;
    }
`;

const RecordCardWrapper = styled.div`
    & > * > * {
        justify-content: space-around;
    }
`;

interface ICheckboxWrapperProps {
    selectionActive: boolean;
}

const CheckboxWrapper = styled.div<ICheckboxWrapperProps>`
    opacity: ${({selectionActive}) => (selectionActive ? 1 : 0)};
    transition: 100ms ease;

    :hover {
        opacity: 1;
    }
`;

interface IActiveCellNavigationProps {
    treeElement: IRecordAndChildren;
    depth: number;
}

function ActiveCellNavigation({treeElement, depth}: IActiveCellNavigationProps): JSX.Element {
    const {stateNavigation, dispatchNavigation} = useStateNavigation();
    const {stateShared, dispatchShared} = useStateShared();

    const [{lang}] = useLang();

    const parentElement = stateNavigation.path[depth - 1];
    const parent: TreeElementInput = {
        id: parentElement?.id,
        library: parentElement?.library
    };

    const recordLabel = treeElement.record.whoAmI.label;

    const addPath = () => {
        const newPathElement: INavigationPath = {
            id: treeElement.record.whoAmI.id,
            library: treeElement.record.whoAmI.library.id,
            label: recordLabel
        };

        const newPath = [...stateNavigation.path.splice(0, depth), newPathElement];

        dispatchNavigation(setPath(newPath));

        if (treeElement.children?.length) {
            dispatchNavigation(resetRecordDetail());
        } else {
            dispatchNavigation(setRecordDetail(treeElement.record));
        }
    };

    const handleCheckboxOnClick = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        const current = stateShared.selection.selected.find(
            element =>
                element.id === treeElement.record.whoAmI.id && element.library === treeElement.record.whoAmI.library.id
        );

        if (current) {
            // remove from selected
            const newSelected = stateShared.selection.selected.filter(
                element =>
                    element.id !== treeElement.record.whoAmI.id ||
                    element.library !== treeElement.record.whoAmI.library.id
            );

            const selection = {
                type: SharedStateSelectionType.navigation,
                selected: newSelected,
                parent
            };

            dispatchShared(setSharedSelection(selection));
        } else {
            // add to selected
            const label = localizedLabel(treeElement.record.whoAmI.label, lang);
            const newElementSelected: ISharedSelected = {
                id: treeElement.record.whoAmI.id,
                library: treeElement.record.whoAmI.library.id,
                label
            };

            // reset selection if previous selection is not navigation or if the parent change
            let newSelected: ISharedSelected[] = [newElementSelected];
            if (stateShared.selection.type === SharedStateSelectionType.navigation) {
                if (
                    parent.id === stateShared.selection.parent?.id &&
                    parent.library === stateShared.selection.parent?.library
                ) {
                    // keep selection if parent is the same
                    newSelected = [...stateShared.selection.selected, newElementSelected];
                }
            }

            const selection = {
                type: SharedStateSelectionType.navigation,
                selected: newSelected,
                parent
            };

            dispatchShared(setSharedSelection(selection));
        }
    };

    const record: IRecordIdentityWhoAmI = {
        ...treeElement.record.whoAmI,
        label: recordLabel ?? ''
    };

    const isInPath = stateNavigation.path.some(
        pathPart =>
            pathPart.id === treeElement.record.whoAmI.id && pathPart.library === treeElement.record.whoAmI.library.id
    );

    const isChecked = stateShared.selection.selected.some(
        element =>
            element.id === treeElement.record.whoAmI.id && element.library === treeElement.record.whoAmI.library.id
    );

    const hasChild = !!treeElement.children?.length;

    return (
        <Cell onClick={addPath} isInPath={isInPath}>
            <CheckboxWrapper
                onClick={e => {
                    // checkbox onclick doesn't allow to do that
                    e.preventDefault();
                    e.stopPropagation();
                }}
                className="checkbox-wrapper"
                selectionActive={!!stateShared.selection.selected.length}
            >
                <Checkbox onClick={handleCheckboxOnClick} checked={isChecked} />
            </CheckboxWrapper>
            <Tooltip title={treeElement.record.whoAmI.label}>
                <RecordCardWrapper>
                    <RecordCard record={record} size={PreviewSize.small} />
                </RecordCardWrapper>
            </Tooltip>

            {!!treeElement.children?.length && (
                <>
                    <div className="counter">
                        <Badge count={treeElement.children?.length} />
                    </div>
                    <div>
                        <RightOutlined />
                    </div>
                </>
            )}
        </Cell>
    );
}

export default ActiveCellNavigation;
