import {message} from 'antd';
import {useTranslation} from 'react-i18next';

/**
 * This hook check if we've been landed here with an error message. If so, display it.
 */
function useRedirectionError() {
    const {t} = useTranslation();

    return () => {
        const querySearch = new URLSearchParams(window.location.search);
        const queryErr = querySearch.get('err');
        const queryErrApp = querySearch.get('app');

        if (!queryErr) {
            return;
        }

        const errorMessage = t('error.' + queryErr, {app: queryErrApp});

        message.error(errorMessage, 10);
    };
}

export default useRedirectionError;
