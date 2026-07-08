import {type CSSProperties, useState} from 'react';
import {InfoCircleOutlined, LockFilled, PictureOutlined, RightOutlined, WarningOutlined} from '@ant-design/icons';
import {
    EditRecordBtn,
    FloatingMenu,
    type FloatingMenuAction,
    type IRecordIdentityWhoAmI,
    PreviewSize,
    RecordCard,
    themeVars,
    TriggerPreviewsGenerationModal,
} from '@leav/ui';
import {Badge, Checkbox, message, Tooltip} from 'antd';
import {type SizeType} from 'antd/es/config-provider/SizeContext';
import {useTranslation} from 'react-i18next';
import {TreeBehavior} from '../../../../../../__generated__';
import cn from 'classnames';
import {type ITreeExplorerNode} from '../_types';
import {useTreeExplorerState} from '../store/useTreeExplorerState';
import {getFilesLibraryId} from '../utils';
import {
    checkboxWrapper,
    counter,
    inactiveIcon,
    isInPath as isInPathClass,
    recordCardWrapper,
    rowWrapper,
    selectionActive,
} from './row.module.css';

// Style objects for third-party components whose style props can't be a CSS module class.
const FLOATING_MENU_STYLE = {right: '15px'};
const CHILDREN_COUNT_BADGE_STYLE = {
    background: themeVars.secondaryBg,
    color: themeVars.defaultTextColor,
};

const _getGridTemplateColumns = (isActive: boolean, isRecordActive: boolean): string => {
    let template: string[] = [];

    if (isActive) {
        template = ['1rem'];
    }

    if (!isRecordActive) {
        template = [...template, '1rem'];
    }

    template = [...template, 'auto', 'auto', '1rem'];

    return template.join(' ');
};

export const Row = ({
    isActive,
    treeElement,
    depth,
}: {
    isActive: boolean;
    treeElement: ITreeExplorerNode;
    depth: number;
}) => {
    const {t} = useTranslation();
    const {activeTree, path, selection, setPath, setSelection} = useTreeExplorerState();
    const [displayPreviewConfirm, setDisplayPreviewConfirm] = useState(false);

    const parentElement = path[depth - 1];
    const recordLabel = treeElement.record.whoAmI.label;
    const isAccessible = treeElement.permissions.access_tree;

    const addPath = () => {
        if (!isAccessible) {
            return;
        }

        setPath([...path.slice(0, depth), {...treeElement}]);
    };

    const handleCheckboxOnClick = (e: {preventDefault: () => void; stopPropagation: () => void}) => {
        e.preventDefault();
        e.stopPropagation();

        const isSameParent = selection.parent === (parentElement?.id ?? null);
        const current = selection.selected.find(element => element.nodeId === treeElement.id);

        if (current) {
            setSelection(
                selection.selected.filter(element => element.nodeId !== treeElement.id),
                parentElement?.id ?? null,
            );
            return;
        }

        const newElementSelected = {
            id: treeElement.record.whoAmI.id,
            nodeId: treeElement.id,
            library: treeElement.record.whoAmI.library.id,
            label: recordLabel ?? '',
        };

        // Keep the existing selection only when it targets the same parent column, otherwise start fresh.
        const newSelected = isSameParent ? [...selection.selected, newElementSelected] : [newElementSelected];

        setSelection(newSelected, parentElement?.id ?? null);
    };

    const _handleClickDetails = () => {
        setPath([...path.slice(0, depth), {...treeElement, showDetails: true}]);
    };

    const _handleClickGeneratePreviews = () => setDisplayPreviewConfirm(true);
    const _handleClosePreviewGenerationConfirm = () => setDisplayPreviewConfirm(false);

    const record: IRecordIdentityWhoAmI = {
        ...treeElement.record.whoAmI,
        label: recordLabel ?? '',
    };

    const isInPath = path.some(pathPart => pathPart.id === treeElement.id);
    const isChecked = selection.selected.some(element => element.nodeId === treeElement.id);
    const isRecordActive = treeElement.record.active?.[0]?.value ?? true;

    const menuBtnSize: SizeType = 'middle';
    const menuActions: FloatingMenuAction[] = [
        {
            title: t('tree_explorer.details'),
            button: <EditRecordBtn shape="circle" record={record} size={menuBtnSize} />,
        },
    ];

    const moreMenuActions: FloatingMenuAction[] = isAccessible
        ? [
              {
                  title: t('tree_explorer.actions.details'),
                  icon: <InfoCircleOutlined />,
                  onClick: _handleClickDetails,
              },
          ]
        : [];

    if (activeTree?.behavior === TreeBehavior.files) {
        moreMenuActions.push({
            title: t('tree_explorer.actions.generate_previews'),
            icon: <PictureOutlined />,
            onClick: _handleClickGeneratePreviews,
        });
    }

    const filesLibraryId = getFilesLibraryId(activeTree);

    return (
        <div
            onClick={addPath}
            className={cn(rowWrapper, {[isInPathClass]: isInPath})}
            style={{'--row-grid-template-columns': _getGridTemplateColumns(isActive, isRecordActive)} as CSSProperties}
        >
            <FloatingMenu
                actions={menuActions}
                moreActions={moreMenuActions}
                style={FLOATING_MENU_STYLE}
                size={menuBtnSize}
            />
            {!isAccessible && (
                <Tooltip title={t('tree_explorer.access_denied')}>
                    <LockFilled />
                </Tooltip>
            )}
            {isActive && isAccessible && (
                <div
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className={cn(checkboxWrapper, {
                        [selectionActive]: !!selection.selected.length,
                    })}
                >
                    <Checkbox onClick={handleCheckboxOnClick} checked={isChecked} />
                </div>
            )}
            {!isRecordActive && (
                <Tooltip title={t('tree_explorer.inactive_element')}>
                    <WarningOutlined className={inactiveIcon} />
                </Tooltip>
            )}
            <div className={recordCardWrapper}>
                <RecordCard record={record} size={PreviewSize.SMALL} />
            </div>

            {!!treeElement.childrenCount && (
                <>
                    <div className={counter}>
                        <Badge
                            count={treeElement.childrenCount}
                            overflowCount={1000}
                            style={CHILDREN_COUNT_BADGE_STYLE}
                        />
                    </div>
                    <div>{isAccessible && <RightOutlined />}</div>
                </>
            )}
            {displayPreviewConfirm && (
                <TriggerPreviewsGenerationModal
                    filesLibraryId={filesLibraryId}
                    libraryId={record.library.id}
                    recordIds={[record.id]}
                    onClose={_handleClosePreviewGenerationConfirm}
                />
            )}
        </div>
    );
};
