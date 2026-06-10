import {KitEmpty} from 'aristid-ds';

export const TabDisplay = ({canEditAdminView}: {canEditAdminView: boolean}) => (
    // TODO: receive current SerializedView from Explorer via targetPanelId (user may have switched from the default configured view — the config panel must edit whatever is currently displayed)
    // TODO (admin): configure available attributes for columns
    // TODO (user): read display mode and visible columns from current SerializedView and handle changes
    <KitEmpty description="Work in progress" />
);
