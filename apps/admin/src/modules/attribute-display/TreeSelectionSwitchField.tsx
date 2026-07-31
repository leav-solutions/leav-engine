import {KitInputWrapper, KitSwitch, KitTypography} from 'aristid-ds';
import {switchField} from './attributeDisplayTab.module.css';

interface ITreeSelectionSwitchFieldProps {
    label: string;
    /** Text displayed next to the switch, reflecting the state it is currently in. */
    stateLabel: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

export const TreeSelectionSwitchField = ({
    label,
    stateLabel,
    checked,
    disabled,
    onChange,
}: ITreeSelectionSwitchFieldProps) => (
    <KitInputWrapper label={label}>
        <div className={switchField}>
            <KitSwitch checked={checked} disabled={disabled} onChange={onChange} aria-label={label} />
            <KitTypography.Text size="fontSize5" weight="medium">
                {stateLabel}
            </KitTypography.Text>
        </div>
    </KitInputWrapper>
);
