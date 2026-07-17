import {test, expect} from '@playwright/test';
import config from '../config';
import {PortalPage} from '../../pages/PortalPage';
import {LibraryStandardFieldPage} from '../../pages/LibraryStandardFieldPage';
import {ExplorerStudioPage} from '../../pages/ExplorerStudioPage';
import {
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1,
    TEST_COLOR_RECORD_INITIAL_VALUE,
    TEST_COLOR_RECORD_LABEL,
    TEST_DATE_RANGE_RECORD_INITIAL_VALUE_FROM,
    TEST_DATE_RANGE_RECORD_LABEL,
    TEST_DATE_RECORD_INITIAL_VALUE,
    TEST_DATE_RECORD_LABEL,
    TEST_DROPDOWN_RECORD_LABEL,
    TEST_TEXT_RECORD_INITIAL_VALUE,
    TEST_TEXT_RECORD_LABEL,
} from '../constants';
import {setupCryptoRandomUUIDPolyfill} from '@leav/e2e-test-utils';

setupCryptoRandomUUIDPolyfill(test);

test.describe('Standard type field scenario', () => {
    test.beforeEach(async ({page}) => {
        await page.goto(config.baseUrl);

        expect(page.url()).toContain(`${config.baseUrl}/app/login`);

        const portalPage = new PortalPage(page);

        portalPage.login({id: config.auth.username, password: config.auth.password});

        await expect(portalPage.pageTitle).toBeVisible({timeout: 10000});

        await portalPage.accessExplorerStudio();

        const explorerStudioPage = new ExplorerStudioPage(page);
        await explorerStudioPage.enterLibraryWorkspace();

        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await expect(libraryStandardFieldPage.createBtn).toBeVisible({timeout: 10000});
    });

    test('Save simple text', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        const simpleText = 'Hello';
        await libraryStandardFieldPage.openCreationModal();
        await libraryStandardFieldPage.simpleTextComponent.fillText(simpleText);
        await expect(libraryStandardFieldPage.simpleTextComponent.isSimpleTextSave(simpleText)).toBeVisible();
    });

    test('Delete simple text', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.accessObjectForm(TEST_TEXT_RECORD_LABEL);
        await libraryStandardFieldPage.simpleTextComponent.clear();
        await expect(libraryStandardFieldPage.simpleTextComponent.field).toBeEmpty();
        await expect(
            libraryStandardFieldPage.simpleTextComponent.isSimpleTextSave(TEST_TEXT_RECORD_INITIAL_VALUE),
        ).not.toBeVisible();
    });

    test('Boolean set on true', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.openCreationModal();
        await libraryStandardFieldPage.booleanSwitch.toggleBoolean();
        const defaultBoolean = await libraryStandardFieldPage.doesBooleanHaveValue(true);
        await expect(defaultBoolean).toBeVisible();
    });

    test('Boolean set on false', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.openCreationModal();
        await libraryStandardFieldPage.booleanSwitch.toggleBoolean();
        const defaultBoolean = await libraryStandardFieldPage.doesBooleanHaveValue(true);
        await expect(defaultBoolean).toBeVisible();
        await libraryStandardFieldPage.booleanSwitch.toggleBoolean();
        const booleanSave = await libraryStandardFieldPage.doesBooleanHaveValue(false);
        await expect(booleanSave).toBeVisible();
    });

    test('Save simple date', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.openCreationModal();
        const date = await libraryStandardFieldPage.dateComponent.selectDate({year: '2026', month: '10', day: '28'});
        await expect(libraryStandardFieldPage.dateComponent.isSimpleDateSave(date)).toBeVisible();
    });

    test('Delete simple date', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.accessObjectForm(TEST_DATE_RECORD_LABEL);
        await libraryStandardFieldPage.dateComponent.clear();
        await expect(
            libraryStandardFieldPage.dateComponent.isSimpleDateSave(TEST_DATE_RECORD_INITIAL_VALUE),
        ).not.toBeVisible();
    });

    test('Save simple date range', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.openCreationModal();
        const date = await libraryStandardFieldPage.dateRangeComponent.selectDate({
            year: '2026',
            month: '08',
            fromDay: '02',
            toDay: '15',
        });
        await expect(libraryStandardFieldPage.modal.sidePanel).toContainText(date);
    });

    test('Delete simple date range', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.accessObjectForm(TEST_DATE_RANGE_RECORD_LABEL);
        await libraryStandardFieldPage.dateRangeComponent.clear();
        await expect(libraryStandardFieldPage.dateRangeComponent.field).not.toContainText(
            TEST_DATE_RANGE_RECORD_INITIAL_VALUE_FROM,
        );
        await expect(
            libraryStandardFieldPage.dateRangeComponent.isDateRangeSave(TEST_DATE_RANGE_RECORD_INITIAL_VALUE_FROM),
        ).not.toBeVisible();
    });

    test('Save simple color', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        const color = '#';
        await libraryStandardFieldPage.openCreationModal();
        await libraryStandardFieldPage.colorComponent.selectColor();
        await expect(libraryStandardFieldPage.colorComponent.isColorSave(color)).toBeVisible();
    });

    test('Delete simple color', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.accessObjectForm(TEST_COLOR_RECORD_LABEL);
        await libraryStandardFieldPage.colorComponent.clear();
        await expect(
            libraryStandardFieldPage.colorComponent.isColorSave(TEST_COLOR_RECORD_INITIAL_VALUE),
        ).not.toBeVisible();
    });

    test('Save simple password', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        const simplePassword = 'Secret123!';
        await libraryStandardFieldPage.openCreationModal();
        await libraryStandardFieldPage.passwordComponent.udpdate(simplePassword);
        await expect(libraryStandardFieldPage.modal.sidePanel).toContainText('●');
    });

    test('Save rich text', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        const richText = 'Bold text';
        await libraryStandardFieldPage.openCreationModal();
        await libraryStandardFieldPage.richTextComponent.writeTextInBold(richText);
        await expect(libraryStandardFieldPage.richTextComponent.isValueSave(richText)).toBeVisible();
    });

    test('Select option in simple dropdown', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.openCreationModal();
        await libraryStandardFieldPage.dropdownComponent.select();
        await expect(
            libraryStandardFieldPage.dropdownComponent.isValueSave(STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1),
        ).toBeVisible();
    });

    test('Delete option in simple dropdown', async ({page}) => {
        const libraryStandardFieldPage = new LibraryStandardFieldPage(page);
        await libraryStandardFieldPage.accessObjectForm(TEST_DROPDOWN_RECORD_LABEL);
        await libraryStandardFieldPage.dropdownComponent.clear();
        await expect(libraryStandardFieldPage.dropdownComponent.field).not.toContainText(
            STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1,
        );
        await expect(
            libraryStandardFieldPage.dropdownComponent.isValueSave(STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1),
        ).not.toBeVisible();
    });
});
