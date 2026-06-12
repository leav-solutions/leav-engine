import {type Options} from 'amqplib';
import {type IKeyValue} from './shared';
import {
    type PermissionsActions,
    type AdminPermissionsActions,
    type ApplicationPermissionsActions,
    type AttributePermissionsActions,
    type LibraryPermissionsActions,
    type PermissionTypes,
    type RecordAttributePermissionsActions,
    type RecordPermissionsActions,
    type TreeNodePermissionsActions,
    type TreePermissionsActions,
    type AttributeDependentValuesPermissionsActions,
} from './permissions';

export interface IConfig {
    coreModes: CoreMode[];
    server: IServer;
    db: IDb;
    diskCache: IDiskCache;
    dataLoaders: IDataLoaders;
    auth: IAuth;
    mailer: IMailer;
    lang: ILang;
    permissions: IPermissions;
    amqp: IAmqp;
    redis: IRedis;
    filesManager: IFilesManager;
    indexationManager: IIndexationManager;
    tasksManager: ITasksManager;
    eventsManager: IEventsManager;
    notification: INotificationConfig;
    debug?: boolean;
    env?: string;
    defaultUserId: string;
    export: IExport;
    import: IImport;
    plugins: IKeyValue<IKeyValue<any>>;
    preview: IPreview;
    applications: IApplicationsConfig;
    actions: IActions;
    files: IFilesConfig;
    dbProfiler: IDbProfilerConfig;
    instanceId: string;
    elasticsearch: IElasticsearchConfig;
    logsCollector: ILogsCollector;
    pluginsPath: string[];
    bugsnag: IBugsnag;
    matomo: IMatomo;
    automation: IAutomation;
    sdo: ISdo;
}

export interface ISdo {
    amqp: Options.Connect;
    import: {
        enable: boolean;
        prefetch?: number;
        queue?: string;
        exchange?: string;
    };
    export: {
        enable: boolean;
        exchange?: string;
        type?: string;
        dataEventsQueue?: string;
    };
}

export interface IAutomation {
    enable: boolean;
    cache: IAutomationCache;
    queues: {
        events: string;
    };
}

export interface IAutomationCache {
    enable: boolean;
}

export enum CoreMode {
    SERVER = 'server',
    MIGRATE = 'migrate',
    FILES_MANAGER = 'filesManager',
    INDEXATION_MANAGER = 'indexationManager',
    TASKS_MANAGER_MASTER = 'tasksManager:master',
    TASKS_MANAGER_WORKER = 'tasksManager:worker',
    LOGS_COLLECTOR = 'logsCollector',
    AUTOMATION = 'automation',
    SDO = 'sdo',

    /**
     * Default, to do db migration, or import ...
     */
    CLI = 'cli',

    /**
     * Alias for [
     *   CoreMode.SERVER,
     *   CoreMode.INDEXATION_MANAGER,
     *   CoreMode.TASKS_MANAGER_MASTER,
     *   CoreMode.TASKS_MANAGER_WORKER,
     *   CoreMode.AUTOMATION,
     * ]
     */
    E2E_PLAYWRIGHT = 'e2ePlaywright',
}

export const CORE_MODES_E2E_PLAYWRIGHT = [
    CoreMode.SERVER,
    CoreMode.INDEXATION_MANAGER,
    CoreMode.TASKS_MANAGER_MASTER,
    CoreMode.TASKS_MANAGER_WORKER,
    CoreMode.AUTOMATION,
    // no CoreMode.LOGS_COLLECTOR yet because not needed in e2e tests, need elasticsearch
    // no CoreMode.FILES_MANAGER yet because not needed in e2e tests
];

export interface IServer {
    host: string;
    port: number;
    keepAliveTimeout: number;
    publicUrl: string;
    basePath: string;
    allowIntrospection: boolean;
    uploadLimit: number | string;
    supportEmail: string;
    trpc: {
        ssePingIntervalMs: number;
    };
    admin: {
        login: string;
        password: string;
        email: string;
    };
    systemUser: {
        email: string;
    };
    enableTracer: boolean;
}

export interface IActions {
    excel: {
        /**
         * Add debug log for each calculation with formula and result or error
         */
        debug: boolean;
    };
    jexl: {
        /**
         * Add debug log for each calculation with formula and result or error
         */
        debug: boolean;
    };
}

export interface IDb {
    url: string;
    name: string;
}

export interface IAuth {
    scheme: string;
    key: string;
    algorithm: string;
    tokenExpiration: string;
    refreshTokenExpiration: string;
    cookie: {
        sameSite: 'none' | 'lax' | 'strict';
        secure: boolean;
        /**
         * Do not set cookie domain to avoid sharing cookies between subdomains
         * https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies#domain
         * @default false
         */
        withDomain: boolean;
    };
    resetPasswordExpiration: string;
    oidc:
        | {
              enable: false;
              wellKnownEndpoint?: string;
              clientId?: string;
              postLogoutRedirectUri?: string;
              skipLogoutConfirmationPage?: boolean;
              idTokenUserClaim?: string;
              verificationKeysExpiration: string;
          }
        | {
              enable: true;
              wellKnownEndpoint: string;
              clientId: string;
              postLogoutRedirectUri: string;
              skipLogoutConfirmationPage?: boolean;
              idTokenUserClaim: string;
              idTokenUserUuidClaim: string;
              enableAutoProvisioning: boolean;
              retryAuthenticationFlowAfterExpiry: boolean;
              verificationKeysExpiration: string;
          };
    testApiKey?: string;

    /**
     * Enable some silly/debug/error logs in auth/oidc services
     */
    debugLog?: boolean;
}

