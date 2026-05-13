import {type IKitTabItem} from 'aristid-ds/dist/Kit/DataDisplay/Tabs/types';

export interface IEditApplicationProps {
    applicationId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<void>) => void;
    activeTab?: 'info' | string;
    tabContentStyle?: React.CSSProperties;
    additionalTabs?: IKitTabItem[];
}
