// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {test as teardown} from '@playwright/test';
import {DataClient} from '../utils/DataClient';
import {LibraryClient} from '../utils/LibraryClient';
import {AttributeClient} from '../utils/AttributeClient';
import {
    STANDARD_FIELD_ATTRIBUTE_BOOLEAN_ID,
    STANDARD_FIELD_ATTRIBUTE_COLOR_ID,
    STANDARD_FIELD_ATTRIBUTE_DATE_ID,
    STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
    STANDARD_FIELD_ATTRIBUTE_PASSWORD_ID,
    STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_ID,
    STANDARD_FIELD_ATTRIBUTE_TEXT_ID,
    STANDARD_FIELD_LIBRARY_ID,
} from '../constants';

teardown('Delete datas, libraries et attributes', async ({}) => {
    console.info('Deleting data ...');
    const dataClient = new DataClient();
    await dataClient.deleteData([STANDARD_FIELD_LIBRARY_ID]);

    const libraryClient = new LibraryClient();
    await libraryClient.deleteLibrary([STANDARD_FIELD_LIBRARY_ID]);

    const attributeClient = new AttributeClient();
    await attributeClient.deleteAttribute([
        STANDARD_FIELD_ATTRIBUTE_TEXT_ID,
        STANDARD_FIELD_ATTRIBUTE_BOOLEAN_ID,
        STANDARD_FIELD_ATTRIBUTE_DATE_ID,
        STANDARD_FIELD_ATTRIBUTE_COLOR_ID,
        STANDARD_FIELD_ATTRIBUTE_PASSWORD_ID,
        STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID,
        STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_ID,
        STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
    ]);

    console.info('Global teardown finished');
});
