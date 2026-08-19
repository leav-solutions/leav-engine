import {useTranslation} from 'react-i18next';
import {
    AttributeType,
    type AttributeDetailsLinkAttributeFragment,
    type AttributeDetailsStandardAttributeFragment,
    type AttributeDetailsTreeAttributeFragment,
} from '../../_gqlTypes';
import {DisplaySection} from './DisplaySection';
import {ColumnSplitField} from './explorer-display-section/ColumnSplitField';
import {ExplorerDisplaySection} from './explorer-display-section/ExplorerDisplaySection';
import {isColumnSplitEligible} from './isColumnSplitEligible';
import {TreeFormSection} from './tree-form-section/TreeFormSection';
import {useTreeAttributeV2Flags} from './useTreeAttributeV2Flags';
import {displayTab} from './attributeDisplayTab.module.css';

type LinkOrTreeAttribute = AttributeDetailsLinkAttributeFragment | AttributeDetailsTreeAttributeFragment;

type DisplayTabAttribute = AttributeDetailsStandardAttributeFragment | LinkOrTreeAttribute;

interface IAttributeDisplayTabProps {
    attribute: DisplayTabAttribute;
}

/**
 * Display tab of an attribute, in two sections: how the values are rendered in the explorer
 * (link/tree display option, and the explorer column split — open to a tree attribute or any
 * attribute with a closed values list), and (tree only) how a node is picked in a form. The Form
 * section only makes sense behind the V2 flags, the Explorer one applies whatever the flags are.
 */
export const AttributeDisplayTab = ({attribute}: IAttributeDisplayTabProps) => {
    const {t} = useTranslation();
    const {isFormV2Enabled, isModalV2Enabled} = useTreeAttributeV2Flags();
    const isLinkOrTree = [AttributeType.tree, AttributeType.simple_link, AttributeType.advanced_link].includes(
        attribute.type,
    );

    return (
        <div className={displayTab}>
            <DisplaySection title={t('attributes.display.section_explorer')}>
                {isLinkOrTree && <ExplorerDisplaySection attribute={attribute as LinkOrTreeAttribute} />}
                {isColumnSplitEligible(attribute) && <ColumnSplitField attribute={attribute} />}
            </DisplaySection>
            {attribute.type === AttributeType.tree && (isFormV2Enabled || isModalV2Enabled) && (
                <DisplaySection title={t('attributes.display.section_form')}>
                    <TreeFormSection attribute={attribute as AttributeDetailsTreeAttributeFragment} />
                </DisplaySection>
            )}
        </div>
    );
};
