import {type IUseMessagesHook} from '../useMessages';

const mockUseMessages = (): IUseMessagesHook => ({
    messages: [],
    addMessage: vi.fn(),
    removeMessage: vi.fn(),
});

export default mockUseMessages;
