// eslint-disable-next-line max-classes-per-file
import WebSocket from 'ws';
import {GraphQLClient} from 'graphql-request';
import {inject} from 'vitest';
import {type Client as GraphqlWsClient, createClient as createGraphqlWsClient} from 'graphql-ws';
import axios, {type AxiosResponse} from 'axios';
import FormData from 'form-data';
import jwt, {type SignOptions, type Algorithm} from 'jsonwebtoken';
import {getSdk} from '../_gqlTypes';
import {type ActionsListConfig} from '../../../_types/actionsList';
import {type ITreeElement} from '../../../_types/tree';
import {getConfig} from '../../../config';
import {adminsGroupId, adminUserId} from '../../../_constants/users';
import {
    AttributeFormats,
    type AttributeTypes,
    type IAttributeVersionsConf,
    type IEmbeddedAttribute,
} from '../../../_types/attribute';
import {ACCESS_TOKEN_COOKIE_NAME} from '../../../_types/auth';
import {type ITreePermissionsDependentValuesConf} from '../../../_types/permissions';
import {AttributeCondition} from '../../../_types/record';
import {type ISaveValue} from '../../../_types/value';

export interface IE2EUser {
    userId: string;
    getAuthToken: () => Promise<string>;
}

export interface IE2EUserParams {
    userId: string;
    groupsId: string[];
}

const e2eUser = ({userId, groupsId}: IE2EUserParams): IE2EUser => ({
    userId,
    getAuthToken: async () => {
        const conf = await getConfig();

        return jwt.sign(
            {
                userId,
                groupsId,
            },
            conf.auth.key,
            {
                algorithm: conf.auth.algorithm as Algorithm,
                expiresIn: conf.auth.tokenExpiration as SignOptions['expiresIn'],
            },
        );
    },
});

export const e2eAdminUser = (): IE2EUser => e2eUser({userId: adminUserId, groupsId: [adminsGroupId]});

export const e2eGuestUser = (): IE2EUser => e2eUser(inject('guestUser'));

export const e2eNonAdminUser = (): IE2EUser => e2eUser(inject('nonAdminUser'));

export const e2eNonAdminGroupId = (): string => inject('nonAdminGroupId');

export const getGraphQLUrl = () => inject('graphqlUrl');

export class E2EGraphQLError extends Error {
    public constructor(
        message: string,
        public readonly response: AxiosResponse,
    ) {
        super(message);
    }
}

export interface IMakeGraphQlCallOptions {
    user?: IE2EUser;
    skipLogErrors?: boolean;
}

export const getSdkWithUser = (user: IE2EUser): ReturnType<typeof getSdk> =>
    getSdk(
        new GraphQLClient(getGraphQLUrl(), {
            requestMiddleware: async request => {
                const token = await user.getAuthToken();

                if (request.headers instanceof Headers) {
                    request.headers.append('Cookie', `${ACCESS_TOKEN_COOKIE_NAME}=${token}`);
                } else {
                    request.headers = {
                        ...request.headers,
                        Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
                    };
                }

                return request;
            },
        }),
    );

export const adminUserSdk = getSdkWithUser(e2eAdminUser());
export const guestUserSdk = getSdkWithUser(e2eGuestUser());
export const nonAdminUserSdk = getSdkWithUser(e2eNonAdminUser());

