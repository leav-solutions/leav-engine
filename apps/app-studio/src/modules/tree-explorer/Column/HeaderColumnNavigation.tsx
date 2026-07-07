import {type FunctionComponent} from 'react';
import {CloseSquareOutlined} from '@ant-design/icons';
import {themeVars} from '@leav/ui';
import {Button, Checkbox, Tooltip, Typography} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {type ITreeExplorerNode, type ITreeExplorerSelectedNode} from '../_types';
import {useTreeExplorerState} from '../store/useTreeExplorerState';
import {HeaderColumnNavigationActions} from './actions/HeaderColumnNavigationActions';

const {Paragraph} = Typography;

const HeaderColumn = styled.header<{$isActive: boolean}>`
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
    treeElement?: ITreeExplorerNode;
    children?: ITreeExplorerNode[];
}

export const HeaderColumnNavigation: FunctionComponent<IHeaderColumnNavigationProps> = ({
    depth,
    isDetail,
    isActive,
    treeElement,
    children,
}) => {
    const {t} = useTranslation();
    const {activeTree, path, selection, setPath, setSelection, resetSelection} = useTreeExplorerState();

    const currentPositionInPath = depth;
    const selectionCount = selection.selected.length;
    const parent = path[currentPositionInPath - 1];

    const goToPath = () => setPath(path.slice(0, currentPositionInPath));

    const headerClickFn = () => {
        if (!isActive) {
            goToPath();
        }
    };

    const label = treeElement?.record
        ? treeElement.record.whoAmI.label || treeElement.record.id
        : activeTree?.label || activeTree?.id;

    const _handleClickCheckbox = () => {
        // Select every accessible node of the current column.
        const columnSelection: ITreeExplorerSelectedNode[] = (children ?? [])
            .filter(child => child.permissions.access_tree)
            .map(child => ({
                id: child.record.whoAmI.id,
                nodeId: child.id,
                library: child.record.whoAmI.library.id,
                label: child.record.whoAmI.label ?? '',
            }));

        setSelection(columnSelection, treeElement?.id ?? null);
    };

    return (
        <HeaderColumn onClick={headerClickFn} $isActive={isActive}>
            {!!selectionCount && isActive ? (
                <Tooltip title={t('tree-explorer.header.nb-selection', {nb: selectionCount})} placement="right">
                    {t('tree-explorer.header.selection_label', {count: selectionCount})}
                    <Button
                        icon={<CloseSquareOutlined />}
                        aria-label="clear-selection"
                        onClick={resetSelection}
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
};
