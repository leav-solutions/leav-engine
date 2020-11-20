import {ExportOutlined, HeartOutlined, InfoCircleOutlined, ToolOutlined} from '@ant-design/icons';
import {Card, Divider, Drawer} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useLang} from '../../hooks/LangHook';
import {localizedLabel} from '../../utils';
import {ITree} from '../../_types/types';

interface ITreeItemProps {
    tree: ITree;
}

function TreeItem({tree}: ITreeItemProps): JSX.Element {
    const [showInfo, setShowInfo] = useState(false);

    const {t} = useTranslation();

    const [{lang}] = useLang();

    const history = useHistory();

    const goTree = () => {
        const detailUrl = `/navigation/${tree.id}`;
        history.push(detailUrl);
    };

    const title = localizedLabel(tree.label, lang) ?? tree.id;

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
                    <div key={lib.id}>
                        <h2>{t('navigation.list.info.library')}</h2>
                        <p>
                            {t('navigation.list.info.id')}: {lib.id}
                        </p>
                        <p>
                            {t('navigation.list.info.label')}: {localizedLabel(lib.label, lang) ?? lib.id}
                        </p>
                    </div>
                ))}
            </Drawer>
            <Card
                actions={[
                    <ExportOutlined onClick={goTree} />,
                    <HeartOutlined />,
                    <ToolOutlined />,
                    <InfoCircleOutlined onClick={() => setShowInfo(true)} />
                ]}
            >
                <Card.Meta>{tree.id}</Card.Meta>
                <Card.Meta title={title} description={tree.id} />
            </Card>
        </>
    );
}

export default TreeItem;