export async function makeGraphQlCall(query: string | FormData, options?: IMakeGraphQlCallOptions): Promise<any> {
    const user = options?.user ?? e2eAdminUser();
    try {
        const url = getGraphQLUrl();
        const token = await user.getAuthToken();

        const data = typeof query === 'string' ? {query} : query;
        const headers = {
            Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
            ...(typeof query !== 'string' && (data as FormData).getHeaders()),
        };

        const res = await axios.post(url, data, {headers});

        if (res.status === 200 && res.data.errors?.length) {
            throw new E2EGraphQLError(
                `${res.data.errors[0].message} - ${JSON.stringify(
                    res.data.errors[0]?.extensions?.fields,
                )} - Code ${res.data.errors[0]?.extensions?.code} - Query was: ${query}`,
                res,
            );
        } else if (res.status !== 200) {
            throw new E2EGraphQLError(`HTTP error ${res.status} - Query was: ${query}`, res);
        }

        return res;
    } catch (e) {
        if (!(e instanceof E2EGraphQLError) && !options?.skipLogErrors) {
            console.error('GraphQL query error:', e.message, '\n', e.response?.data ?? '', `- Query was: ${query}`);
        }
        throw e;
    }
}
export async function importFileGraphQlCall(query: string, filePath: string, sheets = undefined) {
    try {
        const url = getGraphQLUrl();
        const token = await e2eAdminUser().getAuthToken();

        const operations = {
            query,
            variables: {
                file: null,
                sheets,
            },
        };

        const map = {'0': ['variables.file']};

        const form = new FormData();
        form.append('operations', JSON.stringify(operations));
        form.append('map', JSON.stringify(map));
        form.append('0', require('fs').createReadStream(filePath));

        const headers = {
            Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
            ...form.getHeaders(),
            'x-apollo-operation-name': 'importFile',
        };

        const response = await axios.post(url, form, {headers});

        return response.data;
    } catch (e) {
        if (!(e instanceof E2EGraphQLError)) {
            console.error('GraphQL query error:', e.message, '\n', e.response?.data ?? '', `- Query was: ${query}`);
        }
        throw e;
    }
}

export async function gqlSaveApplication(id: string, label: string, endpoint: string) {
    const saveAppRes = await makeGraphQlCall(
        `mutation {
            saveApplication(application: {
                id: "${id}",
                label: {en: "${label}"},
                endpoint: "${endpoint}",
                module: "data-studio"
            }) { id }
        }`,
    );

    return saveAppRes.data.data;
}

export async function gqlSaveAttribute(params: {
    id: string;
    type: AttributeTypes;
    label: string;
    description?: string;
    format?: AttributeFormats;
    versionsConf?: IAttributeVersionsConf;
    metadataFields?: string[];
    embeddedFields?: IEmbeddedAttribute[];
    linkedLibrary?: string;
    linkedTree?: string;
    multipleValues?: boolean;
    reverseLink?: string;
    unique?: boolean;
    actionsList?: ActionsListConfig;
    required?: boolean;
    permissions_conf_dependent_values?: ITreePermissionsDependentValuesConf;
}) {
    const {
        id,
        type,
        label,
        description,
        format = AttributeFormats.TEXT,
        versionsConf,
        metadataFields,
        embeddedFields,
        linkedLibrary,
        linkedTree,
        multipleValues,
        unique,
        reverseLink,
        actionsList,
        required,
        permissions_conf_dependent_values,
    } = params;

    const _convertEmbeddedFields = (field: IEmbeddedAttribute): string => `
            {
                id: "${field.id}",
                format: ${field.format ?? 'null'},
                label: {en: "${field.id}"},
                validation_regex: ${field.validation_regex ? `"${field.validation_regex}"` : 'null'},
                embedded_fields: ${
                    field.embedded_fields ? `[${field.embedded_fields.map(_convertEmbeddedFields).join(', ')}]` : 'null'
                }
            }
        `;

    const _convertActionsList = (actions: ActionsListConfig): string => `
            {
                ${Object.keys(actions)
                    .map(eventKey => {
                        const eventActions = actions[eventKey].map(
                            actionConf => `{
                                id: "${actionConf.id}",
                                params: [${(actionConf?.params ?? [])
                                    .map(p => `{name: "${p.name}", value: "${p.value}"}`)
                                    .join(', ')}]
                            }`,
                        );

                        return `${eventKey}: [${eventActions.join(', ')}]`;
                    })
                    .join(', ')}
            }
        `;

    const query = `mutation {
        saveAttribute(
            attribute: {
                id: "${id}",
                type: ${type},
                format: ${format},
                label: {en: "${label}"},
                description: {en: "${description ? `"${description}"` : 'null'}"},
                linked_library: ${linkedLibrary ? `"${linkedLibrary}"` : 'null'},
                reverse_link: ${reverseLink ? `"${reverseLink}"` : 'null'},
                linked_tree: ${linkedTree ? `"${linkedTree}"` : 'null'},
                metadata_fields: ${metadataFields ? `[${metadataFields.map(t => `"${t}"`).join(', ')}]` : 'null'},
                versions_conf: ${
                    versionsConf
                        ? `{
                            versionable: ${versionsConf.versionable ? 'true' : 'false'},
                            profile: "${versionsConf.profile}"
                        }`
                        : 'null'
                },
                embedded_fields: ${embeddedFields ? `${embeddedFields.map(_convertEmbeddedFields).join(', ')}` : 'null'}
                multiple_values: ${multipleValues ? 'true' : 'false'},
                actions_list: ${actionsList ? _convertActionsList(actionsList) : 'null'}
                required: ${required ? 'true' : 'false'}
                unique: ${unique ? 'true' : 'false'}
                permissions_conf_dependent_values: ${
                    permissions_conf_dependent_values
                        ? `{
                            dependenciesTreeAttributes: [${permissions_conf_dependent_values.dependenciesTreeAttributes
                                .map(attrId => `"${attrId}"`)
                                .join(', ')}]
                            allowByDefault: ${permissions_conf_dependent_values.allowByDefault ? 'true' : 'false'}
                        }`
                        : 'null'
                }
            }
        ) { id }
    }`;

    const saveAttrRes = await makeGraphQlCall(query);

    return saveAttrRes.data.data;
}

