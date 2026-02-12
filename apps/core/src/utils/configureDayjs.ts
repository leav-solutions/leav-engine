// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import {logger} from '@leav/logger';
import {type ILang} from '_types/config';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(LocalizedFormat);

export function loadLocalesForDayjs(langConfig: ILang) {
    langConfig.available.forEach(lang => {
        try {
            require(`dayjs/locale/${lang}`);
        } catch (e) {
            logger.warn(`Locale ${lang} not found for dayjs, fallback to default locale`);
        }
    });
    dayjs.locale(langConfig.default);
}
