/**
 * Identifiers of the trees created out-of-the-box by core at startup.
 *
 * Convenience references to *built-in* system trees. Tree id fields stay typed as `string`
 * everywhere (dynamic-schema framework: applications add their own trees at runtime).
 */
export enum SystemTrees {
    USERS_GROUPS = 'users_groups', // same value as the users_groups library, distinct concept
    FILES = 'files_tree',
    DISCUSSION_THREAD_STATUSES = 'discussion_thread_statuses_tree',
}