export async function gqlSaveTree(id: string, label: string, libraries: string[]) {
    const saveTreeRes = await makeGraphQlCall(
        `mutation {
        saveTree(
            tree: {
                id: "${id}",
                label: {en: "${label}"},
                libraries: [${libraries
                    .map(
                        l =>
                            `{library: "${l}", settings: {allowMultiplePositions: false, allowedAtRoot: true,  allowedChildren: ["__all__"]}}`,
                    )
                    .join(', ')}]}
        ) {
            id
        }
    }`,
    );

    return saveTreeRes.data.data;
}

export async function gqlCreateRecord(library: string): Promise<string> {
    const res = await makeGraphQlCall(
        `mutation {
        c: createRecord(library: "${library}") {
            record {
                id
            }
        }
    }
    `,
    );

    return res.data.data.c.record.id;
}

/**
 * Add an element to the tree
 *
 * @param treeId
 * @param element
 * @param parent
 * @return Node ID
 */
export async function gqlAddElemToTree(
    treeId: string,
    element: ITreeElement,
    parent?: string | null,
    order?: number,
): Promise<string> {
    const res = await makeGraphQlCall(
        `mutation {
        treeAddElement(
            treeId: "${treeId}",
            element: {id: "${element.id}", library: "${element.library}"}
            ${parent ? `parent: ${parent}` : ''}
            order: ${order ?? 0}
        ) { id }
    }`,
    );

    return res.data.data.treeAddElement.id;
}

export async function gqlGetValue(libraryId: string, recordId: string, attributeId: string): Promise<any> {
    const result = await makeGraphQlCall(`{
         records(
             library: "${libraryId}",
             filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordId}"}]
         ) {
             list {
                 properties(attributeIds: ["${attributeId}"]) {
                    values {
                        id_value
                        ... on Value {
                            valuePayload: payload
                        }
                        ... on LinkValue {
                            linkPayload: payload {
                                whoAmI {
                                    id
                                    label
                                }
                            }
                        }
                        ... on TreeValue {
                            treePayload: payload {
                                id
                            }
                        }
                    }
                 }
             }
         }
     }`);

    return result.data.data.records.list[0]?.properties[0]?.values;
}

export async function gqlSaveValue(attributeId: string, libraryId: string, recordId: string, value: string | number) {
    await makeGraphQlCall(
        `mutation {
        saveValue(library: "${libraryId}", recordId: "${recordId}", attribute: "${attributeId}", value: {
            payload: ${typeof value === 'string' ? `"${value}"` : value}
        }) {
            id_value
        }
    }`,
    );
}

