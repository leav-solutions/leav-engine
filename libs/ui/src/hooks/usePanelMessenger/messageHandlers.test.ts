import {decodeMessage, encodeMessage, getExposedMethods, initClientHandlers} from './messageHandlers';
import {type Message} from './types';

describe('MessageHandlers', () => {
    describe('getExposedMethods', () => {
        const dispatchMock = jest.fn();
        const fakeTime = 1748350849872;
        jest.spyOn(Date, 'now').mockReturnValue(fakeTime);

        beforeEach(() => {
            dispatchMock.mockClear();
        });

        it('Should provide these methods', async () => {
            const providedMethods = getExposedMethods({current: null}, jest.fn());

            expect(providedMethods).toEqual({
                showModalConfirm: expect.any(Function),
                showAlert: expect.any(Function),
                showNotification: expect.any(Function),
                messageToParent: expect.any(Function),
                messageToPanel: expect.any(Function),
                navigateToPanel: expect.any(Function),
                navigateToIframe: expect.any(Function),
                closePanel: expect.any(Function),
                openFlapPanel: expect.any(Function),
                closeFlapPanel: expect.any(Function),
                getPanelConfig: expect.any(Function),
                getUrl: expect.any(Function),
                explorerViewChanged: expect.any(Function),
            });
        });

        it('Should expose method showModalConfirm which dispatch to parent and store callback', async () => {
            const data: any = {someField: 'someValue', someCallback: jest.fn()};
            const callbacksStore = {current: {}};

            const {showModalConfirm} = getExposedMethods(callbacksStore, dispatchMock);
            showModalConfirm(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'modal-confirm',
                data,
                id: String(fakeTime),
                overrides: ['someCallback'],
            });
            expect(callbacksStore.current).toEqual({
                [String(fakeTime)]: {
                    someCallback: data.someCallback,
                },
            });
        });

        it('Should expose method showAlert which dispatch to parent and store callback', async () => {
            const data: any = {someField: 'someValue', someCallback: jest.fn()};
            const callbacksStore = {current: {}};

            const {showAlert} = getExposedMethods(callbacksStore, dispatchMock);
            showAlert(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'alert',
                data,
                id: String(fakeTime),
                overrides: ['someCallback'],
            });
            expect(callbacksStore.current).toEqual({
                [String(fakeTime)]: {
                    someCallback: data.someCallback,
                },
            });
        });

        it('Should expose method showNotification which dispatch to parent and store callback', async () => {
            const data: any = {someField: 'someValue', someCallback: jest.fn()};
            const callbacksStore = {current: {}};

            const {showNotification} = getExposedMethods(callbacksStore, dispatchMock);
            showNotification(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'notification',
                data,
                id: String(fakeTime),
                overrides: ['someCallback'],
            });
            expect(callbacksStore.current).toEqual({
                [String(fakeTime)]: {
                    someCallback: data.someCallback,
                },
            });
        });

        it('Should expose method messageToParent which dispatch to parent', async () => {
            const data: any = {someField: 'someValue'};

            const {messageToParent} = getExposedMethods({current: null}, dispatchMock);
            messageToParent(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'message', data, id: String(fakeTime)});
        });

        it('Should expose method messageToPanel which dispatch to other panels', async () => {
            const data: any = {someField: 'someValue'};

            const {messageToPanel} = getExposedMethods({current: null}, dispatchMock);
            messageToPanel(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'message-to-panel', data});
        });

        it('Should expose method navigateToPanel which open given panel', async () => {
            const data: any = {someField: 'someValue'};

            const {navigateToPanel} = getExposedMethods({current: {}}, dispatchMock);
            navigateToPanel(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'navigate-to-panel',
                data,
                id: expect.any(String),
                overrides: [],
            });
        });

        it('Should store the onClose callback passed to navigateToPanel and send it as an override', async () => {
            const onClose = jest.fn();
            const data: any = {someField: 'someValue', onClose};
            const callbacksStore = {current: {}};

            const {navigateToPanel} = getExposedMethods(callbacksStore, dispatchMock);
            navigateToPanel(data);

            const dispatched = dispatchMock.mock.calls[0][0];
            expect(dispatched.type).toBe('navigate-to-panel');
            expect(dispatched.overrides).toEqual(['onClose']);
            expect(callbacksStore.current[dispatched.id].onClose).toBe(onClose);
        });

        it('Should expose method navigateToIframe which open given iframe panel', async () => {
            const data: any = {someField: 'someValue'};

            const {navigateToIframe} = getExposedMethods({current: null}, dispatchMock);
            navigateToIframe(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'navigate-to-iframe', data});
        });

        it('Should expose method closePanel which close previous opened panel', async () => {
            const data: any = {someField: 'someValue'};

            const {closePanel} = getExposedMethods({current: null}, dispatchMock);
            closePanel(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'close-panel', data});
        });

        it('Should expose method explorerViewChanged which notifies parent of a view change', async () => {
            const data: any = {serializedView: {viewType: 'table', attributesIds: ['attr1']}};

            const {explorerViewChanged} = getExposedMethods({current: null}, dispatchMock);
            explorerViewChanged(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'explorer-view-changed', data});
        });
    });

    describe('initClientHandlers', () => {
        const callCbMock = jest.fn();
        const dispatchMock = jest.fn();
        const callbacksStore = {current: {}};

        beforeEach(() => {
            callCbMock.mockClear();
            dispatchMock.mockClear();
        });

        it('should call onExplorerViewChanged when receiving explorer-view-changed', () => {
            const onExplorerViewChanged = jest.fn();
            const handlers = initClientHandlers(callCbMock, {handlers: {onExplorerViewChanged}}, callbacksStore);

            handlers(
                {type: 'explorer-view-changed', data: {serializedView: {viewType: 'table', attributesIds: ['attr1']}}},
                dispatchMock,
            );

            expect(onExplorerViewChanged).toHaveBeenCalledWith({
                serializedView: {viewType: 'table', attributesIds: ['attr1']},
            });
        });

        it('should call onViewConfigUpdate when receiving view-config-update', () => {
            const onViewConfigUpdate = jest.fn();
            const handlers = initClientHandlers(callCbMock, {handlers: {onViewConfigUpdate}}, callbacksStore);

            handlers(
                {
                    type: 'view-settings-update',
                    data: {targetPanelId: 'explorer-panel-1', serializedView: {viewType: 'list'}},
                },
                dispatchMock,
            );

            expect(onViewConfigUpdate).toHaveBeenCalledWith({
                targetPanelId: 'explorer-panel-1',
                serializedView: {viewType: 'list'},
            });
        });
    });

    describe('encode - decode Message', () => {
        it('Should encode a structure above message with `__frameId`', async () => {
            const message = {
                __frameId: '__frameId',
                type: 'change-language',
                language: 'fr',
            } as const;

            const encodedMessage = encodeMessage(message);

            expect(encodedMessage).toBe(
                '{"payload":"{\\"__frameId\\":\\"__frameId\\",\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":true}',
            );
        });

        it('Should encode a structure above message without `__frameId`', async () => {
            const message: Message = {
                type: 'change-language',
                language: 'fr',
            };

            const encodedMessage = encodeMessage(message);

            expect(encodedMessage).toBe(
                '{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":true}',
            );
        });

        it('Should decode to `undefined` on packetId false or not present', async () => {
            expect(
                decodeMessage(
                    '{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":false}',
                ),
            ).toBeUndefined();
            expect(
                decodeMessage('{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}"}'),
            ).toBeUndefined();
        });

        it('Should decode to `undefined` on if parsing on error', async () => {
            expect(decodeMessage('{this is not a json valid')).toBeUndefined();
        });

        it('Should decode the payload', async () => {
            expect(
                decodeMessage(
                    '{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":true}',
                ),
            ).toEqual({language: 'fr', type: 'change-language'});
        });

        it('Should create a couple of idempotente functions', async () => {
            const data: Message = {
                __frameId: '__frameId',
                type: 'on-call-callback',
                path: 'path',
                data: 'data',
            };

            expect(decodeMessage(encodeMessage(data))).toEqual(data);
        });
    });
});
