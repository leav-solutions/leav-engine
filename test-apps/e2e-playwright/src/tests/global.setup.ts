// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {test as setup} from '@playwright/test';
import {ApplicationClient} from '../utils/ApplicationClient';
import {AttributeClient} from '../utils/AttributeClient';
import {LibraryClient} from '../utils/LibraryClient';
import {AttributeFormats, AttributeTypes} from '../../../../apps/core/src/_types/attribute';
import {initialData} from '../data';
import {DataClient} from '../utils/DataClient';

setup('Create test database', async ({}) => {
    console.info('Configure database...');
    const applicationClient = new ApplicationClient();
    await applicationClient.createApplication('app-studio');
    const attributeClient = new AttributeClient();
    await attributeClient.createAttribute(
        'simple_text_attribute_1',
        AttributeTypes.SIMPLE,
        'simple texte pour test',
        AttributeFormats.TEXT,
        false,
        false,
        'description',
    );
    await attributeClient.createAttribute(
        'simple_text_attribute_2',
        AttributeTypes.SIMPLE,
        'simple texte',
        AttributeFormats.TEXT,
        false,
        false,
        'description',
    );
    const libraryClient = new LibraryClient();
    await libraryClient.createLibrary('test_library1', 'bibliothèque_test1', [
        'simple_text_attribute_1',
        'simple_text_attribute_2',
    ]);
    const dataClient = new DataClient();
    await dataClient.importData(JSON.stringify(initialData));
    console.info('GlobalSetup finished.');
});
