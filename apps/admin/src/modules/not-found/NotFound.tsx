import {KitButton, KitError, KitSpace, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {notFoundContainer, resumeNavigation} from './notFound.module.css';
import {useNavigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../routes/paths';

export const NotFound = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const _navigateToHome = () => {
        navigate(AdminAbsolutePaths.root);
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
                            {t('admin.home_page')}
                        </KitButton>
                        .
                    </KitTypography.Paragraph>
                </KitSpace>
            }
            httpErrorCode="404"
        />
    );
};
