/**
 * Callbacks provided by a child iframe when it opens the thread flap via `navigateToPanel`.
 * app-studio stays domain-agnostic: it forwards "a thread action happened" signals; it never
 * knows the opener emits a Matomo event (with its own custom dimensions) on the other side.
 *
 * Unlike panelCloseCallbacks (consume-once on close), these are multi-fire for the whole life
 * of the flap: each action can happen several times while the flap is open.
 */

export type ThreadActionCallbacks = {
    onCommentSubmitted?: () => void;
    onCommentMentionAdded?: () => void;
    onDiscussionStatusChanged?: () => void;
};

type FlapKeyElements = {
    where: string;
};

const store = new Map<string, ThreadActionCallbacks>();

export const getThreadActionCallbackKey = ({where}: FlapKeyElements): string => where;

export const registerThreadActionCallbacks = (keyElements: FlapKeyElements, callbacks: ThreadActionCallbacks): void => {
    store.set(getThreadActionCallbackKey(keyElements), callbacks);
};

export const getThreadActionCallbacks = ({where}: FlapKeyElements): ThreadActionCallbacks | undefined =>
    store.get(getThreadActionCallbackKey({where}));

export const clearThreadActionCallbacks = (keyElements: FlapKeyElements): void => {
    store.delete(getThreadActionCallbackKey(keyElements));
};
