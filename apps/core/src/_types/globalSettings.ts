import {type IKeyValue} from './shared';

export interface IGlobalSettings {
    defaultApp: string;
    name: string;
    icon?: {
        library: string;
        recordId: string;
    };
    favicon?: {
        library: string;
        recordId: string;
    };
    settings?: IKeyValue<any>;
}
