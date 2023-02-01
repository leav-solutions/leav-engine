// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    InfoCircleOutlined,
    LockFilled,
    PictureOutlined,
    RightOutlined,
    SearchOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {themeVars} from '@leav/ui';
import {Badge, message, Tooltip} from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import TriggerPreviewsGenerationModal from 'components/shared/TriggerPreviewsGenerationModal';
import {useLang} from 'hooks/LangHook/LangHook';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setNavigationPath} from 'reduxStore/navigation';
import {setSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import styled, {CSSObject} from 'styled-components';
import {localizedTranslation} from 'utils';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
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
    isRecordActive: boolean;
}

const _getGridTemplateColumns = (isActive: boolean, isRecordActive) => {
    let template = [];

    if (isActive) {
        template = ['1rem'];
    }

    if (!isRecordActive) {
        template = [...template, '1rem'];
    }

    template = [...template, 'auto', 'auto', '1rem'];

    return template.join(' ');
};

const RowWrapper = styled.div<IRowProps>`
    position: relative;
    display: grid;

    place-items: flex-start;
    align-items: center;
    max-width: ${themeVars.navigationColumnWidth};
    overflow: hidden;

    grid-template-columns: ${props => _getGridTemplateColumns(props.isActive, props.isRecordActive)};
    padding: 1rem 0.5rem;
    background: ${props => {
        if (props.isInPath) {
            return themeVars.activeColor;
        }
        return 'none';
    }};

    &:hover {
        ${props => (props.isInPath ? '' : `background: ${themeVars.activeColor}`)};

        .checkbox-wrapper {
            opacity: 1;
        }
    }

    .counter {
        justify-self: flex-end;
    }

    :not(:hover) .floating-menu {
        display: none;
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
    treeElement: TREE_NODE_CHILDREN_treeNodeChildren_list;
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
    const [displayPreviewConfirm, setDisplayPreviewConfirm] = useState(false);

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

    const _handleClickClassifiedIn = () => message.warning(t('global.feature_not_available'));

    const _handleClickDetails = () => {
        const newPath = [...navigation.path.slice(0, depth), {...treeElement, showDetails: true}];

        dispatch(setNavigationPath(newPath));
    };

    const _handleClickGeneratePreviews = () => {
        setDisplayPreviewConfirm(true);
    };

    const _handleClosePreviewGenerationConfirm = () => {
        setDisplayPreviewConfirm(false);
    };

    const record: IRecordIdentityWhoAmI = {
        ...treeElement.record.whoAmI,
        label: recordLabel ?? ''
    };

    const isInPath = navigation.path.some(pathPart => pathPart.id === treeElement.id);

    const isChecked = selectionState.selection.selected.some(element => element.nodeId === treeElement.id);
    const isRecordActive = treeElement.record.active;

    const menuBtnSize: SizeType = 'middle';
    const menuActions: FloatingMenuAction[] = [
        {
            title: t('global.details'),
            button: <EditRecordBtn shape={'circle'} record={record} size={menuBtnSize} />
        }
    ];

    const moreMenuActions: FloatingMenuAction[] = isAccessible
        ? [
              {
                  title: t('navigation.actions.details'),
                  icon: <InfoCircleOutlined />,
                  onClick: _handleClickDetails
              },
              {
                  title: t('navigation.actions.classified_in'),
                  icon: <SearchOutlined />,
                  onClick: _handleClickClassifiedIn
              },
              {
                  title: t('files.generate_previews'),
                  icon: <PictureOutlined />,
                  onClick: _handleClickGeneratePreviews
              }
          ]
        : [];

    return (
        <RowWrapper onClick={addPath} isInPath={isInPath} isActive={isActive} isRecordActive={isRecordActive}>
            <FloatingMenu
                actions={menuActions}
                moreActions={moreMenuActions}
                style={{right: '15px'}}
                size={menuBtnSize}
            />
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
            {!isRecordActive && (
                <Tooltip title={t('navigation.inactive_element')}>
                    <WarningOutlined style={{color: themeVars.errorColor, fontSize: '1.3em', marginLeft: '0.5rem'}} />
                </Tooltip>
            )}
            <RecordCardWrapper>
                <RecordCard record={record} size={PreviewSize.small} />
            </RecordCardWrapper>

            {!!treeElement.childrenCount && (
                <>
                    <div className="counter">
                        <Badge
                            count={treeElement.childrenCount}
                            overflowCount={1000}
                            style={{
                                background: themeVars.secondaryBg,
                                color: themeVars.defaultTextColor
                            }}
                        />
                    </div>
                    <div>{isAccessible && <RightOutlined />}</div>
                </>
            )}
            {displayPreviewConfirm && (
                <TriggerPreviewsGenerationModal
                    libraryId={record.library.id}
                    recordIds={[record.id]}
                    onClose={_handleClosePreviewGenerationConfirm}
                />
            )}
        </RowWrapper>
    );
}

export default Row;
