import {ISystemTranslation} from './systemTranslation';
import {IAttribute} from './attribute';

export interface ILibrary {
    id: string;
    label?: ISystemTranslation;
    system?: boolean;

    /**
     * List of attributes usable in this library
     */
    attributes?: string[] | IAttribute[];
}
