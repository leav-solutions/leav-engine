import React from 'react';
import {Checkbox, Icon, Radio} from 'semantic-ui-react';
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
    depth?: number;
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
            stateListAttribute.changeSelected(attribute.id);
        }
    };

    return (
        <WrapperAttribute>
            <TextAttribute>
                {stateListAttribute.lang && localizedLabel(label, stateListAttribute.lang) ? (
                    <span>
                        {localizedLabel(label, stateListAttribute.lang)} <SmallText>{id}</SmallText>
                    </span>
                ) : (
                    id
                )}
                <span>{attribute?.linkedLibrary && <Icon name="linkify" />}</span>
            </TextAttribute>
            {stateListAttribute.useCheckbox && <Checkbox checked={isChecked} onChange={handleClick} />}

            {stateListAttribute.attributeSelection && (
                <Radio checked={stateListAttribute.attributeSelection === attribute.id} onChange={handleRadioChange} />
            )}
        </WrapperAttribute>
    );
};

export default AttributeBasic;
