import {CSSObject} from 'styled-components';

export interface IEditApplicationProps {
    applicationId?: string;
    appsBaseUrl: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<void>) => void;
    activeTab?: 'info' | 'install';
    tabContentStyle?: CSSObject;
}
