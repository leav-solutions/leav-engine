import useLang from '_ui/hooks/useLang/useLang';
import {getDateFormatByLang} from '_ui/_utils';

export const useDateFormat = (): string => {
    const {lang} = useLang();
    return getDateFormatByLang(lang[0]);
};
