// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, HolderOutlined} from '@ant-design/icons';
import {localizedTranslation} from '@leav/utils';
import {Button, Space} from 'antd';
import styled from 'styled-components';
import {useLang} from '_ui/hooks';
import {ISelectedAttribute} from '_ui/types/attributes';
import {AttributesSelectionListActionTypes} from '../../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../../reducer/attributesSelectionListStateContext';
import {SmallText, TextAttribute} from '../../sharedComponents';

interface ISelectedAttributeProps {
    selectedAttribute: ISelectedAttribute;
    handleProps: any;
}

const DragHandle = styled.div`
    border-right: 1px solid #f0f0f0;
    padding: 0.5em;
    display: flex;
    align-items: center;
`;

const Content = styled(Space)`
    padding: 0.5em;
    flex-grow: 1;
`;

const CloseWrapper = styled.div`
    padding: 8px;
`;

const SelectedAttribute = ({selectedAttribute, handleProps}: ISelectedAttributeProps) => {
    const {lang} = useLang();
    const {dispatch} = useAttributesSelectionListState();

    const label = localizedTranslation(selectedAttribute.label, lang);

    const _handleUnselectAttribute = () => {
        dispatch({
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: selectedAttribute
        });
    };

    return (
        <>
            <DragHandle {...handleProps}>
                <HolderOutlined />
            </DragHandle>

            <Content direction="vertical">
                <TextAttribute>{label ?? selectedAttribute.id}</TextAttribute>
                {label && (
                    <div>
                        <SmallText>{selectedAttribute.id}</SmallText>
                    </div>
                )}
            </Content>
            <CloseWrapper>
                <Button icon={<CloseOutlined />} size="small" onClick={_handleUnselectAttribute} />
            </CloseWrapper>
        </>
    );
};

export default SelectedAttribute;
