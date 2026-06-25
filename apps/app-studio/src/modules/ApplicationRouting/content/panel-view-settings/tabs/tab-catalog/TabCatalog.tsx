import {useLang} from '@leav/ui';
import {KitBadge, KitItemList, KitSection, KitSpace, KitTag, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBookmark} from '@fortawesome/free-solid-svg-icons';
import {localizedTranslation} from '@leav/utils';
import cn from 'classnames';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {UnsavedViewChangesModal} from './UnsavedViewChangesModal';
import {useViewCatalog} from './useViewCatalog';
import {useViewSelection} from './useViewSelection';
import {useViewActions} from './useViewActions';
import {
    emptyBadge,
    emptyBox,
    iconBox,
    isCurrentView,
    primaryIcon,
    sectionTitle,
    viewItem,
} from './tabCatalog.module.css';

export const TabCatalog = ({libraryId}: {libraryId: string}) => {
    const {t} = useTranslation();
    const {lang} = useLang();

    const {myViews, sharedViews} = useViewCatalog(libraryId);
    const {view: currentLoadedView, isEmptyView} = useCurrentView();
    const {selectView, unsavedViewChangesModalProps} = useViewSelection();
    const {getViewActions} = useViewActions(libraryId);

    // Render in the default (empty) state too, so a view can be selected when none is loaded yet.
    if (!currentLoadedView && !isEmptyView) {
        return null;
    }

    return (
        <KitSpace direction="vertical" size="l" className="full-width">
            <KitSpace direction="vertical" size="m" className="full-width">
                <header className={sectionTitle}>
                    <KitTypography.Text weight="bold" size="fontSize5">
                        {t('view_settings.my_views')}
                    </KitTypography.Text>
                    {myViews.length > 0 ? (
                        <KitBadge count={myViews.length} color="primary" secondaryColorInvert />
                    ) : (
                        <KitBadge count={0} showZero className={emptyBadge} />
                    )}
                </header>
                {myViews.length === 0 ? (
                    <KitSection className={emptyBox}>
                        <KitTypography.Text size="fontSize7">{t('view_settings.my_views_empty')}</KitTypography.Text>
                    </KitSection>
                ) : (
                    <KitSpace direction="vertical" size="xs" className="full-width">
                        {myViews.map(view => (
                            // TODO: add modified tag when view is modified
                            <KitItemList
                                key={view.id}
                                className={cn(viewItem, {[isCurrentView]: view.id === currentLoadedView?.id})}
                                showActionsOnHover
                                actions={getViewActions(view)}
                                idCardProps={{
                                    title: (
                                        <KitSpace size="xs">
                                            {localizedTranslation(view.label, lang)}
                                            {view.shared && (
                                                <KitTag type="success" size="small">
                                                    {t('view_settings.current_view.shared')}
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
                                onClick={() => selectView(view.id)}
                            />
                        ))}
                    </KitSpace>
                )}
            </KitSpace>
            <KitSpace direction="vertical" size="m" className="full-width">
                <header className={sectionTitle}>
                    <KitTypography.Text weight="bold" size="fontSize5">
                        {t('view_settings.shared_views')}
                    </KitTypography.Text>
                    {sharedViews.length > 0 ? (
                        <KitBadge count={sharedViews.length} color="primary" secondaryColorInvert />
                    ) : (
                        <KitBadge count={0} showZero className={emptyBadge} />
                    )}
                </header>
                {sharedViews.length === 0 ? (
                    <KitSection className={emptyBox}>
                        <KitTypography.Text size="fontSize7">
                            {t('view_settings.shared_views_empty')}
                        </KitTypography.Text>
                    </KitSection>
                ) : (
                    <KitSpace direction="vertical" size="xs" className="full-width">
                        {sharedViews.map(view => (
                            // TODO: add modified tag when view is modified
                            <KitItemList
                                key={view.id}
                                className={cn(viewItem, {[isCurrentView]: view.id === currentLoadedView?.id})}
                                actions={getViewActions(view)}
                                idCardProps={{
                                    title: localizedTranslation(view.label, lang),
                                    avatar: (
                                        <span className={iconBox}>
                                            <FontAwesomeIcon icon={faBookmark} className={primaryIcon} />
                                        </span>
                                    ),
                                }}
                                onClick={() => selectView(view.id)}
                            />
                        ))}
                    </KitSpace>
                )}
            </KitSpace>
            <UnsavedViewChangesModal {...unsavedViewChangesModalProps} />
        </KitSpace>
    );
};
