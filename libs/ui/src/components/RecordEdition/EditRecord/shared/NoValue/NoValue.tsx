// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileAddOutlined, FileOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface INoValueProps {
    canAddValue: boolean;
    onAddValue: () => void;
    linkField?: boolean;
}

const NoValueWrapper = styled.div`
    font-size: 1.1em;

    span {
        margin-left: 0.5em;
    }
`;

const AddButton = styled(Button)`
    && {
        border: none;
        width: 100%;
        color: rgba(0, 0, 0, 0.25);
        box-shadow: none;
    }

    &&:hover {
        border: none;
    }
`;

function NoValue({canAddValue, onAddValue, linkField = false}: INoValueProps): JSX.Element {
    const {t} = useSharedTranslation();

    return (
        <NoValueWrapper onClick={onAddValue}>
            {canAddValue ? (
                <AddButton onClick={onAddValue} size="small">
                    <FileAddOutlined />
                    <span>{linkField ? t('record_edition.add_value_link') : t('record_edition.add_value')}</span>
                </AddButton>
            ) : (
                <>
                    <FileOutlined />
                    <span>{t('record_edition.no_value')}</span>
                </>
            )}
        </NoValueWrapper>
    );
}

export default NoValue;
