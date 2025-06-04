// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, ReactNode, useContext, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {iframe} from './PanelCustom.module.css';
import {EditRecordModal, EditRecordPage, LangContext, useIFrameMessenger} from '@leav/ui';
import {KitAlert, KitModal, KitSidePanel, useKitNotification} from 'aristid-ds';
import {ComponentPropsWithKey} from '_ui/hooks/useIFrameMessenger/types';
import {SIDE_PANEL_CONTENT_ID} from '../../constants';

interface IPanelCustomProps {
    source: string;
    searchQuery: string;
    title: string;
}

export const PanelCustom: FunctionComponent<IPanelCustomProps> = ({source, searchQuery, title}) => {
    const {kitNotification} = useKitNotification();

    const [sidePanelContent, setSidePanelContent] = useState<ReactNode | null>(null);
    const [editRecordModalProps, setEditRecordModalProps] = useState<
        ComponentPropsWithKey<typeof EditRecordModal> | {open: false} | null
    >(null);

    const {changeLangInAllFrames} = useIFrameMessenger({
        handlers: {
            onSidePanelForm(data) {
                setSidePanelContent(
                    <EditRecordPage {...data} showRefreshButton={false} onClose={() => setSidePanelContent(null)} />
                );
            },
            onModalConfirm(data) {
                KitModal[data.type]?.({
                    type: data.type,
                    title: data.title,
                    content: data.content,
                    okCancel: true,
                    onOk: data.onOk,
                    onCancel: data.onCancel
                });
            },
            onModalForm(data) {
                if (data.open === false) {
                    setEditRecordModalProps(null);
                } else {
                    setEditRecordModalProps({
                        ...data,
                        open: true,
                        key: Date.now(),
                        onClose: () => {
                            setEditRecordModalProps(null);
                            data.onClose();
                        }
                    });
                }
            },
            onAlert(data) {
                KitAlert[data.type]?.({
                    ...data
                });
            },
            onNotification(data) {
                kitNotification.open({
                    ...data
                });
            }
        }
    });

    const {lang} = useContext(LangContext);

    useEffect(() => {
        changeLangInAllFrames(lang[0]);
    }, [lang]);

    return (
        <>
            <iframe
                className={iframe}
                name="testFrame"
                src={source + searchQuery}
                title={title}
                width="100%"
                height="100%"
            />
            {sidePanelContent !== null &&
                createPortal(
                    <KitSidePanel
                        floating
                        closable
                        size="m"
                        onClose={() => {
                            setSidePanelContent(null);
                        }}
                    >
                        <div style={{height: '100%'}}>{sidePanelContent}</div>
                    </KitSidePanel>,
                    document.getElementById(SIDE_PANEL_CONTENT_ID)
                )}
            <EditRecordModal
                onClose={null /* TODO: find why mandatory */}
                open={false}
                record={null}
                library={null}
                {...(editRecordModalProps ?? {})}
            />
        </>
    );
};
