// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExportOutlined, HeartOutlined, HeartFilled, InfoCircleOutlined, ToolOutlined} from '@ant-design/icons';
import {Card, Divider, Drawer, Col} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useLang} from '../../hooks/LangHook/LangHook';
import {localizedLabel} from '../../utils';
import {ITree} from '../../_types/types';

interface ITreeItemProps {
    tree: ITree;
    isFavorite?: boolean;
    onUpdateFavorite: (libId: string) => Promise<void>;
}

function TreeItem({tree, isFavorite = false, onUpdateFavorite}: ITreeItemProps): JSX.Element {
    const [showInfo, setShowInfo] = useState(false);

    const {t} = useTranslation();

    const [{lang}] = useLang();

    const history = useHistory();

    const goTree = () => {
        const detailUrl = `/navigation/${tree.id}`;
        history.push(detailUrl);
    };

    const title = localizedLabel(tree.label, lang) ?? tree.id;

    const _handleFavoriteClick = async () => {
        await onUpdateFavorite(tree.id);
    };

    return (
        <>
            <Drawer width="20rem" visible={showInfo} title={title} onClose={() => setShowInfo(false)}>
                <h2>{t('navigation.list.info.tree')}</h2>
                <p>
                    {t('navigation.list.info.id')}: {tree.id}
                </p>
                <p>
                    {t('navigation.list.info.label')}: {title}
                </p>

                <Divider />

                {tree.libraries.map(lib => (
                    <div key={tree.id + lib.library.id}>
                        <h2>{t('navigation.list.info.library')}</h2>
                        <p>
                            {t('navigation.list.info.id')}: {lib.library.id}
                        </p>
                        <p>
                            {t('navigation.list.info.label')}: {localizedLabel(lib.library.label, lang) ?? lib.library.id}
                        </p>
                    </div>
                ))}
            </Drawer>
            <Col span={6}>
                <Card
                    key={tree.id}
                    hoverable
                    actions={[
                        <ExportOutlined onClick={goTree} />,
                        isFavorite ? <HeartFilled onClick={_handleFavoriteClick}/> : <HeartOutlined onClick={_handleFavoriteClick}/>,
                        <ToolOutlined />,
                        <InfoCircleOutlined onClick={() => setShowInfo(true)} />
                    ]}
                >
                    <Card.Meta>{tree.id}</Card.Meta>
                    <Card.Meta title={title} description={tree.id} />
                </Card>
            </Col>
        </>
    );
}

export default TreeItem;
