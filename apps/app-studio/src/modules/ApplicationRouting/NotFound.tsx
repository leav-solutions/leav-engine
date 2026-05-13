import {KitButton, KitError, KitSpace, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {notFoundContainer, resumeNavigation} from './NotFound.module.css';
import {useNavigate} from 'react-router-dom';
import {AbsolutePaths} from './router/paths';

export const NotFound = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const _navigateToHome = () => {
        navigate(AbsolutePaths.home);
    };

    return (
        <KitError
            className={notFoundContainer}
            title={t('error.page_does_not_exist')}
            description={
                <KitSpace direction="vertical" size="s" align="center">
                    <KitTypography.Text>{t('error.page_does_not_seem_to_exist_anymore')}</KitTypography.Text>
                    <KitTypography.Paragraph className={resumeNavigation}>
                        {t('error.resume_navigation')}
                        <KitButton type="link" onClick={_navigateToHome}>
                            {t('global.home_page')}
                        </KitButton>
                        .
                    </KitTypography.Paragraph>
                </KitSpace>
            }
            httpErrorCode="404"
        />
    );
};
