import {CloseOutlined} from '@ant-design/icons';
import {Button, Descriptions} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {localizedLabel} from '../../../utils';
import {IAttributesChecked} from '../../../_types/types';
import {ListAttributeState} from '../ListAttributesReducer';
import {SmallText, TextAttribute} from '../StyledComponents';

interface ItemSelectedProps {
    attributeChecked: IAttributesChecked;
    removeAttributeChecked: (attributeChecked: IAttributesChecked) => void;
    stateListAttribute: ListAttributeState;
}

const CustomCard = styled.div`
    &&& {
        padding: 0;
        margin: 24px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #f0f0f0;
        border-radius: 2px;
        min-height: 5rem;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
    }
`;

const DragHandle = styled.div`
    border-right: 1px solid #f0f0f0;
    padding: 20px;

    display: flex;
    justify-content: center;
    align-items: center;

    * {
        color: #f0f0f0;
        font-size: 32px;
    }
`;

const Content = styled.div`
    padding: 8px;
    width: 50%;
`;

const CloseWrapper = styled.div`
    padding: 8px;
`;

const Handle = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 2px;
`;

const HandlePoint = styled.div`
    padding: 2px;
    background: #fffdfd 0% 0% no-repeat padding-box;
    border: 1px solid hsla(0, 0%, 70%, 1);
    border-radius: 100%;
`;

const ItemSelected = ({attributeChecked, removeAttributeChecked, stateListAttribute}: ItemSelectedProps) => {
    const {t} = useTranslation();
    return (
        <CustomCard>
            <DragHandle>
                <Handle>
                    {[...Array(8)].map((useless, index) => (
                        <HandlePoint key={index} />
                    ))}
                </Handle>
            </DragHandle>
            <Content>
                <Descriptions
                    title={
                        <TextAttribute>
                            {stateListAttribute.lang &&
                            localizedLabel(attributeChecked.label, stateListAttribute.lang) ? (
                                <span>
                                    {localizedLabel(attributeChecked.label, stateListAttribute.lang)}
                                    <SmallText>{attributeChecked.id}</SmallText>
                                </span>
                            ) : (
                                attributeChecked.id
                            )}
                        </TextAttribute>
                    }
                >
                    <Descriptions.Item label={t('attributes-list.items-selected.library')}>
                        {attributeChecked.library}
                    </Descriptions.Item>
                </Descriptions>
            </Content>
            <CloseWrapper>
                <Button
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={() => {
                        removeAttributeChecked(attributeChecked);
                    }}
                />
            </CloseWrapper>
        </CustomCard>
    );
};

export default ItemSelected;
