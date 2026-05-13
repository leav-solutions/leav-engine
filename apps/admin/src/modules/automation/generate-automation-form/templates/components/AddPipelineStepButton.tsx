// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {KitButton, KitDropDown, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';
import {type AutomationRuleActions} from '../../../../../_gqlTypes';

type ActionTypeItem = {value: AutomationRuleActions; label: string};

type AddPipelineStepButtonProps = {
    actionTypes: ActionTypeItem[];
    onAdd: (actionType: AutomationRuleActions) => void;
    addLabel?: string;
};

export const AddPipelineStepButton = ({actionTypes, onAdd, addLabel}: AddPipelineStepButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        // Ant Design Collapse toggles on any click reaching .ant-collapse-header; stopPropagation follows the same pattern as KitCollapse internal sub-components (HeaderSwitch, HeaderExtra)
        <div onClick={e => e.stopPropagation()}>
            <KitDropDown
                menu={{
                    items: actionTypes.map(({value, label}) => ({
                        key: value,
                        label,
                        onClick: () => onAdd(value),
                    })),
                }}
                onOpenChange={setIsOpen}
                open={isOpen}
                trigger={['click']}
                getPopupContainer={triggerNode => triggerNode.parentElement ?? document.body}
                placement="bottomRight"
            >
                <KitTooltip title={addLabel} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
                    <KitButton type="secondary" icon={<FontAwesomeIcon icon={faPlus} />} active={isOpen} />
                </KitTooltip>
            </KitDropDown>
        </div>
    );
};