export interface IMailer {
    host: string;
    port: number;
    /**
     * If true, use SSL/TLS connection (usually port 465). If false, use STARTTLS (usually port 587)
     */
    secure: boolean;

    /**
     * If true, require TLS for the connection (STARTTLS). Only used if secure is false
     */
    requireTLS: boolean;
    from: {
        name: string;
        email: string;
    };
    auth: {
        user: string;
        password: string;
    };
}

export interface ILang {
    available: string[];
    default: string;
}

type IPermissionsByActions<PermissionActions extends PermissionsActions> = {[P in PermissionActions]?: boolean} & {
    default?: boolean;
};

interface IPermissionsByTypesAndActions {
    default: boolean;
    [PermissionTypes.ADMIN]?: IPermissionsByActions<AdminPermissionsActions>;
    [PermissionTypes.APPLICATION]?: IPermissionsByActions<ApplicationPermissionsActions>;
    [PermissionTypes.ATTRIBUTE]?: IPermissionsByActions<AttributePermissionsActions>;
    [PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES]?: IPermissionsByActions<AttributeDependentValuesPermissionsActions>;
    [PermissionTypes.LIBRARY]?: IPermissionsByActions<LibraryPermissionsActions>;
    [PermissionTypes.RECORD]?: IPermissionsByActions<RecordPermissionsActions>;
    [PermissionTypes.RECORD_ATTRIBUTE]?: IPermissionsByActions<RecordAttributePermissionsActions>;
    [PermissionTypes.TREE]?: IPermissionsByActions<TreePermissionsActions>;
    [PermissionTypes.TREE_NODE]?: IPermissionsByActions<TreeNodePermissionsActions>;
    [PermissionTypes.TREE_LIBRARY]?: IPermissionsByActions<TreeNodePermissionsActions>;
}

export interface IPermissions {
    everybody: IPermissionsByTypesAndActions;
    adminGroup: IPermissionsByTypesAndActions;
    enableCache: boolean;
}

export interface IAmqp {
    connOpt: Options.Connect;
    exchange: string;
    type: string;
    prefetch?: number;
}

export interface IRedis {
    host: string;
    port: number;
    cacheDatabase: number;
    sessionDatabase: number;
}

export interface IFilesManager {
    queues: {
        events: string;
        previewRequest: string;
        previewResponse: string;
    };
    routingKeys: {
        events: string;
        previewRequest: string;
        previewResponse: string;
    };
    rootKeys: {
        files1: string;
    };
    allowFilesList: string;
    ignoreFilesList: string;
}

export interface IEventsManager {
    routingKeys: {
        data_events: string;
        pubsub_events: string;
    };
    queues: {
        pubsub_events_prefix: string;
    };
}

export interface IIndexationManager {
    queues: {
        events: string;
    };
    fuzzySearch: boolean;
}

export interface ITasksManager {
    checkingInterval: number; // in milliseconds
    workerPrefetch: number;
    restartWorker: boolean;
    queues: {
        execOrders: string;
        cancelOrders: string;
    };
    routingKeys: {
        execOrders: string;
        cancelOrders: string;
    };
}

export interface IExport {
    directory: string;
    endpoint: string;
}

export interface IImport {
    directory: string;
    endpoint: string;
    sizeLimit: number;
    groupData: number;
    maxStackedElements: number;

    /**
     * Hack for leav deploy on nfs which is asynchronous for file write (by default)
     * Wait this delay before submitting import data job
     */
    delayTaskExecMs: number;
}

interface ICommonDataLoaderConfig {
    /**
     * Split batch in multiple batch if number of keys to load is superior to this value.
     * Too low value can cause performance issue, to many arangodb or redis requeste, too high value can cause memory, performance and availability issue.
     * Adjust according to your use case and data size
     */
    maxBatchSize?: number;
}

/**
 * Data loaders configuration for performances
 */
export interface IDataLoaders {
    valueRepo: {
        getValues: {
            /**
             * @default false
             *
             * Enable cache inside data loaders in the query context
             * Before enable, ensure that it has no side effects, for instance on saveValue/deleteValue mutations
             */
            enableCache: boolean;

            /**
             * @default true
             *
             * Enable: do batch arangodb query
             * Disable: do one arangodb query per value, as before data loader use. For rollback if issue with batch query
             * Temporary, to be removed in future
             */
            useBatch: boolean;
        } & ICommonDataLoaderConfig;
    };

    recordRepo: {
        getRecord: ICommonDataLoaderConfig;
    };

    treeRepo: {
        getRecordByNodeId: ICommonDataLoaderConfig;
    };

    cacheService: {
        ramCache: ICommonDataLoaderConfig;
    };
}

export interface IDiskCache {
    directory: string;
}

export interface IPreview {
    directory: string;
}

export interface IApplicationsConfig {
    rootFolder: string;
    assetsMaxAge?: string; // string with ms format
}

export interface IFilesConfig {
    rootPaths: string;
    originalsPathPrefix: string;
}

export interface IDbProfilerConfig {
    enable: boolean;
}

export interface INotificationConfig {
    enable: boolean;
    email: {
        enable: boolean;
    };
    webSocket: {
        enable: boolean;
    };
}

export interface IElasticsearchConfig {
    indexPrefix: string;
    url: string;
    ilmPolicyName: string;
    templateName: string;
}

export interface IBugsnag {
    enable: boolean;
    apiKey?: string;
    appVersion?: string;
    appType?: string;
    releaseStage?: string;
}

export interface IMatomo {
    enable: boolean;
    url?: string;
    siteId?: string;
}

export interface ILogsCollector {
    queue: string;
}
