// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IdcardOutlined} from '@ant-design/icons';
import {Checkbox, Radio} from 'antd';
import React from 'react';
import {attributeUpdateSelection, localizedLabel} from '../../../utils';
import {IAttribute, IEmbeddedFields, ITreeData} from '../../../_types/types';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';
import {SmallText, TextAttribute, WrapperAttribute} from '../StyledComponents';

interface IAttributeBasicProps {
    attribute: IAttribute;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    embeddedField?: IEmbeddedFields;
    extendedPath?: string;
    depth: number;
    treeData?: ITreeData;
}

const AttributeBasic = ({
    attribute,
    stateListAttribute,
    dispatchListAttribute,
    embeddedField,
    extendedPath,
    depth,
    treeData
}: IAttributeBasicProps) => {
    const isChecked = stateListAttribute.attributesChecked.some(attributeChecked =>
        extendedPath
            ? attributeChecked?.extendedData?.path === extendedPath && attributeChecked?.checked
            : attributeChecked.id === attribute.id &&
              attributeChecked.library === attribute?.library &&
              attributeChecked?.checked
    );

    const id = embeddedField?.id ?? attribute.id;
    const label = embeddedField?.label ?? embeddedField?.id ? false : attribute.label;

    const handleClick = () => {
        const newAttributesChecked = attributeUpdateSelection({
            attribute,
            attributesChecked: stateListAttribute.attributesChecked,
            useCheckbox: !!stateListAttribute.useCheckbox,
            depth: depth ?? 0,
            extendedData:
                embeddedField && extendedPath ? {path: extendedPath, format: embeddedField.format} : undefined,
            treeData
        });

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: newAttributesChecked
        });
    };

    const handleRadioChange = () => {
        if (stateListAttribute.changeSelected) {
            stateListAttribute.changeSelected({id: attribute.id, library: attribute.library});
        }

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRIBUTE_SELECTED,
            attributeSelected: {
                id: attribute.id,
                library: attribute.library
            }
        });
    };

    return (
        <WrapperAttribute isChild={!!depth}>
            <TextAttribute>
                {stateListAttribute.lang && localizedLabel(label, stateListAttribute.lang) ? (
                    <span>
                        {localizedLabel(label, stateListAttribute.lang)} <SmallText>{id}</SmallText>
                    </span>
                ) : (
                    id
                )}
                <span style={{padding: '.3rem'}}>{attribute?.linkedLibrary && <IdcardOutlined />}</span>
            </TextAttribute>
            {stateListAttribute.useCheckbox && <Checkbox checked={isChecked} onChange={handleClick} />}

            {stateListAttribute.attributeSelected && (
                <Radio
                    checked={
                        stateListAttribute.attributeSelected.id === attribute.id &&
                        stateListAttribute.attributeSelected.library === attribute.library
                    }
                    onChange={handleRadioChange}
                />
            )}
        </WrapperAttribute>
    );
};

export default AttributeBasic;
