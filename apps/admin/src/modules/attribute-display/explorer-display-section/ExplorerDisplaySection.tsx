import {KitSelect} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    AttributeType,
    type AttributeDetailsLinkAttributeFragment,
    type AttributeDetailsTreeAttributeFragment,
    MultiDisplayOption,
} from '../../../_gqlTypes';
import {useSaveDisplayOption} from '../save-display-option/useSaveDisplayOption';
import {fullWidthField} from '../attributeDisplayTab.module.css';

/**
 * Displayed value when the attribute has nothing stored: this is already what the rendering falls back
 * to (see the `default:` branch of the `ExplorerV2` table cell switch).
 */
const DEFAULT_MULTI_DISPLAY_OPTION = MultiDisplayOption.avatar;

// A quantity badge does not make sense on a single value.
const MONO_DISPLAY_OPTIONS = [MultiDisplayOption.avatar, MultiDisplayOption.tag];

/**
 * `avatar` renders an identity card in mono-valued and a group of bare avatars in multi-valued: the
 * stored value is the same, only the label exposed to the admin changes.
 */
const _getOptionLabelKey = (option: MultiDisplayOption, multipleValues: boolean) =>
    option === MultiDisplayOption.avatar && !multipleValues
        ? 'attributes.multi_display_options.avatar_mono'
        : `attributes.multi_display_options.${option}`;

interface IExplorerDisplaySectionProps {
    attribute: AttributeDetailsLinkAttributeFragment | AttributeDetailsTreeAttributeFragment;
}

/**
 * How a link/tree value is rendered in the explorer's table cell. Field names stay `multi_*` even
 * though they now also apply to mono-valued attributes: renaming them would require an ArangoDB
 * migration for a purely cosmetic gain.
 */
export const ExplorerDisplaySection = ({attribute}: IExplorerDisplaySectionProps) => {
    const {t} = useTranslation();
    const isTree = attribute.type === AttributeType.tree;
    const field = isTree ? 'multi_tree_display_option' : 'multi_link_display_option';
    const storedOption =
        (isTree ? attribute.multi_tree_display_option : attribute.multi_link_display_option) ??
        DEFAULT_MULTI_DISPLAY_OPTION;
    const {saveDisplayOption, loading: savingDisplayOption} = useSaveDisplayOption(attribute.id, field);

    const [displayOption, setDisplayOption] = useState(storedOption);

    const _handleDisplayOptionChange = async (newDisplayOption: MultiDisplayOption) => {
        const previousDisplayOption = displayOption;

        setDisplayOption(newDisplayOption);

        if (!(await saveDisplayOption(newDisplayOption))) {
            setDisplayOption(previousDisplayOption);
        }
    };

    const availableOptions = attribute.multiple_values ? Object.values(MultiDisplayOption) : MONO_DISPLAY_OPTIONS;
    // `badge_qty` may already be stored on a mono-valued attribute (rendering then falls back to the
    // identity card): keep it selectable for this render so the select is not shown with a value
    // absent from its own options.
    const options = availableOptions.includes(displayOption) ? availableOptions : [...availableOptions, displayOption];

    return (
        <KitSelect
            className={fullWidthField}
            label={t('attributes.display.display_option')}
            value={displayOption}
            disabled={savingDisplayOption}
            options={options.map(option => ({
                value: option,
                label: t(_getOptionLabelKey(option, attribute.multiple_values)),
            }))}
            onChange={_handleDisplayOptionChange}
        />
    );
};
