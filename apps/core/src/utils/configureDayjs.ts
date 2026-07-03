import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import {logger} from '@leav/logger';
import {type ILang} from '../_types/config';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(LocalizedFormat);

export async function loadLocalesForDayjs(langConfig: ILang) {
    await Promise.all(
        langConfig.available.map(async lang => {
            try {
                await import(`dayjs/locale/${lang}`);
            } catch {
                logger.warn(`Locale ${lang} not found for dayjs, fallback to default locale`);
            }
        }),
    );
    dayjs.locale(langConfig.default);
}
