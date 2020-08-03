import React from 'react';
import {Checkbox, Icon, Radio} from 'semantic-ui-react';
import {localizedLabel} from '../../../utils';
import {IAttribute, IEmbeddedFields, IExtendedData} from '../../../_types/types';
import {ListAttributeReducerAction, ListAttributeState} from '../ListAttributesReducer';
import {SmallText, Text, Wrapper} from '../StyledComponents';

interface IAttributeBasicProps {
    attribute: IAttribute;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    handleCheckboxChange: (extendedData?: IExtendedData) => void;
    handleRadioChange: () => void;
    embeddedField?: IEmbeddedFields;
    extendedPath?: string;
}

const AttributeBasic = ({
    attribute,
    stateListAttribute,
    handleCheckboxChange,
    handleRadioChange,
    embeddedField,
    extendedPath
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

    return (
        <Wrapper>
            <Text>
                {stateListAttribute.lang && localizedLabel(label, stateListAttribute.lang) ? (
                    <span>
                        {localizedLabel(label, stateListAttribute.lang)} <SmallText>{id}</SmallText>
                    </span>
                ) : (
                    id
                )}
                <span>{attribute?.linkedLibrary && <Icon name="linkify" />}</span>
            </Text>
            {stateListAttribute.useCheckbox && (
                <Checkbox
                    checked={isChecked}
                    onChange={(event, data) =>
                        handleCheckboxChange(
                            embeddedField && extendedPath
                                ? {path: extendedPath, format: embeddedField.format}
                                : undefined
                        )
                    }
                />
            )}

            {stateListAttribute.attributeSelection && (
                <Radio checked={stateListAttribute.attributeSelection === attribute.id} onChange={handleRadioChange} />
            )}
        </Wrapper>
    );
};

export default AttributeBasic;
