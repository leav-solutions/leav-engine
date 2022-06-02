// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LockFilled, RightOutlined} from '@ant-design/icons';
import {Badge, Tooltip} from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {setNavigationPath} from 'redux/navigation';
import {setSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {localizedTranslation} from 'utils';
import {GET_TREE_CONTENT_treeContent} from '_gqlTypes/GET_TREE_CONTENT';
import themingVar from '../../../../../themingVar';
import {
    IRecordIdentityWhoAmI,
    ISharedSelected,
    ISharedStateSelectionNavigation,
    PreviewSize,
    SharedStateSelectionType
} from '../../../../../_types/types';
import RecordCard from '../../../../shared/RecordCard';

interface IRowProps {
    style?: CSSObject;
    isInPath: boolean;
    isActive: boolean;
}

const RowWrapper = styled.div<IRowProps>`
    position: relative;
    display: grid;

    place-items: flex-start;
    align-items: center;
    max-width: ${themingVar['@leav-navigation-column-width']};
    overflow: hidden;

    grid-template-columns: ${props => (props.isActive ? '1rem auto auto 1rem' : 'auto auto 1rem')};
    padding: 1rem 0.5rem;
    background: ${props => {
        if (props.isInPath) {
            return themingVar['@leav-background-active'];
        }
        return 'none';
    }};

    &:hover {
        ${props => (props.isInPath ? '' : `background: ${themingVar['@item-hover-bg']}`)};

        .checkbox-wrapper {
            opacity: 1;
        }
    }

    .counter {
        justify-self: flex-end;
    }
`;

const RecordCardWrapper = styled.div`
    min-width: 0;
    width: 100%;
    padding-right: 0.2rem;

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

interface IActiveRowNavigationProps {
    isActive: boolean;
    treeElement: GET_TREE_CONTENT_treeContent;
    depth: number;
}

function Row({isActive, treeElement, depth}: IActiveRowNavigationProps): JSX.Element {
    const [{lang}] = useLang();

    const {t} = useTranslation();
    const {selectionState, navigation} = useAppSelector(state => ({
        selectionState: state.selection,
        navigation: state.navigation
    }));
    const dispatch = useAppDispatch();
    const parentElement = navigation.path[depth - 1];
    const recordLabel = treeElement.record.whoAmI.label;
    const isAccessible = treeElement.permissions.access_tree;

    const addPath = () => {
        if (!isAccessible) {
            return;
        }

        const newPath = [...navigation.path.slice(0, depth), {...treeElement}];

        dispatch(setNavigationPath(newPath));
    };

    const handleCheckboxOnClick = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        const current = selectionState.selection.selected.find(element => element.nodeId === treeElement.id);

        if (current) {
            // remove from selected
            const newSelected = selectionState.selection.selected.filter(element => element.nodeId !== treeElement.id);

            const selection: ISharedStateSelectionNavigation = {
                type: SharedStateSelectionType.navigation,
                selected: newSelected,
                parent: parentElement?.id
            };

            dispatch(setSelection(selection));
        } else {
            // add to selected
            const label = localizedTranslation(treeElement.record.whoAmI.label, lang);
            const newElementSelected: ISharedSelected = {
                id: treeElement.record.whoAmI.id,
                nodeId: treeElement.id,
                library: treeElement.record.whoAmI.library.id,
                label
            };

            // reset selection if previous selection is not navigation or if the parent change
            let newSelected: ISharedSelected[] = [newElementSelected];
            if (
                selectionState.selection.type === SharedStateSelectionType.navigation &&
                parentElement?.id === selectionState.selection.parent
            ) {
                // keep selection if parent is the same
                newSelected = [...selectionState.selection.selected, newElementSelected];
            }

            const selection: ISharedStateSelectionNavigation = {
                type: SharedStateSelectionType.navigation,
                selected: newSelected,
                parent: parentElement?.id
            };

            dispatch(setSelection(selection));
        }
    };

    const record: IRecordIdentityWhoAmI = {
        ...treeElement.record.whoAmI,
        label: recordLabel ?? ''
    };

    const isInPath = navigation.path.some(
        pathPart =>
            pathPart.record.id === treeElement.record.id &&
            pathPart.record.whoAmI.library.id === treeElement.record.whoAmI.library.id
    );

    const isChecked = selectionState.selection.selected.some(element => element.nodeId === treeElement.id);

    return (
        <RowWrapper onClick={addPath} isInPath={isInPath} isActive={isActive}>
            {!isAccessible && (
                <Tooltip title={t('navigation.access_denied')}>
                    <LockFilled />
                </Tooltip>
            )}
            {isActive && isAccessible && (
                <CheckboxWrapper
                    onClick={e => {
                        // checkbox onclick doesn't allow to do that
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="checkbox-wrapper"
                    selectionActive={!!selectionState.selection.selected.length}
                >
                    <Checkbox onClick={handleCheckboxOnClick} checked={isChecked} />
                </CheckboxWrapper>
            )}
            <RecordCardWrapper>
                <RecordCard record={record} size={PreviewSize.small} />
            </RecordCardWrapper>

            {!!treeElement.childrenCount && (
                <>
                    <div className="counter">
                        <Badge count={treeElement.childrenCount} overflowCount={1000} />
                    </div>
                    <div>{isAccessible && <RightOutlined />}</div>
                </>
            )}
        </RowWrapper>
    );
}

export default Row;
