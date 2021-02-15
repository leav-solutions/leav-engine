// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Button, Descriptions} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {localizedLabel} from '../../../../utils';
import {ISelectedAttribute} from '../../../../_types/types';
import {AttributesSelectionListActionTypes} from '../../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../../reducer/attributesSelectionListStateContext';
import {SmallText, TextAttribute} from '../../sharedComponents';

interface ISelectedAttributeProps {
    selectedAttribute: ISelectedAttribute;
    handleProps: any;
}

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
    grid-gap: 3px;
`;

const HandlePoint = styled.div`
    padding: 2px;
    background: hsla(0, 0%, 70%, 1);
    border-radius: 100%;
`;

const SelectedAttribute = ({selectedAttribute, handleProps}: ISelectedAttributeProps) => {
    const [{lang}] = useLang();
    const {t} = useTranslation();
    const {dispatch} = useAttributesSelectionListState();

    const label = localizedLabel(selectedAttribute.label, lang); //localizedLabel(attribute.label, lang);

    const _handleUnselectAttribute = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: selectedAttribute
        });
    };

    return (
        <>
            <DragHandle {...handleProps}>
                <Handle>
                    {[...Array(8)].map((_, index) => (
                        <HandlePoint key={index} />
                    ))}
                </Handle>
            </DragHandle>

            <Content>
                <Descriptions
                    title={
                        <TextAttribute>
                            {label ? (
                                <span>
                                    {label}
                                    <SmallText>{selectedAttribute.id}</SmallText>
                                </span>
                            ) : (
                                selectedAttribute.id
                            )}
                        </TextAttribute>
                    }
                >
                    <Descriptions.Item label={t('attributes-list.items-selected.library')}>
                        {selectedAttribute.library}
                    </Descriptions.Item>
                </Descriptions>
            </Content>
            <CloseWrapper>
                <Button icon={<CloseOutlined />} size="small" onClick={_handleUnselectAttribute} />
            </CloseWrapper>
        </>
    );
};

export default SelectedAttribute;
