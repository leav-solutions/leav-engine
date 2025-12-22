// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {test as setup} from '@playwright/test';
import {ApplicationClient} from '../utils/ApplicationClient';

setup('Configure leav', async () => {
    console.info('Configure database...');
    const applicationClient = new ApplicationClient();
    await applicationClient.createApplication('app-studio');
});
