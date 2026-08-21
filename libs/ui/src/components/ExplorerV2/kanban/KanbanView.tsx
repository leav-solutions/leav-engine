import {useEffect, useMemo, useState} from 'react';
import {type CheckboxChangeEvent} from 'antd/es/checkbox';
import {createPortal} from 'react-dom';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {KitTypography} from 'aristid-ds';
import {Loading} from '_ui/components/Loading';
import {useDelayedLoading} from '_ui/hooks/useDelayedLoading';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useTreeNodeChildrenQuery} from '_ui/_gqlTypes';
import {type IDataViewChildProps, type IItemData} from '../_types';
import {buildKanbanColumns} from '../grouping/buildKanbanColumns';
import {type IKanbanAxisNode} from '../grouping/_types';
import {CARD_DRAG_ACTIVATION_DISTANCE} from '../_constants';
import {KanbanColumn} from './KanbanColumn';
import {KanbanCard, type IKanbanDragData} from './KanbanCard';
import {KanbanCardContent} from './KanbanCardContent';
import {type IKanbanColumnsData} from './_types';
import {assembleKanbanColumns} from './assembleKanbanColumns';
import {useKanbanTransitions} from './useKanbanTransitions';
import {useKanbanCardTransition} from './useKanbanCardTransition';
import {getDroppableColumnIds} from './getDroppableColumnIds';
import {applyKanbanMoveOverlay, pruneReconciledMoves, type KanbanMovesMap} from './applyKanbanMoveOverlay';
import {board, emptyColumn, dragOverlayCard} from './kanbanView.module.css';

type IKanbanViewProps = IDataViewChildProps & {groupByAttributeId?: string; kanbanColumns?: IKanbanColumnsData};

const NO_DROPPABLE_COLUMNS: ReadonlySet<string> = new Set();

/**
 * Kanban rendering. Pure renderer: the per-column data is loaded upstream in `Explorer.tsx` (so its
 * counts/keys feed the shared count + mass-selection wiring). Two data paths:
 * - with `kanbanColumns` (library entrypoint): per-column data loaded upstream, page by page
 *   ("Voir plus" at the end of a column) — no card is silently hidden;
 * - without it (link fallback): cards are distributed client-side from the globally-loaded set.
 *
 * Dragging a card to another column writes the new axis value. The workflow is enforced upfront:
 * while a drag is active, only the columns allowed from the card's current node are droppable
 * (`allowedDependentValues`), the others are visually disabled. The move is optimistic — the card
 * jumps immediately (local overlay); on the per-column path a successful write is reflected in the
 * column reducer (counts stay correct), on the link path the records subscription refetch reconciles
 * it. A refused write rolls back with an alert.
 */