export async function gqlSaveValueBis(
    attributeId: string,
    libraryId: string,
    recordId: string,
    value: ISaveValue,
): Promise<string | null> {
    const result = await makeGraphQlCall(
        `mutation {
            saveValue(library: "${libraryId}", recordId: "${recordId}", attribute: "${attributeId}", value: {
                id_value: ${value.id_value ? `"${value.id_value}"` : 'null'},
                payload: ${typeof value.payload === 'string' ? `"${value.payload}"` : value.payload}
            }) {
                id_value
            }
        }`,
    );

    return result.data.data.saveValue[0].id_value;
}

export async function gqlDeleteValue(
    attributeId: string,
    libraryId: string,
    recordId: string,
    idValue: string | null,
): Promise<void> {
    await makeGraphQlCall(
        `mutation {
            deleteValue(library: "${libraryId}", recordId: "${recordId}", attribute: "${attributeId}", value: {
                id_value: ${idValue ? `"${idValue}"` : 'null'}
            }) {
                id_value
            }
        }`,
    );
}

export async function gqlSaveVersionProfile(profileId: string, label: string, trees: string[]) {
    await makeGraphQlCall(
        `mutation {
            saveVersionProfile(versionProfile: {
                id: "${profileId}",
                label: {en: "label"},
                trees: [${trees.map(a => `"${a}"`).join(', ')}]
            }) {
            id
        }
    }`,
    );
}

/**
 * Convert object to JSON, escaping quotes to be able to use it in a graphql query
 **/
export function toCleanJSON(obj: {}): string {
    return JSON.stringify(obj).replace(/[\""]/g, '\\"');
}

export async function makeWebSocketGraphQlCall(options?: {user: IE2EUser}): Promise<GraphqlWsClient> {
    const user = options?.user ?? e2eAdminUser();
    const config = await getConfig();
    const token = await user.getAuthToken();
    const headers = {
        Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
    };

    class MyWebSocket extends WebSocket {
        public constructor(address, protocols) {
            super(address, protocols, {
                headers,
            });
        }
    }

    return createGraphqlWsClient({
        url: `ws://${config.server.host}:${config.server.port}/graphql`,
        webSocketImpl: MyWebSocket,
    });
}

export function waitGraphqlWebSocketMessage<T>(
    client: GraphqlWsClient,
    query: string,
    variables: Record<string, any>,
    acceptMessage: (msg: T) => boolean,
    {timeoutMs}: {timeoutMs},
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Wait message timeout'));
        }, timeoutMs || 20_000);

        client.subscribe(
            {
                query,
                variables,
            },
            {
                next: data => {
                    const msg = data.data as unknown as T;
                    if (acceptMessage(msg)) {
                        clearTimeout(timeout);
                        resolve(msg);
                    }
                },
                error: err => {
                    clearTimeout(timeout);
                    reject(err);
                },
                complete: () => {
                    clearTimeout(timeout);
                },
            },
        );
    });
}

export async function waitWebSocketMessage<T>(
    webSocket: WebSocket,
    acceptMessage: (msg: T) => Promise<boolean>,
    {timeoutMs}: {timeoutMs},
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            webSocket.close();
            reject(new Error('Wait message timeout'));
        }, timeoutMs || 20_000);

        webSocket.onmessage = async (event: WebSocket.MessageEvent) => {
            try {
                // Mailpit can send multiple JSON messages in one event separated by new lines
                const lines = event.data.toString().split('\n').filter(Boolean);
                for (const line of lines) {
                    const msg = JSON.parse(line);
                    if (await acceptMessage(msg)) {
                        clearTimeout(timeout);
                        webSocket.close();
                        resolve(msg);
                        return;
                    }
                }
            } catch (e) {
                if (e instanceof SyntaxError) {
                    // Depending on what is received, maybe ignore those message in later code changes
                    console.warn('Received non-JSON message over WebSocket:', event.data.toString());
                }
                clearTimeout(timeout);
                webSocket.close();
                reject(e);
            }
        };

        webSocket.onerror = (error: WebSocket.ErrorEvent) => {
            clearTimeout(timeout);
            webSocket.close();
            reject(error);
        };

        webSocket.onclose = () => {
            clearTimeout(timeout);
        };
    });
}
