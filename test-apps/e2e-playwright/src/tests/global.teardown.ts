// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {test as teardown} from '@playwright/test';
import {DataClient} from '../utils/DataClient';
import {LibraryClient} from '../utils/LibraryClient';
import {AttributeClient} from '../utils/AttributeClient';

teardown('Delete datas, libraries et attributes', async ({}) => {
    console.info('Deleting data ...');
    const dataClient = new DataClient();
    await dataClient.deleteData(['test_library1']);
    const libraryClient = new LibraryClient();
    await libraryClient.deleteLibrary(['test_library1']);
    const attributeClient = new AttributeClient();
    await attributeClient.deleteAttribute(['simple_text_attribute_1', 'simple_text_attribute_2']);
    console.info('Global teardown finished');
});
