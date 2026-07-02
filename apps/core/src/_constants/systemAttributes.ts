/**
 * Identifiers of the attributes created out-of-the-box by core at startup, grouped by system library.
 *
 * Convenience references to *built-in* system attributes. Attribute id fields stay typed as `string`
 * everywhere (dynamic-schema framework: applications add their own attributes at runtime).
 *
 * One enum per system library (even empty, e.g. UsersGroupsAttributes) keeps the structure homogeneous
 * and ready to host future attributes.
 */

/** Attributes present on (almost) every record. */
export enum CommonAttributes {
    ID = 'id',
    UUID = 'uuid',
    ACTIVE = 'active',
    LABEL = 'label',
    CREATED_BY = 'created_by',
    CREATED_AT = 'created_at',
    MODIFIED_BY = 'modified_by',
    MODIFIED_AT = 'modified_at',
    DISCUSSION_THREADS = 'discussion_threads', // link attribute to the discussion_threads library (same value, different concept)
}

export enum UsersAttributes {
    LOGIN = 'login',
    EMAIL = 'email',
    PASSWORD = 'password',
    USER_GROUPS = 'user_groups', // 'user_groups' (the attribute), distinct from the 'users_groups' library/tree
}

// Empty placeholder: the users_groups library carries only common attributes today.
export enum UsersGroupsAttributes {}

export enum FilesAttributes {
    ROOT_KEY = 'root_key',
    FILE_PATH = 'file_path',
    FILE_NAME = 'file_name',
    INODE = 'inode',
    ACTIVE = 'active',
    HASH = 'hash',
    FILE_SIZE = 'file_size',
    MIME_TYPE1 = 'mime_type1',
    MIME_TYPE2 = 'mime_type2',
    HAS_CLIPPING_PATH = 'has_clipping_path',
    COLOR_SPACE = 'color_space',
    COLOR_PROFILE = 'color_profile',
    WIDTH = 'width',
    HEIGHT = 'height',
    PRINT_WIDTH = 'print_width',
    PRINT_HEIGHT = 'print_height',
    RESOLUTION = 'resolution',
}

export enum StatusesAttributes {
    LABEL = 'statuses_label',
    COLOR = 'statuses_color',
    ICON_ID = 'statuses_id_icon',
    STATUS_TYPE = 'statuses_status_type',
}

export enum StatusTypesAttributes {
    LABEL = 'status_types_label',
    COLOR = 'status_types_color',
    ICON = 'status_types_icon',
    VALUE = 'status_types_value',
}

export enum DiscussionThreadsAttributes {
    COMMENTS = 'discussion_threads_comments',
    STATUS = 'discussion_threads_status',
}

export enum DiscussionCommentsAttributes {
    CONTENT = 'discussion_comments_text',
    THREAD = 'discussion_comments_thread',
}

// SDO application-tracability attributes, present on every library (see BASE_ATTRIBUTES).
export enum SdoAttributes {
    APPLICATION_IDS = 'sdo_application_ids', // TEXT holding a JSON string: legacy internal ids per application
    CREATOR_CLIENT_ID = 'sdo_creator_client_id', // TEXT: clientId of the application that created the record
}

// Suffixes used to build the per-library preview attribute names, e.g. `${SystemLibrary.FILES}_previews`.
export const PREVIEWS_ATTRIBUTE_SUFFIX = 'previews';
export const PREVIEWS_STATUS_ATTRIBUTE_SUFFIX = 'previews_status';

// Base attributes linked to every standard library at creation.
// Typed as string[] so membership checks against arbitrary attribute ids stay ergonomic.
export const BASE_ATTRIBUTES: string[] = [
    CommonAttributes.ID,
    CommonAttributes.UUID,
    CommonAttributes.MODIFIED_BY,
    CommonAttributes.MODIFIED_AT,
    CommonAttributes.CREATED_BY,
    CommonAttributes.CREATED_AT,
    CommonAttributes.ACTIVE,
    CommonAttributes.DISCUSSION_THREADS,
    SdoAttributes.APPLICATION_IDS,
    SdoAttributes.CREATOR_CLIENT_ID,
];

// Default values seeded into the status_types library.
export const STATUS_TYPES_DEFAULT_VALUES = ['TODO', 'DOING', 'DONE'];
