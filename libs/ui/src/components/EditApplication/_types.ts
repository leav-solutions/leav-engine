// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TabsProps} from 'antd';
import {CSSObject} from 'styled-components';

export interface IEditApplicationProps {
    applicationId?: string;
    appsBaseUrl: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<void>) => void;
    activeTab?: 'info';
    tabContentStyle?: CSSObject;
    additionalTabs?: TabsProps['items'];
}
