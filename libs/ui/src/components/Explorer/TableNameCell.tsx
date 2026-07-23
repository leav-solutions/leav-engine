import {IdCard} from './IdCard';
import {type IItemAction, type IItemData} from './_types';
import {cloneElement, useRef} from 'react';
import {KitButton, KitDropDown, KitTooltip} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {faEllipsisH} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const StyledTableNameCellContainer = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 100%;
`;

const StyledActionsList = styled.div`
    /* Action are displayed when the user hover the table row (CSS in DataView.tsx) */
    display: none;
    gap: calc(var(--general-spacing-xxs) * 1px);
        transition:
        display 0.2s ease-in-out,
    align-items: center;
    justify-content: center;
    margin-left: calc(var(--general-spacing-xs) * 1px);
`;

type ResolvedItemActionProp<T> = T extends (item: IItemData) => infer R ? R : T;

const resolveItemActionProp = <T extends IItemAction[keyof IItemAction]>(
    itemData: IItemData,
    itemActionProp: T,
): ResolvedItemActionProp<T> =>
    (typeof itemActionProp === 'function' ? itemActionProp(itemData) : itemActionProp) as ResolvedItemActionProp<T>;

interface ITableNameCellProps {
    item: IItemData;
    itemActions: IItemAction[];
}

export const TableNameCell = ({item, itemActions}: ITableNameCellProps) => {
    const {t} = useSharedTranslation();
    const containerRef = useRef<HTMLDivElement>(null);

    const itemActionsWithCallback = itemActions.map(action => ({
        ...action,
        callback: () => action.callback(item),
    }));

    const isMoreThanThreeActions = itemActionsWithCallback.length > 3;

    const itemsActionsWithCallbackToDisplay = isMoreThanThreeActions
        ? itemActionsWithCallback.slice(0, 2)
        : itemActionsWithCallback;

    const _handleButtonClick = (event: MouseEvent, callback: () => void) => {
        // Stop event propagation to avoid the row click event to be triggered
        event.stopPropagation();
        callback();
    };

    return (
        <StyledTableNameCellContainer ref={containerRef}>
            <IdCard item={item.whoAmI} />
            <StyledActionsList className="actions-list">
                {itemsActionsWithCallbackToDisplay.map(
                    ({label, icon, isDanger, callback, disabled, useItemDeletePermission}, actionIndex) => {
                        const disabledButton = useItemDeletePermission
                            ? !item.canDelete
                            : resolveItemActionProp(item, disabled);

                        return (
                            <KitTooltip key={actionIndex} title={resolveItemActionProp(item, label)}>
                                <KitButton
                                    size="m"
                                    aria-label={resolveItemActionProp(item, label)}
                                    icon={resolveItemActionProp(item, icon)}
                                    onClick={event => _handleButtonClick(event, callback)}
                                    danger={resolveItemActionProp(item, isDanger)}
                                    disabled={disabledButton}
                                />
                            </KitTooltip>
                        );
                    },
                )}
                {isMoreThanThreeActions && (
                    <KitDropDown
                        placement="bottomRight"
                        getPopupContainer={() => containerRef.current || document.body}
                        destroyOnHidden={true}
                        menu={{
                            items: itemActionsWithCallback
                                .slice(2)
                                .map(({callback, icon, label, isDanger, disabled}) => ({
                                    key: resolveItemActionProp(item, label),
                                    danger: resolveItemActionProp(item, isDanger),
                                    disabled: resolveItemActionProp(item, disabled),
                                    label: resolveItemActionProp(item, label),
                                    icon: icon
                                        ? cloneElement(resolveItemActionProp(item, icon), {
                                              size: '2em',
                                          })
                                        : null, // TODO: find better tuning
                                    onClick: callback,
                                })),
                        }}
                    >
                        <KitTooltip title={t('explorer.more-actions')}>
                            <KitButton
                                size="m"
                                aria-label={t('explorer.more-actions') ?? undefined}
                                icon={<FontAwesomeIcon icon={faEllipsisH} />}
                                onClick={event => event.stopPropagation()}
                            />
                        </KitTooltip>
                    </KitDropDown>
                )}
            </StyledActionsList>
        </StyledTableNameCellContainer>
    );
};
