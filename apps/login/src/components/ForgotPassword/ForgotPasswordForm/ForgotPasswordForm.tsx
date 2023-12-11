// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, CloseOutlined, SendOutlined} from '@ant-design/icons';
import {Alert, Card, Form, Space, Spin} from 'antd';
import {KitButton, KitInput, KitTypography} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10%;
`;

const ForgotPasswordBlock = styled(Card)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`;

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
    forgotPasswordSuccess
}: IForgotPasswordFormProps): JSX.Element => {
    const {t} = useTranslation();
    const [email, setEmail] = useState('');
    const history = useHistory();

    const _processForgotPassword = async () => {
        onSubmit(email);
    };

    const _handleCancel = () => {
        history.push('/');
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
                        {required: true, message: t('forgotPassword.email_required')}
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
                        <Alert
                            message={t('forgotPassword.loading.header')}
                            description={t('forgotPassword.loading.text')}
                            icon={<Spin />}
                            type="warning"
                            showIcon
                        />
                    </Form.Item>
                )}
                {forgotPasswordError && (
                    <Form.Item>
                        <Alert
                            message={forgotPasswordError}
                            type="error"
                            showIcon
                            icon={<CloseOutlined style={{fontSize: '1.5em'}} />}
                        />
                    </Form.Item>
                )}
                {forgotPasswordSuccess && (
                    <Form.Item>
                        <Alert
                            message={forgotPasswordSuccess}
                            type="success"
                            showIcon
                            icon={<CheckOutlined style={{fontSize: '1.5em'}} />}
                        />
                    </Form.Item>
                )}
                {!loading && (
                    <Space wrap style={{float: 'right'}} direction="horizontal">
                        <Form.Item>
                            <KitButton onClick={_handleCancel} type="default" block>
                                {t('forgotPassword.cancel')}
                            </KitButton>
                        </Form.Item>
                        <Form.Item>
                            <KitButton type="primary" htmlType="submit" icon={<SendOutlined />} block>
                                {t('forgotPassword.submit')}
                            </KitButton>
                        </Form.Item>
                    </Space>
                )}
            </Form>
        </>
    );
};

export default ForgotPasswordForm;
