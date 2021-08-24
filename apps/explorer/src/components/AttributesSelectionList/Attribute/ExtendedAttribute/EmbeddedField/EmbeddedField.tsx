// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox, List, Radio} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {useLang} from '../../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../../themingVar';
import {attributeToSelectedAttribute, isAttributeSelected, localizedTranslation} from '../../../../../utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '../../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {IEmbeddedFields} from '../../../../../_types/types';
import {AttributesSelectionListActionTypes} from '../../../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../../../reducer/attributesSelectionListStateContext';
import {
    DeployContent,
    ExpandButton,
    SmallText,
    StyledDeployContent,
    TextAttribute,
    WrapperAttribute
} from '../../../sharedComponents';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
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

interface IEmbeddedFieldProps {
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute;
    library: string;
    field: IEmbeddedFields;
    fieldPath: string;
    depth: number;
}

const EmbeddedField = ({attribute, field, fieldPath, depth, library}: IEmbeddedFieldProps): JSX.Element => {
    const [{lang}] = useLang();
    const id = field.id;
    const label = localizedTranslation(field.label, lang);
    const {state, dispatch} = useAttributesSelectionListState();

    const isAccordionActive = state.expandedAttributePath === fieldPath;

    const _handleChange = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: attributeToSelectedAttribute(attribute, {
                path: fieldPath,
                library,
                embeddedFieldData: field
            })
        });
    };

    const _handleToggleAccordion = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_EXPAND,
            attributePath: fieldPath
        });
    };

    const isSelected = isAttributeSelected(fieldPath, state.selectedAttributes);

    return (
        <>
            {field?.embedded_fields?.length ? (
                <>
                    <Wrapper>
                        <Container>
                            <ExpandButton active={isAccordionActive} onToggleAccordion={_handleToggleAccordion} />
                            <TextAttribute>
                                {label ? (
                                    <span>
                                        {label}
                                        <SmallText>{id}</SmallText>
                                    </span>
                                ) : (
                                    id
                                )}
                            </TextAttribute>
                        </Container>
                    </Wrapper>
                    <DeployContent active={isAccordionActive}>
                        <StyledDeployContent>
                            <List>
                                {(field.embedded_fields ?? []).map(embeddedField => (
                                    <span data-testid="embedded-field" key={embeddedField.id}>
                                        <EmbeddedField
                                            attribute={attribute}
                                            field={embeddedField}
                                            fieldPath={`${fieldPath}.${embeddedField.id}`}
                                            depth={depth + 1}
                                            library={library}
                                        />
                                    </span>
                                ))}
                            </List>
                        </StyledDeployContent>
                    </DeployContent>
                </>
            ) : (
                <>
                    <WrapperAttribute isChild={!!depth}>
                        <TextAttribute>
                            {label ? (
                                <span>
                                    {label}
                                    <SmallText>{field.id}</SmallText>
                                </span>
                            ) : (
                                field.id
                            )}
                        </TextAttribute>
                        {state.multiple ? (
                            <Checkbox checked={isSelected} onChange={_handleChange} />
                        ) : (
                            <Radio checked={isSelected} onChange={_handleChange} />
                        )}
                    </WrapperAttribute>
                </>
            )}
        </>
    );
};

export default EmbeddedField;
