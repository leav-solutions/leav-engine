import {Form} from 'antd';
import {KitAlert, KitButton, KitInput, KitTypography} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

interface IResetPasswordFormProps {
    onSubmit: (newPassword: string) => void;
    loading: boolean;
    resetPasswordError: string;
}

const ResetPasswordForm = ({onSubmit, loading, resetPasswordError}: IResetPasswordFormProps): JSX.Element => {
    const {t} = useTranslation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const _processResetPassword = async () => {
        onSubmit(newPassword);
    };

    return (
        <>
            <KitTypography.Title level="h3"> {t('resetPassword.header')}</KitTypography.Title>
            <Form onFinish={_processResetPassword}>
                <Form.Item
                    hasFeedback
                    name="newPassword"
                    rules={[{required: true, message: t('resetPassword.new_password_required')}]}
                >
                    <KitInput.Password
                        aria-label={t('resetPassword.new_password')}
                        placeholder={t('resetPassword.new_password')}
                        autoFocus
                        value={newPassword}
                        onChange={extractValueFromEventAndThen(setNewPassword)}
                    />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        {required: true, message: t('resetPassword.confirm_password_required')},
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                return !value || getFieldValue('newPassword') === value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error(t('resetPassword.wrong_confirm_password')));
                            },
                        }),
                    ]}
                >
                    <KitInput.Password
                        aria-label={t('resetPassword.confirm_password')}
                        placeholder={t('resetPassword.confirm_password')}
                        value={confirmPassword}
                        onChange={extractValueFromEventAndThen(setConfirmPassword)}
                    />
                </Form.Item>
                {loading && (
                    <Form.Item>
                        <KitAlert
                            message={t('resetPassword.loading.header')}
                            description={t('resetPassword.loading.text')}
                            type="warning"
                            showIcon
                        />
                    </Form.Item>
                )}
                {resetPasswordError && (
                    <Form.Item>
                        <KitAlert message={resetPasswordError} type="error" showIcon />
                    </Form.Item>
                )}
                {!loading && (
                    <Form.Item style={{textAlign: 'center'}}>
                        <KitButton type="primary" loading={loading} disabled={loading} htmlType="submit" block>
                            {t('resetPassword.submit')}
                        </KitButton>
                    </Form.Item>
                )}
            </Form>
        </>
    );
};

export default ResetPasswordForm;
