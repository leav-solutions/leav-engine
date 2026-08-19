import {KitInputWrapper, KitSwitch, KitTypography} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    type AttributeDetailsLinkAttributeFragment,
    type AttributeDetailsStandardAttributeFragment,
    type AttributeDetailsTreeAttributeFragment,
} from '../../../_gqlTypes';
import {useSaveColumnSplit} from '../save-column-split/useSaveColumnSplit';
import {switchField} from '../attributeDisplayTab.module.css';

interface IColumnSplitFieldProps {
    attribute:
        | AttributeDetailsStandardAttributeFragment
        | AttributeDetailsLinkAttributeFragment
        | AttributeDetailsTreeAttributeFragment;
}

export const ColumnSplitField = ({attribute}: IColumnSplitFieldProps) => {
    const {t} = useTranslation();
    const {saveColumnSplit, loading: saving} = useSaveColumnSplit(attribute.id);

    const [checked, setChecked] = useState(Boolean(attribute.column_split_enabled));

    const _handleChange = async (newChecked: boolean) => {
        const previousChecked = checked;

        setChecked(newChecked);

        if (!(await saveColumnSplit(newChecked))) {
            setChecked(previousChecked);
        }
    };

    return (
        <KitInputWrapper
            label={t('attributes.display.column_split')}
            helper={t('attributes.display.column_split_helper')}
        >
            <div className={switchField}>
                <KitSwitch
                    checked={checked}
                    disabled={saving}
                    onChange={_handleChange}
                    aria-label={t('attributes.display.column_split')}
                />
                <KitTypography.Text size="fontSize5" weight="medium">
                    {t(checked ? 'admin.yes' : 'admin.no')}
                </KitTypography.Text>
            </div>
        </KitInputWrapper>
    );
};
