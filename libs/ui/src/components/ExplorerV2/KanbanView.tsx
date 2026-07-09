import {type CSSProperties, type FunctionComponent, useMemo} from 'react';
import {KitItemCard, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type AttributePropertiesFragment, useTreeNodeChildrenQuery} from '_ui/_gqlTypes';
import {type IDataViewChildProps, type IItemData} from './_types';
import {TableCell} from './TableCell';
import {buildKanbanColumns, type IKanbanAxisNode} from './grouping/buildKanbanColumns';
import {
    board,
    column,
    columnHeader,
    colorDot,
    columnLabel,
    columnCount,
    columnBody,
    emptyColumn,
    clickableCard,
    cardNoImage,
    cardAttributes,
    cardAttributeRow,
    cardAttributeLabel,
} from './kanbanView.module.css';

type IKanbanViewProps = IDataViewChildProps & {groupByAttributeId?: string};

/** Reads the linked tree id off the axis attribute (only the TreeAttribute variant carries it). */
const getLinkedTreeId = (attribute: AttributePropertiesFragment | undefined): string | null =>
    attribute && 'linked_tree' in attribute ? (attribute.linked_tree?.id ?? null) : null;

/**
 * Kanban rendering (read-only, no drag & drop — that lands in PR-3). Columns are the root nodes of the
 * axis attribute's linked tree; cards are distributed client-side by their axis value. The whole filtered
 * set is expected to be loaded upstream (Explorer caps the kanban load), so grouping is exhaustive.
 */
export const KanbanView: FunctionComponent<IKanbanViewProps> = ({
    dataGroupedFilteredSorted,
    attributesProperties,
    attributesToDisplay,
    itemActions,
    groupByAttributeId,
}) => {
    const {t} = useSharedTranslation();

    const axisAttribute = groupByAttributeId
        ? (attributesProperties[groupByAttributeId] as AttributePropertiesFragment | undefined)
        : undefined;
    const treeId = getLinkedTreeId(axisAttribute);

    const {data: treeData, loading: treeLoading} = useTreeNodeChildrenQuery({
        skip: !treeId,
        variables: {treeId: treeId ?? '', node: null},
    });

    const axisNodes = useMemo<IKanbanAxisNode[]>(
        () =>
            (treeData?.treeNodeChildren?.list ?? []).map(node => ({
                recordId: node.record.id,
                label: node.record.whoAmI.label ?? node.record.id,
                color: node.record.whoAmI.color ?? null,
            })),
        [treeData],
    );

    const columns = useMemo(
        () =>
            groupByAttributeId
                ? buildKanbanColumns({
                      records: dataGroupedFilteredSorted,
                      groupByAttributeId,
                      axisNodes,
                      noValueLabel: t('explorer.kanban.no-axis-value'),
                  })
                : [],
        [dataGroupedFilteredSorted, groupByAttributeId, axisNodes, t],
    );

    // The card's displayed attributes are the visible display columns (the axis itself may be hidden).
    const cardAttributeIds = attributesToDisplay;

    const onCardClickAction = itemActions.find(action => action.useItemActionOnRowClick && !action.disabled);

    if (!groupByAttributeId || !treeId) {
        return (
            <div className={emptyColumn}>
                <KitTypography.Text>{t('explorer.kanban.no-axis-selected')}</KitTypography.Text>
            </div>
        );
    }

    if (treeLoading) {
        return null;
    }

    const renderCard = (card: IItemData) => {
        const previewSrc = (card.whoAmI.preview?.small as string) ?? undefined;
        const cardNode = (
            <KitItemCard
                display="card"
                title={card.whoAmI.label ?? card.whoAmI.id}
                description={card.whoAmI.subLabel ?? undefined}
                imageSrc={previewSrc}
                extra={
                    cardAttributeIds.length > 0 ? (
                        <div className={cardAttributes}>
                            {cardAttributeIds.map(attributeId => (
                                <div key={attributeId} className={cardAttributeRow}>
                                    <span className={cardAttributeLabel}>
                                        {attributesProperties[attributeId]?.label}
                                    </span>
                                    <TableCell
                                        attributeProperties={attributesProperties[attributeId]}
                                        values={card.propertiesById[attributeId]}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : undefined
                }
            />
        );

        const wrapperClassName = [previewSrc ? null : cardNoImage, onCardClickAction ? clickableCard : null]
            .filter(Boolean)
            .join(' ');

        // KitItemCard has no onClick prop, so opening a record is wired on a wrapping element.
        return onCardClickAction ? (
            <div
                key={card.key}
                className={wrapperClassName}
                role="button"
                tabIndex={0}
                onClick={() => onCardClickAction.callback(card)}
            >
                {cardNode}
            </div>
        ) : (
            <div key={card.key} className={wrapperClassName}>
                {cardNode}
            </div>
        );
    };

    return (
        <div className={board}>
            {columns.map(col => (
                <section key={col.id} className={column}>
                    <header className={columnHeader}>
                        <span className={colorDot} style={{'--dot-color': col.color ?? undefined} as CSSProperties} />
                        <span className={columnLabel}>{col.label}</span>
                        <span className={columnCount}>{col.cards.length}</span>
                    </header>
                    <div className={columnBody}>
                        {col.cards.length > 0 ? (
                            col.cards.map(renderCard)
                        ) : (
                            <div className={emptyColumn}>{t('explorer.kanban.empty-column')}</div>
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
};
