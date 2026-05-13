import {Card} from 'antd';
import {KitApp} from 'aristid-ds';
import {GLOBAL_BASE_URL} from '../../constants';
import styled from 'styled-components';

interface IContentWrapperProps {
    children: React.ReactNode;
}

const Background = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #8051fc;
`;

const Wrapper = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10%;
`;

const ContentBlock = styled(Card)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`;

export default function ContentWrapper({children}: IContentWrapperProps) {
    return (
        <Background>
            <Wrapper>
                <ContentBlock
                    title={<img src={`${GLOBAL_BASE_URL}/global-icon/small`} height="100px" alt="" />}
                    styles={{header: {textAlign: 'center', padding: '1rem'}}}
                >
                    <KitApp>{children}</KitApp>
                </ContentBlock>
            </Wrapper>
        </Background>
    );
}
