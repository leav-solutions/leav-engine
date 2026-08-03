import {useTranslation} from 'react-i18next';
import {KitCheckableTile, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTable, faTableColumns} from '@fortawesome/free-solid-svg-icons';
import {type IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {ViewV2Types} from '../../../../../../__generated__';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {useApplicationSettingsContext} from '../../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {isKanbanViewEnabled} from '../../../../utils/kanbanViewGate';
import {section, tiles} from './displayModeSelector.module.css';

/**
 * Display modes offered in phase 1. Only `list` (rendered as a table today) and `kanban` are exposed:
 * `cards`/`timeline` exist in the enum but render identically to the table, so surfacing them would be
 * misleading. Extend this list as real renderings land.
 */
const DISPLAY_MODES: Array<{type: ViewV2Types; labelKey: string; icon: IconDefinition}> = [
    {type: ViewV2Types.list, labelKey: 'view_settings.display.mode.table', icon: faTable},
    {type: ViewV2Types.kanban, labelKey: 'view_settings.display.mode.kanban', icon: faTableColumns},
];

export const DisplayModeSelector = () => {
    const {t} = useTranslation();
    const {view, setViewType} = useCurrentView();
    const applicationCtx = useApplicationSettingsContext();
    const currentType = view?.display.type;

    // Kanban gate (see `kanbanViewGate.ts`): when off, the kanban tile is not offered at all — if the
    // mode cannot be selected, the board cannot be reached.
    const displayModes = isKanbanViewEnabled(applicationCtx?.[0])
        ? DISPLAY_MODES
        : DISPLAY_MODES.filter(({type}) => type !== ViewV2Types.kanban);

    return (
        <section className={section}>
            <KitTypography.Text weight="bold" size="fontSize5">
                {t('view_settings.display.mode.title')}
            </KitTypography.Text>
            <div className={tiles}>
                {displayModes.map(({type, labelKey, icon}) => (
                    <KitCheckableTile
                        key={type}
                        label={t(labelKey)}
                        icon={<FontAwesomeIcon icon={icon} />}
                        checked={currentType === type}
                        // Radio behaviour: only react to a selection (checked === true). Clicking the
                        // already-selected tile fires `checked === false`; ignore it so one mode is always set.
                        onChange={checked => {
                            if (checked) {
                                setViewType(type);
                            }
                        }}
                    />
                ))}
            </div>
        </section>
    );
};
