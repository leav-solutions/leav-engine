import {HeartOutlined, InfoOutlined, SelectOutlined, SettingOutlined, ShareAltOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Button, Card} from 'antd';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import styled, {CSSObject} from 'styled-components';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {localizedLabel} from '../../../utils';
import {ILibrary} from '../../../_types/types';

interface ILibraryCardProps {
    lib: ILibrary;
}

interface IActionsWrapperProps {
    showActions?: boolean;
    style?: CSSObject;
}

const ActionsWrapper = styled.div<IActionsWrapperProps>`
    opacity: ${({showActions}) => (showActions ? 1 : 0)};
`;

function LibraryCard({lib}: ILibraryCardProps): JSX.Element {
    const history = useHistory();
    const [showActions, setShowActions] = useState<boolean>(false);

    const goLib = () => {
        const detailUrl = `/library/items/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`;
        history.push(detailUrl);
    };

    const handleChangeLibSelected = () => {
        history.push(`/library/list/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`);
    };

    const displayActions = () => setShowActions(true);
    const hideActions = () => setShowActions(false);

    const {data: dataLang} = useQuery(getLang);

    // handle case dataLang is null
    const {lang} = dataLang ?? {lang: []};

    return (
        <Card key={lib.id} onMouseEnter={displayActions} onMouseLeave={hideActions}>
            <Card title={localizedLabel(lib.label, lang) ?? lib.id}>
                <Card.Meta>{lib.id}</Card.Meta>

                <>
                    <ActionsWrapper showActions={showActions}>
                        <Button.Group>
                            <Button icon={<ShareAltOutlined />} onClick={goLib} />
                            <Button icon={<SelectOutlined />} />
                            <Button icon={<HeartOutlined />} />
                            <Button icon={<SettingOutlined />} />
                            <Button icon={<InfoOutlined />} onClick={handleChangeLibSelected} />
                        </Button.Group>
                    </ActionsWrapper>
                </>
            </Card>
        </Card>
    );
}

export default LibraryCard;
