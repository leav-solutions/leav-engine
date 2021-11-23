// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IdcardOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Checkbox, List, Radio, Spin} from 'antd';
import React, {useState} from 'react';
import styled from 'styled-components';
import {getAttributeWithEmbeddedFields} from '../../../../graphQL/queries/attributes/getAttributeWithEmbeddedFields';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../themingVar';
import {attributeToSelectedAttribute, isAttributeSelected, localizedTranslation} from '../../../../utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {IEmbeddedFields} from '../../../../_types/types';
import ErrorDisplay from '../../../shared/ErrorDisplay';
import {AttributesSelectionListActionTypes} from '../../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../../reducer/attributesSelectionListStateContext';
import {DeployContent, ExpandButton, SmallText, StyledDeployContent, TextAttribute} from '../../sharedComponents';
import {ICommonAttributeComponentProps} from '../../_types';
import EmbeddedField from './EmbeddedField/EmbeddedField';

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

interface IExtendedAttributeProps extends ICommonAttributeComponentProps {
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute;
}

function ExtendedAttribute({attribute, depth = 0, path, library}: IExtendedAttributeProps): JSX.Element {
    const [{lang}] = useLang();
    const {state, dispatch} = useAttributesSelectionListState();

    const [embeddedFields, setEmbeddedFields] = useState<IEmbeddedFields[]>([]);

    const [getEmbeddedFields, {called, loading, error}] = useLazyQuery(getAttributeWithEmbeddedFields(15), {
        variables: {attributeId: attribute.id},
        onCompleted: data => {
            setEmbeddedFields(data?.attributes.list[0].embedded_fields ?? []);
        }
    });

    const isSelected = isAttributeSelected(path, state.selectedAttributes);
    const isAccordionActive = state.expandedAttributePath.indexOf(attribute.id) >= 0;

    const _handleToggleAccordion = async () => {
        if (!called && !loading) {
            getEmbeddedFields();
        }

        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_EXPAND,
            attributePath: attribute.id
        });
    };

    const _handleChange = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: attributeToSelectedAttribute(attribute, {
                path,
                library
            })
        });
    };

    const label = localizedTranslation(attribute.label, lang);

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
            <DeployContent active={isAccordionActive}>
                {loading && <Spin />}
                <StyledDeployContent>
                    {error ? (
                        <ErrorDisplay message={error.message} />
                    ) : (
                        <List>
                            {embeddedFields.map(f => (
                                <EmbeddedField
                                    attribute={attribute}
                                    field={f}
                                    depth={depth + 1}
                                    key={f.id}
                                    fieldPath={`${attribute.id}.${f.id}`}
                                    library={library}
                                />
                            ))}
                        </List>
                    )}
                </StyledDeployContent>
            </DeployContent>
        </>
    );
}

export default ExtendedAttribute;
