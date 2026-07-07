import {SendOutlined} from '@ant-design/icons';
import {Form} from 'antd';
import {KitAlert, KitButton, KitInput, KitSpace, KitTypography} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

interface IForgotPasswordFormProps {
    onSubmit: (email: string) => void;
    loading: boolean;
    forgotPasswordError: string;
    forgotPasswordSuccess: string;
}

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

const ForgotPasswordForm = ({
    onSubmit,
    loading,
    forgotPasswordError,
    forgotPasswordSuccess,
}: IForgotPasswordFormProps): JSX.Element => {
    const {t} = useTranslation();
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const _processForgotPassword = async () => {
        onSubmit(email);
    };

    const _handleCancel = () => {
        navigate('/');
    };

    return (
        <>
            <KitTypography.Title level="h3">{t('forgotPassword.header')}</KitTypography.Title>
            <Form onFinish={_processForgotPassword}>
                <Form.Item
                    hasFeedback
                    name="email"
                    rules={[
                        {type: 'email', message: t('forgotPassword.email_not_valid')},
                        {required: true, message: t('forgotPassword.email_required')},
                    ]}
                >
                    <KitInput
                        aria-label={t('forgotPassword.email')}
                        placeholder={t('forgotPassword.email')}
                        autoFocus
                        value={email}
                        onChange={extractValueFromEventAndThen(setEmail)}
                    />
                </Form.Item>
                {loading && (
                    <Form.Item>
                        <KitAlert
                            message={t('forgotPassword.loading.header')}
                            description={t('forgotPassword.loading.text')}
                            type="warning"
                            showIcon
                        />
                    </Form.Item>
                )}
                {forgotPasswordError && (
                    <Form.Item>
                        <KitAlert message={forgotPasswordError} type="error" showIcon />
                    </Form.Item>
                )}
                {forgotPasswordSuccess && (
                    <Form.Item>
                        <KitAlert message={forgotPasswordSuccess} type="success" showIcon />
                    </Form.Item>
                )}
                {!loading && (
                    <KitSpace wrap style={{float: 'right'}} direction="horizontal">
                        <Form.Item>
                            <KitButton onClick={_handleCancel} type="primary" block>
                                {t('forgotPassword.cancel')}
                            </KitButton>
                        </Form.Item>
                        <Form.Item>
                            <KitButton type="primary" icon={<SendOutlined />} htmlType="submit" block>
                                {t('forgotPassword.submit')}
                            </KitButton>
                        </Form.Item>
                    </KitSpace>
                )}
            </Form>
        </>
    );
};

export default ForgotPasswordForm;
