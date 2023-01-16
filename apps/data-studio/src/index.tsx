// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {customTheme} from '@leav/ui';
import {ConfigProvider} from 'antd';
import 'antd/dist/reset.css';
import App from 'components/app';
import 'index.css';
import {createRoot} from 'react-dom/client';
import './i18n';
import * as serviceWorker from './serviceWorker';

const root = createRoot(document.getElementById('root'));

root.render(
    <ConfigProvider theme={customTheme}>
        <App />
    </ConfigProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
