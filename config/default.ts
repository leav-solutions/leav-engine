module.exports = {
    graphql: {
        uri: process.env.GRAPHQL_URL,
        token: process.env.GRAPHQL_TOKEN,
        treeId: process.env.TREE_ID
    },
    filesystem: {
        absolutePath: process.env.FILESYSTEM_ABSOLUTE_PATH
    },
    treeId: process.env.TREE_ID,
    rmq: {}
};
