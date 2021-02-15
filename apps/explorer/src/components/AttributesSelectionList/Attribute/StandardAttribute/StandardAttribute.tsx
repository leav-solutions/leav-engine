// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox, Radio} from 'antd';
import React from 'react';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {attributeToSelectedAttribute, isAttributeSelected, localizedLabel} from '../../../../utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {AttributesSelectionListActionTypes} from '../../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../../reducer/attributesSelectionListStateContext';
import {SmallText, TextAttribute, WrapperAttribute} from '../../sharedComponents';
import {ICommonAttributeComponentProps} from '../../_types';

interface IStandardAttributeProps extends ICommonAttributeComponentProps {
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute;
}

const StandardAttribute = ({attribute, depth, path, parentAttribute, library}: IStandardAttributeProps) => {
    const [{lang}] = useLang();
    const {state, dispatch} = useAttributesSelectionListState();

    const _handleClick = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: attributeToSelectedAttribute(attribute, {
                path,
                library,
                parentAttributeData: parentAttribute
            })
        });
    };

    const label = localizedLabel(attribute.label, lang);
    const isSelected = isAttributeSelected(path, state.selectedAttributes);

    return (
        <WrapperAttribute isChild={!!depth}>
            <TextAttribute>
                {label ? (
                    <span>
                        {label} <SmallText>{attribute.id}</SmallText>
                    </span>
                ) : (
                    attribute.id
                )}
            </TextAttribute>
            {state.multiple ? (
                <Checkbox checked={isSelected} onChange={_handleClick} />
            ) : (
                <Radio checked={isSelected} onChange={_handleClick} />
            )}
        </WrapperAttribute>
    );
};

export default StandardAttribute;
