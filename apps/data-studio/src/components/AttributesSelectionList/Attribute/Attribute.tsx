// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars, useLang} from '@leav/ui';
import {Checkbox, Radio, Space} from 'antd';
import styled from 'styled-components';
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
        border-color: ${themeVars.primaryColor};
        background-color: ${themeVars.activeColor};
    }
`;

const CheckboxWrapper = styled.div`
    margin-left: 1em;
`;

function Attribute({attribute, depth, path, library, parentAttribute}: ICommonAttributeComponentProps): JSX.Element {
    const attributePath = [path, attribute.id].filter(p => !!p).join('.');
    const {lang} = useLang();
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
                {state.multiple ? <Checkbox checked={isSelected} /> : <Radio checked={isSelected} />}
            </CheckboxWrapper>
        </Item>
    );
}

export default Attribute;
