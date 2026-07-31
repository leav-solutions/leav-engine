import {useTranslation} from 'react-i18next';
import {
    AttributeType,
    type AttributeDetailsLinkAttributeFragment,
    type AttributeDetailsTreeAttributeFragment,
} from '../../_gqlTypes';
import {DisplaySection} from './DisplaySection';
import {ExplorerDisplaySection} from './explorer-display-section/ExplorerDisplaySection';
import {TreeFormSection} from './tree-form-section/TreeFormSection';
import {useTreeAttributeV2Flags} from './useTreeAttributeV2Flags';
import {displayTab} from './attributeDisplayTab.module.css';

interface IAttributeDisplayTabProps {
    attribute: AttributeDetailsLinkAttributeFragment | AttributeDetailsTreeAttributeFragment;
}

/**
 * Display tab of a link/tree attribute, in two sections: how the values are rendered in the
 * explorer, and (tree only) how a node is picked in a form. The Form section only makes sense
 * behind the V2 flags, the Explorer one applies whatever the flags are, to any cardinality.
 */
export const AttributeDisplayTab = ({attribute}: IAttributeDisplayTabProps) => {
    const {t} = useTranslation();
    const {isFormV2Enabled, isModalV2Enabled} = useTreeAttributeV2Flags();

    return (
        <div className={displayTab}>
            <DisplaySection title={t('attributes.display.section_explorer')}>
                <ExplorerDisplaySection attribute={attribute} />
            </DisplaySection>
            {attribute.type === AttributeType.tree && (isFormV2Enabled || isModalV2Enabled) && (
                <DisplaySection title={t('attributes.display.section_form')}>
                    <TreeFormSection attribute={attribute as AttributeDetailsTreeAttributeFragment} />
                </DisplaySection>
            )}
        </div>
    );
};
