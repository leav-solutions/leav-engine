import {type IConfig} from './_types/config';
import i18next, {type i18n} from 'i18next';
import Backend from 'i18next-fs-backend';
import {loadLocalesForDayjs} from './utils/configureDayjs';

export default async (config: IConfig): Promise<i18n> => {
    await i18next.use(Backend).init({
        lng: config.lang.default,
        fallbackLng: config.lang.default,
        supportedLngs: config.lang.available,
        debug: false,
        preload: config.lang.available,
        backend: {
            loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
        },
    });

    loadLocalesForDayjs(config.lang);

    return i18next;
};
