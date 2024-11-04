// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TabsProps} from 'antd';

export interface IEditApplicationProps {
    applicationId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<void>) => void;
    activeTab?: 'info' | string;
    tabContentStyle?: React.CSSProperties;
    additionalTabs?: TabsProps['items'];
}
