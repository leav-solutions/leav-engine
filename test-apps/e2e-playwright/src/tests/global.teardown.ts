import {test as teardown} from '@playwright/test';
import {RecordsClient} from '@leav/e2e-test-utils';
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

teardown('Delete datas, libraries et attributes', async () => {
    console.info('Deleting data ...');
    const recordsClient = new RecordsClient();
    await recordsClient.deleteAndPurgeLibrariesRecords([STANDARD_FIELD_LIBRARY_ID]);

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
