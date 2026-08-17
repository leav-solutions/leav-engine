import {KitButton, KitInput, KitModal, KitSpace} from 'aristid-ds';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useDuplicateAutomationRule} from './useDuplicateAutomationRule';

type DuplicateAutomationRuleModalProps = {
    /** The rule to duplicate, with its current name; `null` closes the modal. */
    rule: {id: string; label: string} | null;
    onClose: () => void;
    onDuplicated: (newRuleId: string) => void;
};

export const DuplicateAutomationRuleModal = ({rule, onClose, onDuplicated}: DuplicateAutomationRuleModalProps) => {
    const {t} = useTranslation();
    const {duplicateAutomationRule, loading} = useDuplicateAutomationRule();
    const [label, setLabel] = useState('');

    // Reset on every opening: the same modal instance serves every row of the list. Keyed on the
    // rule's own fields rather than the (inline, re-created-on-every-render) `rule` object or `t`,
    // so typing in the input isn't clobbered by an unrelated parent re-render.
    useEffect(() => {
        if (rule) {
            setLabel(t('automation.duplicate.default_name', {name: rule.label}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rule?.id, rule?.label]);

    if (!rule) {
        return null;
    }

    const trimmedLabel = label.trim();

    const handleConfirm = async () => {
        const newRuleId = await duplicateAutomationRule(rule.id, trimmedLabel);

        if (newRuleId !== null) {
            onDuplicated(newRuleId);
        }
    };

    return (
        <KitModal
            isOpen
            close={onClose}
            title={t('automation.duplicate.modal.title')}
            appElement={document.getElementById('root')}
            showCloseIcon
            destroyOnClose
            footer={
                <KitSpace direction="horizontal" size="xs">
                    <KitButton onClick={onClose}>{t('admin.cancel')}</KitButton>
                    <KitButton
                        type="primary"
                        onClick={handleConfirm}
                        loading={loading}
                        disabled={trimmedLabel === '' || loading}
                    >
                        {t('admin.confirm')}
                    </KitButton>
                </KitSpace>
            }
        >
            <KitInput
                label={t('automation.duplicate.modal.name_label')}
                helper={t('automation.duplicate.modal.info')}
                value={label}
                onChange={e => setLabel(e.target.value)}
                autoFocus
            />
        </KitModal>
    );
};
