import {test as setup} from '@playwright/test';
import {RecordsClient} from '@leav/e2e-test-utils';
import {ApplicationClient} from '../utils/ApplicationClient';
import {AttributeClient} from '../utils/AttributeClient';
import {LibraryClient} from '../utils/LibraryClient';
import {initialData} from '../data';
import {AttributeFormat, AttributeType} from '../_gqlTypes';
import {
    STANDARD_FIELD_ATTRIBUTE_BOOLEAN_ID,
    STANDARD_FIELD_ATTRIBUTE_BOOLEAN_LABEL,
    STANDARD_FIELD_ATTRIBUTE_COLOR_ID,
    STANDARD_FIELD_ATTRIBUTE_COLOR_LABEL,
    STANDARD_FIELD_ATTRIBUTE_DATE_ID,
    STANDARD_FIELD_ATTRIBUTE_DATE_LABEL,
    STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID,
    STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_LABEL,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_LABEL,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_2,
    STANDARD_FIELD_ATTRIBUTE_PASSWORD_ID,
    STANDARD_FIELD_ATTRIBUTE_PASSWORD_LABEL,
    STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_ID,
    STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_LABEL,
    STANDARD_FIELD_ATTRIBUTE_TEXT_ID,
    STANDARD_FIELD_ATTRIBUTE_TEXT_LABEL,
    LABEL_ATTRIBUTE,
    STANDARD_FIELD_LIBRARY_ID,
    STANDARD_FIELD_LIBRARY_LABEL,
} from '../constants';

setup('Create test database', async ({}) => {
    console.info('Configure database...');
    const applicationClient = new ApplicationClient();
    await applicationClient.createApplication('app-studio');
    const attributeClient = new AttributeClient();

    await attributeClient.createAttribute(LABEL_ATTRIBUTE, AttributeType.simple, LABEL_ATTRIBUTE, AttributeFormat.text);

    await attributeClient.createAttribute(
        STANDARD_FIELD_ATTRIBUTE_TEXT_ID,
        AttributeType.simple,
        STANDARD_FIELD_ATTRIBUTE_TEXT_LABEL,
        AttributeFormat.text,
    );

    await attributeClient.createAttribute(
        STANDARD_FIELD_ATTRIBUTE_BOOLEAN_ID,
        AttributeType.simple,
        STANDARD_FIELD_ATTRIBUTE_BOOLEAN_LABEL,
        AttributeFormat.boolean,
    );

    await attributeClient.createAttribute(
        STANDARD_FIELD_ATTRIBUTE_DATE_ID,
        AttributeType.simple,
        STANDARD_FIELD_ATTRIBUTE_DATE_LABEL,
        AttributeFormat.date,
    );

    await attributeClient.createAttribute(
        STANDARD_FIELD_ATTRIBUTE_COLOR_ID,
        AttributeType.simple,
        STANDARD_FIELD_ATTRIBUTE_COLOR_LABEL,
        AttributeFormat.color,
    );

    await attributeClient.createAttribute(
        STANDARD_FIELD_ATTRIBUTE_PASSWORD_ID,
        AttributeType.simple,
        STANDARD_FIELD_ATTRIBUTE_PASSWORD_LABEL,
        AttributeFormat.encrypted,
    );

    await attributeClient.createAttribute(
        STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID,
        AttributeType.simple,
        STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_LABEL,
        AttributeFormat.date_range,
    );

    await attributeClient.createAttribute(
        STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_ID,
        AttributeType.simple,
        STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_LABEL,
        AttributeFormat.rich_text,
    );

    await attributeClient.createValuesListAttribute(
        STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
        STANDARD_FIELD_ATTRIBUTE_DROPDOWN_LABEL,
        [STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1, STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_2],
    );

    const libraryClient = new LibraryClient();
    await libraryClient.createLibrary(STANDARD_FIELD_LIBRARY_ID, STANDARD_FIELD_LIBRARY_LABEL, [
        LABEL_ATTRIBUTE,
        STANDARD_FIELD_ATTRIBUTE_TEXT_ID,
        STANDARD_FIELD_ATTRIBUTE_BOOLEAN_ID,
        STANDARD_FIELD_ATTRIBUTE_DATE_ID,
        STANDARD_FIELD_ATTRIBUTE_COLOR_ID,
        STANDARD_FIELD_ATTRIBUTE_PASSWORD_ID,
        STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID,
        STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_ID,
        STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
    ]);

    const recordsClient = new RecordsClient();
    await recordsClient.importDataJson(JSON.stringify(initialData));
    console.info('GlobalSetup finished.');
});
