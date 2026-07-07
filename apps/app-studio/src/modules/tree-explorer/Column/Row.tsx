import {type FunctionComponent, useState} from 'react';
import {
    InfoCircleOutlined,
    LockFilled,
    PictureOutlined,
    RightOutlined,
    SearchOutlined,
    WarningOutlined,
} from '@ant-design/icons';
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
import styled, {type CSSObject} from 'styled-components';
import {TreeBehavior} from '../../../__generated__';
import {type ITreeExplorerNode} from '../_types';
import {useTreeExplorerState} from '../store/useTreeExplorerState';
import {getFilesLibraryId} from '../utils';

interface IRowStyleProps {
    $isInPath: boolean;
    $isActive: boolean;
    $isRecordActive: boolean;
}

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

const RowWrapper = styled.div<IRowStyleProps>`
    position: relative;
    display: grid;

    place-items: flex-start;
    align-items: center;
    max-width: ${themeVars.navigationColumnWidth};
    overflow: hidden;

    grid-template-columns: ${props => _getGridTemplateColumns(props.$isActive, props.$isRecordActive)};
    padding: 1rem 0.5rem;
    background: ${props => (props.$isInPath ? themeVars.activeColor : 'none')};

    &:hover {
        ${props => (props.$isInPath ? '' : `background: ${themeVars.activeColor}`)};

        .checkbox-wrapper {
            opacity: 1;
        }
    }

    .counter {
        justify-self: flex-end;
    }

    &:not(:hover) .floating-menu {
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

const CheckboxWrapper = styled.div<{$selectionActive: boolean}>`
    opacity: ${({$selectionActive}) => ($selectionActive ? 1 : 0)};
    transition: 100ms ease;

    :hover {
        opacity: 1;
    }
`;

interface IRowProps {
    isActive: boolean;
    treeElement: ITreeExplorerNode;
    depth: number;
}

export const Row: FunctionComponent<IRowProps> = ({isActive, treeElement, depth}) => {
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

    const _handleClickClassifiedIn = () => message.warning(t('tree-explorer.feature_not_available'));

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
            title: t('tree-explorer.details'),
            button: <EditRecordBtn shape="circle" record={record} size={menuBtnSize} />,
        },
    ];

    const moreMenuActions: FloatingMenuAction[] = isAccessible
        ? [
              {
                  title: t('tree-explorer.actions.details'),
                  icon: <InfoCircleOutlined />,
                  onClick: _handleClickDetails,
              },
              {
                  title: t('tree-explorer.actions.classified_in'),
                  icon: <SearchOutlined />,
                  onClick: _handleClickClassifiedIn,
              },
          ]
        : [];

    if (activeTree?.behavior === TreeBehavior.files) {
        moreMenuActions.push({
            title: t('tree-explorer.actions.generate_previews'),
            icon: <PictureOutlined />,
            onClick: _handleClickGeneratePreviews,
        });
    }

    const filesLibraryId = getFilesLibraryId(activeTree);

    return (
        <RowWrapper onClick={addPath} $isInPath={isInPath} $isActive={isActive} $isRecordActive={isRecordActive}>
            <FloatingMenu
                actions={menuActions}
                moreActions={moreMenuActions}
                style={{right: '15px'}}
                size={menuBtnSize}
            />
            {!isAccessible && (
                <Tooltip title={t('tree-explorer.access_denied')}>
                    <LockFilled />
                </Tooltip>
            )}
            {isActive && isAccessible && (
                <CheckboxWrapper
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="checkbox-wrapper"
                    $selectionActive={!!selection.selected.length}
                >
                    <Checkbox onClick={handleCheckboxOnClick} checked={isChecked} />
                </CheckboxWrapper>
            )}
            {!isRecordActive && (
                <Tooltip title={t('tree-explorer.inactive_element')}>
                    <WarningOutlined style={{color: themeVars.errorColor, fontSize: '1.3em', marginLeft: '0.5rem'}} />
                </Tooltip>
            )}
            <RecordCardWrapper>
                <RecordCard record={record} size={PreviewSize.SMALL} />
            </RecordCardWrapper>

            {!!treeElement.childrenCount && (
                <>
                    <div className="counter">
                        <Badge
                            count={treeElement.childrenCount}
                            overflowCount={1000}
                            style={{
                                background: themeVars.secondaryBg,
                                color: themeVars.defaultTextColor,
                            }}
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
        </RowWrapper>
    );
};