export const KanbanView = ({
    dataGroupedFilteredSorted,
    attributesProperties,
    libraryColorConfigById,
    attributesToDisplay,
    itemActions,
    groupByAttributeId,
    kanbanColumns,
    selection: {onSelectItem, onSelectionChange, selectedKeys, isMassSelectionAll, mode},
}: IKanbanViewProps) => {
    const {t} = useSharedTranslation();
    const isPerColumn = kanbanColumns !== undefined;

    // Axis metadata (linked_tree, multiple_values) is read straight from the upstream-loaded map
    // (`useExplorerLibraryMetadata`, `Explorer.tsx`) — never derived from the records, so it is
    // available even for an empty board.
    const axisAttribute = groupByAttributeId ? attributesProperties[groupByAttributeId] : undefined;
    const treeId = axisAttribute && 'linked_tree' in axisAttribute ? (axisAttribute.linked_tree?.id ?? null) : null;
    const isAxisMultiple = axisAttribute?.multiple_values ?? false;

    const {data: treeData, loading: treeLoading} = useTreeNodeChildrenQuery({
        skip: !treeId,
        variables: {treeId: treeId ?? '', node: null},
    });

    const {
        isLoading: isTransitionsLoading,
        canEditAxisValues,
        transitionsByNodeId,
    } = useKanbanTransitions({
        attributeId: groupByAttributeId ?? '',
        skip: !groupByAttributeId || !treeId,
    });
    const {moveCard} = useKanbanCardTransition({groupByAttributeId: groupByAttributeId ?? ''});

    const {
        isInitialLoading = false,
        // While the board reloads (reset → fresh counts) the column states are wiped: without this flag
        // every column would claim "no records" (count 0) and flash the empty label — see KanbanColumn.
        isReloading: isBoardReloading = false,
        columnStatesById = {},
        loadMore,
        applyCardMove,
        markSelfWrite,
        clearSelfWrite,
        reloadColumns,
    } = kanbanColumns ?? {};

    const [activeDrag, setActiveDrag] = useState<IKanbanDragData | null>(null);
    const [optimisticMoves, setOptimisticMoves] = useState<KanbanMovesMap>(new Map());

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: CARD_DRAG_ACTIVATION_DISTANCE}}),
    );

    const axisNodes = useMemo<IKanbanAxisNode[]>(
        () =>
            (treeData?.treeNodeChildren?.list ?? []).map(node => ({
                recordId: node.record.id,
                nodeId: node.id,
                libraryId: node.record.whoAmI.library.id,
                label: node.record.whoAmI.label ?? node.record.id,
                color: node.record.whoAmI.color ?? null,
            })),
        [treeData],
    );

    const dataColumns = useMemo(() => {
        if (!groupByAttributeId) {
            return [];
        }

        return isPerColumn
            ? assembleKanbanColumns({
                  axisNodes,
                  columnStatesById,
                  noValueLabel: t('explorer.kanban.no-axis-value'),
              })
            : buildKanbanColumns({
                  records: dataGroupedFilteredSorted,
                  groupByAttributeId,
                  axisNodes,
                  noValueLabel: t('explorer.kanban.no-axis-value'),
              });
    }, [isPerColumn, columnStatesById, dataGroupedFilteredSorted, groupByAttributeId, axisNodes, t]);

    // Optimistic pipeline: as fresh data catches up (per-column reducer or link subscription), prune the
    // reconciled moves out of the state itself — not just at render — so `optimisticMoves` cannot grow
    // unbounded (one stale entry per successful drag) and stays reference-stable for the overlay memo.
    // pruneReconciledMoves returns the same map instance when nothing changed, so this bails out of a
    // re-render then; it depends on `dataColumns` only, so it cannot loop on its own state update.
    useEffect(() => {
        setOptimisticMoves(previousMoves => pruneReconciledMoves(dataColumns, previousMoves));
    }, [dataColumns]);

    const columns = useMemo(() => applyKanbanMoveOverlay(dataColumns, optimisticMoves), [dataColumns, optimisticMoves]);

    const droppableColumnIds = useMemo(
        () =>
            activeDrag
                ? getDroppableColumnIds({columns, sourceColumn: activeDrag.sourceColumn, transitionsByNodeId})
                : NO_DROPPABLE_COLUMNS,
        [activeDrag, columns, transitionsByNodeId],
    );

    // The card's displayed attributes are the visible display columns (the axis itself may be hidden).
    // Restricted to those whose properties are actually loaded: `attributesProperties` covers every
    // REAL attribute of the library, so this only guards against a stale attribute id left in the
    // view (e.g. a deleted attribute, a cloned view) — never against a load-order race, since
    // `Explorer.tsx` only mounts `DataView` once the metadata map has loaded.
    const cardAttributeIds = attributesToDisplay.filter(attributeId => attributesProperties[attributeId]);

    // Diagnostics: a missing id isn't always a stale one (deleted attribute, cloned view) — it can
    // also be a metadata query failure or a stale cache entry (see `useExplorerLibraryMetadata`),
    // both of which silently hide ALL card attributes rather than just one. Keyed on the id set (not
    // on `attributesProperties` itself) so this doesn't re-fire on every unrelated re-render.
    const missingAttributeIdsSignature = attributesToDisplay
        .filter(attributeId => !attributesProperties[attributeId])
        .join(',');
    useEffect(() => {
        if (missingAttributeIdsSignature) {
            console.warn(
                `[ExplorerV2] KanbanView: attribute id(s) not found in attributesProperties, hidden from cards: ${missingAttributeIdsSignature}`,
            );
        }
    }, [missingAttributeIdsSignature]);

    const onCardClickAction = itemActions.find(action => action.useItemActionOnRowClick && !action.disabled);

    // Per-card selection, mirroring the table view: "simple" mode keeps a single key, "multiple"
    // toggles it into/out of the current set. Disabled while a "select all" mass selection is active
    // (every card is then shown selected, read-only) or when selection is turned off.
    const isSelectionEnabled = onSelectionChange !== null && !isMassSelectionAll;
    const makeCardSelectHandler = (card: IItemData) => (event: CheckboxChangeEvent) => {
        const nextKeys =
            mode === 'simple'
                ? [card.key]
                : event.target.checked
                  ? [...selectedKeys, card.key]
                  : selectedKeys.filter(key => key !== card.key);

        onSelectionChange?.(nextKeys);

        if (event.target.checked) {
            onSelectItem?.(card);
        }
    };

    const isDragEnabled = canEditAxisValues && !isTransitionsLoading && !isAxisMultiple;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDrag((event.active.data.current as IKanbanDragData | undefined) ?? null);
    };

    const handleDragCancel = () => setActiveDrag(null);

    const handleDragEnd = async (event: DragEndEvent) => {
        const dragData = event.active.data.current as IKanbanDragData | undefined;
        setActiveDrag(null);

        const overId = event.over ? String(event.over.id) : null;
        if (!dragData || overId === null || !droppableColumnIds.has(overId)) {
            return;
        }
        const targetColumn = columns.find(col => col.id === overId);
        if (!targetColumn) {
            return;
        }

        const movedItemId = dragData.card.itemId;
        setOptimisticMoves(previousMoves => new Map(previousMoves).set(movedItemId, targetColumn.id));
        // Flagged before the write resolves so the recordUpdate subscription swallows its own echo
        // (which may arrive before the mutation promise settles) instead of reloading the whole board.
        markSelfWrite?.(movedItemId);

        const isMoved = await moveCard({card: dragData.card, targetColumn});
        if (!isMoved) {
            setOptimisticMoves(previousMoves => {
                const rolledBackMoves = new Map(previousMoves);
                rolledBackMoves.delete(movedItemId);
                return rolledBackMoves;
            });
            // The write was refused: no subscription echo will come, so drop the self-write flag and
            // snap just the two impacted columns back to the server truth (no full board reload).
            clearSelfWrite?.(movedItemId);
            reloadColumns?.([dragData.sourceColumn.id, targetColumn.id]);
            return;
        }

        // Per-column path: reflect the move in the reducer so cards and counts stay consistent (the
        // overlay is presentation-only). pruneReconciledMoves then drops the overlay entry. The link
        // path has no reducer — the records subscription refetch brings fresh data instead.
        if (isPerColumn) {
            applyCardMove?.({card: dragData.card, fromColumnId: dragData.sourceColumn.id, toColumnId: targetColumn.id});
        }
    };

    // First loading state: the columns themselves aren't ready (tree nodes + counts). Axis metadata
    // is not part of this gate: it comes from `attributesProperties`, already loaded before
    // `Explorer.tsx` mounts `DataView` at all. Delayed so a fast query never flashes a spinner, and —
    // since Explorer.tsx skips useExplorerData on the per-column path — so that a filter/search/sort
    // re-query shows a loader instead of a blank board.
    const isColumnsLoading = treeLoading || isInitialLoading;
    const isInitialLoaderVisible = useDelayedLoading(isColumnsLoading);

    if (isInitialLoaderVisible) {
        return <Loading />;
    }
    if (isColumnsLoading) {
        return null;
    }

    if (!groupByAttributeId || !treeId) {
        return (
            <div className={emptyColumn}>
                <KitTypography.Text>{t('explorer.kanban.no-axis-selected')}</KitTypography.Text>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
        >
            <div className={board}>
                {columns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        isBoardReloading={isBoardReloading}
                        isDropDisabled={activeDrag !== null && !droppableColumnIds.has(col.id)}
                        onLoadMore={loadMore}
                        renderCard={card => (
                            <KanbanCard
                                key={card.key}
                                card={card}
                                kanbanColumn={col}
                                cardAttributeIds={cardAttributeIds}
                                attributesProperties={attributesProperties}
                                libraryColorConfigById={libraryColorConfigById}
                                isDragEnabled={isDragEnabled}
                                isSelected={isMassSelectionAll || selectedKeys.includes(card.key)}
                                onSelect={isSelectionEnabled ? makeCardSelectHandler(card) : undefined}
                                onCardClick={onCardClickAction ? onCardClickAction.callback : undefined}
                            />
                        )}
                    />
                ))}
            </div>
            {createPortal(
                <DragOverlay>
                    {activeDrag ? (
                        <div className={dragOverlayCard}>
                            <KanbanCardContent
                                card={activeDrag.card}
                                cardAttributeIds={cardAttributeIds}
                                attributesProperties={attributesProperties}
                                libraryColorConfigById={libraryColorConfigById}
                                isSelected={isMassSelectionAll || selectedKeys.includes(activeDrag.card.key)}
                            />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body,
            )}
        </DndContext>
    );
};
