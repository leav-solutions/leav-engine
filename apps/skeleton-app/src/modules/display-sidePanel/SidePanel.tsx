// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitAlert, KitModal, KitSidePanel, useKitNotification} from 'aristid-ds';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {ComponentProps, FunctionComponent, ReactNode, useRef, useState} from 'react';
import {EditRecordModal, EditRecordPage} from '_ui/components';
import {useIFrameMessenger} from '_ui/hooks';
import {ComponentPropsWithKey} from '_ui/hooks/useIFrameMessenger/types';

export const SidePanel: FunctionComponent = () => {
    const panelRef = useRef<KitSidePanelRef | null>(null);
    const [content, setContent] = useState<ReactNode>(null);
    const [customSidePanelProps, setCustomdSidePanelProps] = useState<ComponentPropsWithKey<typeof KitSidePanel>>({});
    const [editRecordModalProps, setEditRecordModalProps] = useState<ComponentPropsWithKey<
        typeof EditRecordModal
    > | null>();
    const {kitNotification} = useKitNotification();

    const toastAlert = (data: ComponentProps<typeof KitAlert>) => {
        KitAlert[data.type]?.(data);
    };

    useIFrameMessenger({
        handlers: {
            onSidePanelForm: data => {
                setCustomdSidePanelProps(null);
                setEditRecordModalProps(null);
                setContent(
                    <EditRecordPage {...data} showRefreshButton={false} onClose={() => panelRef?.current.close()} />
                );
                panelRef.current?.open();
            },
            onModalConfirm(data, id, dispatch, callCallback) {
                KitModal[data.type ?? 'confirm']?.({
                    type: data.type,
                    title: data.title,
                    content: data.content,
                    okCancel: true,
                    onOk: data.onOk,
                    onCancel: data.onCancel
                });
            },
            onModalForm(data, id, dispatch, callCallback) {
                setEditRecordModalProps({
                    ...data,
                    open: true,
                    key: Date.now(),
                    onClose: () => {
                        setEditRecordModalProps(null);
                        data.onClose();
                    }
                });
            },
            onAlert(data, id, dispatch, callCallback) {
                toastAlert({
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

    return (
        <>
            <KitSidePanel
                floating
                closable
                {...customSidePanelProps}
                onClose={() => setContent(null)}
                ref={panelRef}
                size="m"
            >
                <div style={{height: '100%'}}>{content}</div>
            </KitSidePanel>
            <EditRecordModal
                open={false}
                record={null}
                library={null}
                onClose={() => null}
                {...(editRecordModalProps || {})}
            />
        </>
    );
};
