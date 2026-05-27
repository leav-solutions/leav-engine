import {KitBadge, KitButton, KitCollapse, KitIdCard, KitSpace, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDown, faArrowUp, faTrash} from '@fortawesome/free-solid-svg-icons';
import {getUiOptions, type ArrayFieldItemTemplateProps} from '@rjsf/utils';
import {useTranslation} from 'react-i18next';
import {useConfirmModal} from '_ui/hooks/useConfirmModal';
import {type AutomationFormContext} from '../../types';
import {arrayFieldItemTemplate} from './arrayFieldItemTemplate.module.css';

export const ArrayFieldItemTemplate = ({
    children,
    buttonsProps,
    index,
    registry,
    parentUiSchema,
}: ArrayFieldItemTemplateProps) => {
    const {t} = useTranslation();
    const {openConfirmModal} = useConfirmModal();

    const {hasMoveUp, hasMoveDown, hasRemove, onMoveUpItem, onMoveDownItem, onRemoveItem} = buttonsProps;

    const handleRemoveItem = () => {
        openConfirmModal({
            title: t('automation.form.pipeline.delete_action_confirm.title'),
            content: t('automation.form.pipeline.delete_action_confirm.content'),
            onOk: onRemoveItem,
            dangerConfirm: true,
        });
    };

    const formContext = registry.formContext as AutomationFormContext | undefined;
    const step = formContext?.pipelineStepsData?.[index];

    const {moveUpLabel, moveDownLabel, deleteLabel, actionTypeLabels} = getUiOptions(parentUiSchema) as {
        moveUpLabel?: string;
        moveDownLabel?: string;
        deleteLabel?: string;
        actionTypeLabels?: Record<string, string>;
    };

    return (
        <KitCollapse
            className={arrayFieldItemTemplate}
            defaultActiveKey={1}
            items={[
                {
                    key: 1,
                    label: (
                        <KitSpace direction="horizontal" size="s">
                            <KitBadge count={index + 1} color="primary" />
                            <KitIdCard title={actionTypeLabels?.[step?.type] ?? step?.type} size="xs-bold" />
                        </KitSpace>
                    ),
                    extra: (
                        <KitSpace direction="horizontal" size="xs" onClick={e => e.stopPropagation()}>
                            {hasMoveDown && (
                                <KitTooltip title={moveDownLabel}>
                                    <KitButton
                                        type="secondary"
                                        size="m"
                                        icon={<FontAwesomeIcon icon={faArrowDown} />}
                                        onClick={onMoveDownItem}
                                    />
                                </KitTooltip>
                            )}
                            {hasMoveUp && (
                                <KitTooltip title={moveUpLabel}>
                                    <KitButton
                                        type="secondary"
                                        size="m"
                                        icon={<FontAwesomeIcon icon={faArrowUp} />}
                                        onClick={onMoveUpItem}
                                    />
                                </KitTooltip>
                            )}
                            {hasRemove && (
                                <KitTooltip title={deleteLabel}>
                                    <KitButton
                                        type="secondary"
                                        size="m"
                                        danger
                                        icon={<FontAwesomeIcon icon={faTrash} />}
                                        onClick={handleRemoveItem}
                                    />
                                </KitTooltip>
                            )}
                        </KitSpace>
                    ),
                    children,
                },
            ]}
        />
    );
};
