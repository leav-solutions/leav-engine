// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {NodeData} from 'react-sortable-tree';
import {Breadcrumb, Icon, Popup} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_TREE_BY_ID_trees_list} from '../../../../../../../../../../../_gqlTypes/GET_TREE_BY_ID';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../../../../../utils';
import RecordCard from '../../../../../../../../../../shared/RecordCard';
import TreeExplorer from '../../../../../../../../../../trees/TreeExplorer';
import {
    ActiveDependencyNode,
    FormBuilderActionTypes,
    defaultDepAttribute,
    defaultDepValue
} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';

interface IBreadcrumbSectionProps {
    treeData: GET_TREE_BY_ID_trees_list;
    element?: ActiveDependencyNode;
    ancestors?: ActiveDependencyNode[];
}

const TreeElement = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
`;

const TreeWrapper = styled.div`
    height: 300px;
    width: 300px;
`;

const BreadcrumbSectionWrapper = styled(Breadcrumb.Section)`
    position: relative;
`;

function BreadcrumbSection({treeData, element, ancestors}: IBreadcrumbSectionProps): JSX.Element {
    const {lang} = useLang();
    const treeLabel = localizedLabel(treeData.label, lang);
    const {state, dispatch} = useFormBuilderReducer();

    const [showTree, setShowTree] = useState<boolean>(false);

    const _handleOpenTree = () => setShowTree(true);
    const _handleCloseTree = () => setShowTree(false);

    // No element supplied, consider it's root so display tree label
    const content = element ? <RecordCard record={element?.record?.whoAmI} /> : treeLabel;

    const _handleTreeNodeSelection = ({node}: NodeData) => {
        setShowTree(false);
        dispatch({
            type: FormBuilderActionTypes.CHANGE_ACTIVE_DEPENDENCY,
            activeDependency: {
                attribute: state.activeDependency?.attribute || defaultDepAttribute,
                value: (node as ActiveDependencyNode) || {id: defaultDepValue, record: null},
                ancestors: node.ancestors ? node.ancestors.slice(0, -1) : []
            }
        });
    };

    const _handleClickOnElement = () =>
        dispatch({
            type: FormBuilderActionTypes.CHANGE_ACTIVE_DEPENDENCY,
            activeDependency: {
                attribute: state.activeDependency?.attribute ?? defaultDepAttribute,
                value: element ?? null,
                ancestors: ancestors ?? []
            }
        });

    // We'll display tree starting from element's parent, to have its siblings and children accessible
    let startTreeFrom;
    if (ancestors) {
        const parent = ancestors.slice(-1)[0];
        startTreeFrom = parent?.id;
    }

    return (
        <BreadcrumbSectionWrapper>
            <TreeElement>
                <div className="identity" onClick={_handleClickOnElement}>
                    {content}
                </div>

                <Popup
                    on="click"
                    open={showTree}
                    onOpen={_handleOpenTree}
                    onClose={_handleCloseTree}
                    trigger={
                        <div className="dropdown-icon">
                            <Icon name="dropdown" />
                        </div>
                    }
                    content={
                        <TreeWrapper>
                            <TreeExplorer
                                tree={treeData}
                                onClickNode={_handleTreeNodeSelection}
                                readOnly
                                compact
                                startAt={startTreeFrom}
                            />
                        </TreeWrapper>
                    }
                    position="bottom left"
                    basic
                />
            </TreeElement>
        </BreadcrumbSectionWrapper>
    );
}

export default BreadcrumbSection;
