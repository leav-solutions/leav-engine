import {type theme} from 'antd';

export type AntdThemeToken = ReturnType<typeof theme.useToken>['token'];
