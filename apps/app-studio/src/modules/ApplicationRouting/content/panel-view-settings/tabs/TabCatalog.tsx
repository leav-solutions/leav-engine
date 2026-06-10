import {useLang, usePanelEventHandlers} from '@leav/ui';
import {KitAlert, KitBadge, KitItemList, KitSpace, KitTag, KitTypography} from 'aristid-ds';
import {type IKitActionButton} from 'aristid-ds/dist/Kit/DataDisplay/types';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBookmark, faCopy} from '@fortawesome/free-solid-svg-icons';
import {localizedTranslation} from '@leav/utils';
import {INFO_NOTIFICATION_DURATION} from '_ui/constants';
import cn from 'classnames';
import {type AppStudioInternalEvent} from '../../../types';
import {type View, useViewCatalog} from './useViewCatalog';
import {
    emptyBadge,
    emptyBox,
    heading,
    iconBox,
    isCurrentView,
    primaryIcon,
    sectionTitle,
    viewItem,
} from './tabCatalog.module.css';

export const TabCatalog = ({viewId, libraryId}: {viewId: string; libraryId: string}) => {
    const {t} = useTranslation();
    const {lang} = useLang();

    const {myViews, sharedViews} = useViewCatalog(libraryId);

    // TODO: save the last choice of the user, using user data mutation and query to read last view
    const {dispatch} = usePanelEventHandlers<AppStudioInternalEvent>();

    // The view id is only useful once the view is shared, so copying it is disabled until then.
    // The disabled button cannot carry its own tooltip through the DS actions API, so the
    // explanation is exposed as a native title on the row (see `getDisabledCopyTitle` below).
    const getViewActions = (view: View): IKitActionButton[] => [
        {
            key: 'copy-id',
            label: String(t('view_settings.copy-id')),
            icon: <FontAwesomeIcon icon={faCopy} />,
            disabled: !view.shared,
            onClick: async e => {
                (e as {stopPropagation?: () => void}).stopPropagation?.();
                await navigator.clipboard.writeText(view.id);
                KitAlert.info({
                    message: localizedTranslation(view.label, lang),
                    description: String(t('view_settings.id-copied')),
                    duration: INFO_NOTIFICATION_DURATION,
                    closable: true,
                });
            },
        },
    ];

    // Native title fallback so the disabled copy button still explains why it is disabled.
    const getDisabledCopyTitle = (view: View): string | undefined =>
        view.shared ? undefined : String(t('view_settings.copy-id-disabled'));

    return (
        <KitSpace direction="vertical" size="l" className="full-width">
            <KitSpace direction="vertical" size="m" className="full-width">
                <div className={sectionTitle}>
                    <KitTypography.Title level="h4" className={heading}>
                        {t('view_settings.my-views')}
                    </KitTypography.Title>
                    {myViews.length > 0 ? (
                        <KitBadge count={myViews.length} color="primary" secondaryColorInvert />
                    ) : (
                        <KitBadge count={0} showZero className={emptyBadge} />
                    )}
                </div>
                {myViews.length === 0 ? (
                    <KitTypography.Text className={cn(emptyBox, viewItem)}>
                        {t('view_settings.my-views-empty')}
                    </KitTypography.Text>
                ) : (
                    <KitSpace direction="vertical" size="xs" className="full-width">
                        {myViews.map(view => (
                            // TODO: add modified tag when view is modified
                            <KitItemList
                                key={view.id}
                                className={cn(viewItem, {[isCurrentView]: view.id === viewId})}
                                actions={getViewActions(view)}
                                title={getDisabledCopyTitle(view)}
                                idCardProps={{
                                    title: (
                                        <KitSpace size="xs">
                                            {localizedTranslation(view.label, lang)}
                                            {view.shared && (
                                                <KitTag type="success" size="small">
                                                    {t('view_settings.current-view.shared')}
                                                </KitTag>
                                            )}
                                        </KitSpace>
                                    ),
                                    avatar: (
                                        <span className={iconBox}>
                                            <FontAwesomeIcon icon={faBookmark} className={primaryIcon} />
                                        </span>
                                    ),
                                }}
                                onClick={() => {
                                    dispatch({
                                        type: 'view-settings-select-view',
                                        data: {viewId: view.id},
                                    });
                                }}
                            />
                        ))}
                    </KitSpace>
                )}
            </KitSpace>
            <KitSpace direction="vertical" size="m" className="full-width">
                <div className={sectionTitle}>
                    <KitTypography.Title level="h4" className={heading}>
                        {t('view_settings.shared-views')}
                    </KitTypography.Title>
                    {sharedViews.length > 0 ? (
                        <KitBadge count={sharedViews.length} color="primary" secondaryColorInvert />
                    ) : (
                        <KitBadge count={0} showZero className={emptyBadge} />
                    )}
                </div>
                {sharedViews.length === 0 ? (
                    <KitTypography.Text className={cn(emptyBox, viewItem)}>
                        {t('view_settings.shared-views-empty')}
                    </KitTypography.Text>
                ) : (
                    <KitSpace direction="vertical" size="xs" className="full-width">
                        {sharedViews.map(view => (
                            // TODO: add modified tag when view is modified
                            <KitItemList
                                key={view.id}
                                className={cn(viewItem, {[isCurrentView]: view.id === viewId})}
                                actions={getViewActions(view)}
                                title={getDisabledCopyTitle(view)}
                                idCardProps={{
                                    title: localizedTranslation(view.label, lang),
                                    avatar: (
                                        <span className={iconBox}>
                                            <FontAwesomeIcon icon={faBookmark} className={primaryIcon} />
                                        </span>
                                    ),
                                }}
                                onClick={() => {
                                    dispatch({
                                        type: 'view-settings-select-view',
                                        data: {viewId: view.id},
                                    });
                                }}
                            />
                        ))}
                    </KitSpace>
                )}
            </KitSpace>
        </KitSpace>
    );
};
