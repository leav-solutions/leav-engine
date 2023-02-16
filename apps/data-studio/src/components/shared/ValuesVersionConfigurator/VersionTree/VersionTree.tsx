// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseCircleFilled} from '@ant-design/icons';
import {themeVars, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Space, theme} from 'antd';
import {GlobalToken} from 'antd/lib/theme/interface';
import SelectTreeNodeModal from 'components/shared/SelectTreeNodeModal';
import TreeIcon from 'components/shared/TreeIcon';
import React, {SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile_trees} from '_gqlTypes/GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY';
import {ITreeNode} from '_types/types';

const Wrapper = styled.div`
    background: ${themeVars.lightBg};
    padding: 1rem;
    border-radius: 3px;
    margin-bottom: 8px;
    border: 2px solid transparent;
`;

const TreeLabel = styled(Space)`
    font-weight: bold;
    font-size: 1em;
`;

const SelectedNodeTitle = styled(Button)<{$hasSelection: boolean; $themeToken: GlobalToken}>`
    && {
        width: 100%;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: ${themeVars.defaultBg};
        border: 1px solid ${themeVars.borderColor};
        border-radius: ${p => p.$themeToken.borderRadius}px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        color: ${props => (props.$hasSelection ? themeVars.defaultTextColor : themeVars.secondaryTextColor)};
        align-items: center;
    }
`;

const ClearSelectionBtn = styled(CloseCircleFilled)`
    && {
        cursor: pointer;
        color: ${themeVars.secondaryTextColor};
        font-size: 0.8em;
        display: none;

        ${SelectedNodeTitle}:hover & {
            display: block;
        }
    }
`;

interface IVersionTreeProps {
    tree: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile_trees;
    selectedNode: ITreeNode | null;
    readOnly: boolean;
    onNodeChange: (node: ITreeNode | null) => void;
}

function VersionTree({tree, selectedNode, readOnly, onNodeChange}: IVersionTreeProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
    const {token} = theme.useToken();

    const [isTreeNodeSelectorOpen, setIsTreeNodeSelectorOpen] = React.useState(false);

    const _handleTreeSelect = (node: ITreeNode) => {
        onNodeChange(node);
    };

    const _handleClickSelectedNode = () => {
        setIsTreeNodeSelectorOpen(true);
    };

    const _handleCloseTreeSelector = () => {
        setIsTreeNodeSelectorOpen(false);
    };

    const _handleClearSelection = (e: SyntheticEvent) => {
        e.stopPropagation();
        onNodeChange(null);
    };

    const treeLabel = localizedTranslation(tree.label, lang);
    const hasSelection = !!selectedNode;

    return (
        <>
            <Wrapper>
                <TreeLabel>
                    <TreeIcon />
                    {treeLabel}
                </TreeLabel>
                <SelectedNodeTitle
                    disabled={readOnly}
                    onClick={_handleClickSelectedNode}
                    $hasSelection={hasSelection}
                    $themeToken={token}
                >
                    {selectedNode?.title || t('values_version.select_version') + '...'}
                    {hasSelection && <ClearSelectionBtn onClick={_handleClearSelection} />}
                </SelectedNodeTitle>
            </Wrapper>
            {isTreeNodeSelectorOpen && (
                <SelectTreeNodeModal
                    tree={tree}
                    onClose={_handleCloseTreeSelector}
                    visible={isTreeNodeSelectorOpen}
                    onSubmit={_handleTreeSelect}
                    selectedNodeKey={selectedNode?.id}
                />
            )}
        </>
    );
}

export default VersionTree;
