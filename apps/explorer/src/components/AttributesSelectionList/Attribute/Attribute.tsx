// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox, Radio, Space} from 'antd';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {attributeToSelectedAttribute, isAttributeSelected, localizedTranslation} from 'utils';
import {AttributesSelectionListActionTypes} from '../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../reducer/attributesSelectionListStateContext';
import {SmallText, TextAttribute} from '../sharedComponents';
import {ICommonAttributeComponentProps} from '../_types';

const Item = styled.div`
    padding: 0.5em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    cursor: pointer;
    border: 2px solid transparent;

    &:hover {
        border-color: ${themingVar['@primary-color']};
        background-color: ${themingVar['@leav-background-active']};
    }
`;

const CheckboxWrapper = styled.div`
    margin-left: 1em;
`;

function Attribute({attribute, depth, path, library, parentAttribute}: ICommonAttributeComponentProps): JSX.Element {
    const attributePath = [path, attribute.id].filter(p => !!p).join('.');
    const [{lang}] = useLang();
    const {state, dispatch} = useAttributesSelectionListState();

    const _handleClick = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: attributeToSelectedAttribute(attribute, {
                path: attributePath,
                library,
                parentAttributeData: parentAttribute
            })
        });
    };

    const label = localizedTranslation(attribute.label, lang);
    const isSelected = isAttributeSelected(attributePath, state.selectedAttributes);

    return (
        <Item onClick={_handleClick} data-testid="attribute-in-list">
            <Space>
                <TextAttribute>{label ?? attribute.id}</TextAttribute>
                {label && <SmallText>{attribute.id}</SmallText>}
            </Space>
            <CheckboxWrapper>
                {state.multiple ? (
                    <Checkbox checked={isSelected} onChange={_handleClick} />
                ) : (
                    <Radio checked={isSelected} onChange={_handleClick} />
                )}
            </CheckboxWrapper>
        </Item>
    );
}
export default Attribute;
