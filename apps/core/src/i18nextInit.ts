// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import i18next, {i18n} from 'i18next';
import Backend from 'i18next-fs-backend';

export default async (config: IConfig): Promise<i18n> => {
    await i18next.use(Backend).init({
        lng: config.lang.default,
        fallbackLng: config.lang.default,
        supportedLngs: config.lang.available,
        debug: false,
        preload: config.lang.available,
        backend: {
            loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json'
        }
    });

    return i18next;
};
