/**
 * Identifiers of the libraries created out-of-the-box by core at startup.
 *
 * These enums are a convenience to reference *built-in* system libraries from core's own logic.
 * Library id fields stay typed as `string` everywhere (LEAV is a dynamic-schema framework:
 * applications add their own libraries at runtime, without declaring them in code).
 */
export enum SystemLibraries {
    USERS = 'users',
    USERS_GROUPS = 'users_groups',
    FILES = 'files',
    FILES_DIRECTORIES = 'files_directories',
    STATUSES = 'statuses',
    STATUS_TYPES = 'status_types',
    DISCUSSION_THREADS = 'discussion_threads',
    DISCUSSION_COMMENTS = 'discussion_comments',
}
