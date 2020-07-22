import React from 'react';
import {Checkbox, Icon, Radio} from 'semantic-ui-react';
import {localizedLabel} from '../../../utils';
import {IAttribute, IAttributesChecked} from '../../../_types/types';
import {ListAttributeReducerAction, ListAttributeState} from '../ListAttributesReducer';
import {SmallText, Text, Wrapper} from '../StyledComponents';

interface IListItemAttributeProps {
    attribute: IAttribute;
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
    attributeChecked?: IAttributesChecked;
    handleCheckboxChange: (newChecked: boolean) => void;
    handleRadioChange: () => void;
}

const ListItemAttribute = ({
    attribute,
    stateListAttribute,
    dispatchListAttribute,
    attributeChecked,
    handleCheckboxChange,
    handleRadioChange
}: IListItemAttributeProps) => {
    return (
        <Wrapper>
            <Text>
                {stateListAttribute.lang && localizedLabel(attribute.label, stateListAttribute.lang) ? (
                    <span>
                        {localizedLabel(attribute.label, stateListAttribute.lang)} <SmallText>{attribute.id}</SmallText>
                    </span>
                ) : (
                    attribute.id
                )}
                <span>{attribute.linkedLibrary && <Icon name="linkify" />}</span>
            </Text>
            {stateListAttribute.useCheckbox && (
                <Checkbox
                    checked={attributeChecked?.checked}
                    onChange={(event, data) => handleCheckboxChange(data.checked ?? false)}
                />
            )}

            {stateListAttribute.attributeSelection && (
                <Radio checked={stateListAttribute.attributeSelection === attribute.id} onChange={handleRadioChange} />
            )}
        </Wrapper>
    );
};

export default ListItemAttribute;
