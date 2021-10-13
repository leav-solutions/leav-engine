// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IdcardOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Checkbox, List, Radio, Spin} from 'antd';
import React from 'react';
import styled from 'styled-components';
import Attribute from '..';
import {getAttributesByLibQuery} from '../../../../graphQL/queries/attributes/getAttributesByLib';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../themingVar';
import {attributeToSelectedAttribute, isAttributeSelected, localizedTranslation} from '../../../../utils';
import {
    GET_ATTRIBUTES_BY_LIB,
    GET_ATTRIBUTES_BY_LIBVariables,
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute
} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import ErrorDisplay from '../../../shared/ErrorDisplay';
import {AttributesSelectionListActionTypes} from '../../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../../reducer/attributesSelectionListStateContext';
import {DeployContent, ExpandButton, SmallText, StyledDeployContent, TextAttribute} from '../../sharedComponents';
import {ICommonAttributeComponentProps} from '../../_types';

interface IRecordLinkAttributeProps extends ICommonAttributeComponentProps {
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute;
}

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Container = styled.div`
    border: 1px solid ${themingVar['@divider-color']};
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

function RecordLinkAttribute({attribute, depth, path, library}: IRecordLinkAttributeProps): JSX.Element {
    const [{lang}] = useLang();
    const {state, dispatch} = useAttributesSelectionListState();
    const [getLinkedAttributes, {called, loading, error, data}] = useLazyQuery<
        GET_ATTRIBUTES_BY_LIB,
        GET_ATTRIBUTES_BY_LIBVariables
    >(getAttributesByLibQuery);

    const isSelected = isAttributeSelected(path, state.selectedAttributes);
    const isAccordionActive = state.expandedAttributePath.includes(path);
    const label = localizedTranslation(attribute.label, lang);
    const linkedLibrary = attribute.linked_library?.id ?? '';

    const linkedAttributes: GET_ATTRIBUTES_BY_LIB_attributes_list[] = data?.attributes?.list ?? [];

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
            getLinkedAttributes({variables: {library: linkedLibrary}});
        }

        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_EXPAND,
            attributePath: attribute.id
        });
    };

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
                <DeployContent active={!!isAccordionActive}>
                    <StyledDeployContent>
                        {error ? (
                            <ErrorDisplay message={error.message} />
                        ) : (
                            <List>
                                {linkedAttributes
                                    // hide selected attributes
                                    // .filter(
                                    //     la =>
                                    //         state.selectedAttributes.map(sa => sa.path).indexOf(`${path}.${la.id}`) ===
                                    //         -1
                                    // )
                                    .map(linkAttribute => (
                                        <Attribute
                                            key={linkAttribute.id}
                                            attribute={linkAttribute}
                                            depth={depth + 1}
                                            path={path}
                                            library={linkedLibrary}
                                            parentAttribute={attribute}
                                        />
                                    ))}
                            </List>
                        )}
                    </StyledDeployContent>
                </DeployContent>
            )}
        </>
    );
}

export default RecordLinkAttribute;
