// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IdcardOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Checkbox, List, Radio, Spin} from 'antd';
import React from 'react';
import styled from 'styled-components';
import Attribute from '..';
import {getTreeAttributesQuery} from '../../../../graphQL/queries/trees/getTreeAttributesQuery';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {attributeToSelectedAttribute, isAttributeSelected, localizedTranslation} from '../../../../utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    GET_TREE_ATTRIBUTES_QUERY,
    GET_TREE_ATTRIBUTES_QUERYVariables,
    GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries
} from '../../../../_gqlTypes/GET_TREE_ATTRIBUTES_QUERY';
import ErrorDisplay from '../../../shared/ErrorDisplay';
import {AttributesSelectionListActionTypes} from '../../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../../reducer/attributesSelectionListStateContext';
import {DeployContent, ExpandButton, SmallText, StyledDeployContent, TextAttribute} from '../../sharedComponents';
import {ICommonAttributeComponentProps} from '../../_types';

const LibraryName = styled.div`
    font-weight: 300;
    opacity: 0.3;
    width: 100%;
    justify-content: space-around;
    display: flex;
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Container = styled.div`
    border: 1px solid #f0f0f0;
    border-radius: 2px;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 6px;

    & > * {
        padding: 0 6px;
    }
`;

interface ITreeLinkAttributeProps extends ICommonAttributeComponentProps {
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute;
}

function TreeLinkAttribute({attribute, depth, path, library}: ITreeLinkAttributeProps): JSX.Element {
    const [{lang}] = useLang();
    const {state, dispatch} = useAttributesSelectionListState();

    const [getLinkedAttributes, {called, loading, error, data}] = useLazyQuery<
        GET_TREE_ATTRIBUTES_QUERY,
        GET_TREE_ATTRIBUTES_QUERYVariables
    >(getTreeAttributesQuery, {
        variables: {
            treeId: attribute.linked_tree?.id ?? ''
        }
    });

    const treeLibraries: GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries[] = data?.trees?.list[0].libraries ?? [];

    const isAccordionActive = state.expandedAttributePath === attribute.id;

    const _handleChange = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: attributeToSelectedAttribute(attribute, {
                path,
                library
            })
        });
    };

    const _handleToggleAccordion = async () => {
        if (!called && !loading) {
            getLinkedAttributes({variables: {treeId: attribute.linked_tree?.id ?? ''}});
        }

        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_EXPAND,
            attributePath: attribute.id
        });
    };

    const label = localizedTranslation(attribute.label, lang);
    const isSelected = isAttributeSelected(path, state.selectedAttributes);

    return (
        <>
            <Wrapper>
                <Container>
                    <ExpandButton active={isAccordionActive} onToggleAccordion={_handleToggleAccordion} />
                    <TextAttribute>
                        {label ? (
                            <span>
                                {label}
                                <SmallText>{attribute.id}</SmallText>
                            </span>
                        ) : (
                            attribute.id
                        )}
                    </TextAttribute>

                    <IdcardOutlined style={{fontSize: '18px'}} />
                </Container>

                {state.multiple ? (
                    <Checkbox checked={isSelected} onChange={_handleChange} />
                ) : (
                    <Radio checked={isSelected} onChange={_handleChange} />
                )}
            </Wrapper>

            {loading ? (
                <Spin />
            ) : (
                <DeployContent active={isAccordionActive}>
                    <StyledDeployContent>
                        {error ? (
                            <ErrorDisplay message={error.message} />
                        ) : (
                            treeLibraries.map(treeLibrary => (
                                <div key={treeLibrary.library.id}>
                                    <LibraryName>
                                        {treeLibrary.library.label
                                            ? localizedTranslation(treeLibrary.library.label, lang)
                                            : treeLibrary.library.id}
                                    </LibraryName>
                                    <List>
                                        {treeLibrary.library.attributes &&
                                            treeLibrary.library.attributes
                                                // hide selected attributes
                                                // .filter(
                                                //     ta =>
                                                //         state.selectedAttributes
                                                //             .map(sa => sa.path)
                                                //             .indexOf(
                                                //                 `${attribute.id}.${treeLibrary.library.id}.${ta.id}`
                                                //             ) === -1
                                                // )
                                                .map(a => (
                                                    <Attribute
                                                        key={a.id}
                                                        attribute={a}
                                                        depth={depth + 1}
                                                        path={[path, treeLibrary.library.id].join('.')}
                                                        library={treeLibrary.library.id}
                                                        parentAttribute={attribute}
                                                    />
                                                ))}
                                    </List>
                                </div>
                            ))
                        )}
                    </StyledDeployContent>
                </DeployContent>
            )}
        </>
    );
}

export default TreeLinkAttribute;
