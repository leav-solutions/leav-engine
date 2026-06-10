import {type IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {type ViewSettingsTab} from '../../../types';

export type ViewSettingsTabConfig = {
    key: ViewSettingsTab;
    labelKey: string;
    icon: IconDefinition;
};
