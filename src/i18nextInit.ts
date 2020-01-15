import i18next, {i18n} from 'i18next';
import Backend from 'i18next-node-fs-backend';

export default async (config: any): Promise<i18n> => {
    await i18next.use(Backend).init({
        lng: config.lang.default,
        fallbackLng: config.lang.available,
        whitelist: config.lang.available,
        debug: false,
        backend: {
            loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json'
        }
    });

    return i18next;
};
