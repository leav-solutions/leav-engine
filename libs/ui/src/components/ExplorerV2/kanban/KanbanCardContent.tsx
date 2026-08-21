import {type CheckboxChangeEvent} from 'antd/es/checkbox';
import {KitItemCard} from 'aristid-ds';
import {type IDataViewChildProps, type IItemData} from '../_types';
import {TableCell} from '../cells/TableCell';
import {cardAttributes, cardAttributeRow, cardAttributeLabel} from './kanbanView.module.css';

interface IKanbanCardContentProps {
    card: IItemData;
    cardAttributeIds: string[];
    attributesProperties: IDataViewChildProps['attributesProperties'];
    libraryColorConfigById: IDataViewChildProps['libraryColorConfigById'];
    isSelected?: boolean;
    onSelect?: (event: CheckboxChangeEvent) => void;
}

/**
 * Pure presentation of a kanban card: the record's identity card plus its configured attributes.
 * Shared between the in-column card and the drag overlay clone, so both always look identical.
 * The selection checkbox (`onSelect`) is omitted on the drag overlay clone.
 */
export const KanbanCardContent = ({
    card,
    cardAttributeIds,
    attributesProperties,
    libraryColorConfigById,
    isSelected = false,
    onSelect,
}: IKanbanCardContentProps) => {
    const previewSrc = (card.whoAmI.preview?.small as string) ?? undefined;

    return (
        <KitItemCard
            display="card"
            title={card.whoAmI.label ?? card.whoAmI.id}
            description={card.whoAmI.subLabel ?? undefined}
            imageSrc={previewSrc}
            selected={isSelected}
            onSelect={onSelect}
            extra={
                cardAttributeIds.length > 0 ? (
                    <div className={cardAttributes}>
                        {cardAttributeIds.map(attributeId => (
                            <div key={attributeId} className={cardAttributeRow}>
                                <span className={cardAttributeLabel}>{attributesProperties[attributeId]?.label}</span>
                                <TableCell
                                    attributeProperties={attributesProperties[attributeId]}
                                    values={card.propertiesById[attributeId]}
                                    libraryColorConfigById={libraryColorConfigById}
                                />
                            </div>
                        ))}
                    </div>
                ) : undefined
            }
        />
    );
};
