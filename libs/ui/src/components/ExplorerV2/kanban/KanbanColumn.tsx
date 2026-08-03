import {type CSSProperties, type ReactNode} from 'react';
import {useDroppable} from '@dnd-kit/core';
import {KitButton} from 'aristid-ds';
import {Loading} from '_ui/components/Loading';
import {useDelayedLoading} from '_ui/hooks/useDelayedLoading';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IItemData} from '../_types';
import {type IKanbanColumn} from '../grouping/_types';
import {
    column as columnClass,
    columnHeader,
    colorDot,
    columnLabel,
    columnCount,
    columnBody,
    columnDropDisabled,
    columnDropTarget,
    emptyColumn,
    loadMoreButton,
} from './kanbanView.module.css';

interface IKanbanColumnProps {
    column: IKanbanColumn;
    renderCard: (card: IItemData) => ReactNode;
    // Optional: only the per-column path loads pages ("Voir plus"). The link fallback has the whole set
    // upfront (count === cards.length) so the button never shows and no handler is needed.
    onLoadMore?: (columnId: string) => void;
    /** True while a drag is active and this column is not an allowed workflow target — visually disabled. */
    isDropDisabled: boolean;
    /**
     * True while the whole board reloads (reset → fresh counts, e.g. on an external record update): the
     * column state is wiped then, so its `count: 0` must read as "not known yet" (loader), not as a
     * settled "no records" (empty label). Per-column path only.
     */
    isBoardReloading?: boolean;
}

/**
 * A single kanban column. Two responsibilities merged here:
 * - **Drop target** (`useDroppable`): a dragged card may be dropped on it unless the workflow forbids the
 *   transition (`isDropDisabled` → greyed out, drop ignored).
 * - **Per-column pagination**: owns its own delayed loading (`useDelayedLoading`) so each column flickers
 *   independently — the body loader while the first page is still coming, the "Voir plus" button loader
 *   while a further page loads. Both driven by `isLoadingMore` but debounced, so a fast page never flashes.
 */
export const KanbanColumn = ({
    column,
    renderCard,
    onLoadMore,
    isDropDisabled,
    isBoardReloading = false,
}: IKanbanColumnProps) => {
    const {t} = useSharedTranslation();
    const {setNodeRef, isOver} = useDroppable({id: column.id, disabled: isDropDisabled});
    const isColumnLoaderVisible = useDelayedLoading(column.isLoadingMore || isBoardReloading);

    const hasCards = column.cards.length > 0;
    // isExhausted guards the count comparison: with a search active the count is inflated (it ignores
    // the search, V1), so without it "Voir plus" would survive as a dead button once the last
    // (search-narrowed) page came back short.
    const hasMoreToLoad = column.cards.length < column.count && !column.isExhausted;

    const sectionClassName = [
        columnClass,
        isDropDisabled ? columnDropDisabled : null,
        isOver && !isDropDisabled ? columnDropTarget : null,
    ]
        .filter((className): className is NonNullable<typeof className> => className !== null)
        .join(' ');

    const renderBody = (): ReactNode => {
        if (hasCards) {
            return column.cards.map(renderCard);
        }

        // No cards yet: the first page is still loading (count > 0), or the whole board is reloading
        // (the wiped state reads count 0 without meaning it) — only a settled empty column may say so.
        if (column.count > 0 || isBoardReloading) {
            return isColumnLoaderVisible ? (
                <div className={emptyColumn}>
                    <Loading compact />
                </div>
            ) : null;
        }

        return <div className={emptyColumn}>{t('explorer.kanban.empty-column')}</div>;
    };

    return (
        <section ref={setNodeRef} className={sectionClassName}>
            <header className={columnHeader}>
                <span className={colorDot} style={{'--dot-color': column.color ?? undefined} as CSSProperties} />
                <span className={columnLabel}>{column.label}</span>
                <span className={columnCount}>{column.count}</span>
            </header>
            <div className={columnBody}>
                {renderBody()}
                {hasCards && hasMoreToLoad && (
                    <KitButton
                        className={loadMoreButton}
                        type="secondary"
                        loading={isColumnLoaderVisible}
                        onClick={() => onLoadMore?.(column.id)}
                    >
                        {t('explorer.kanban.load-more')}
                    </KitButton>
                )}
            </div>
        </section>
    );
};
