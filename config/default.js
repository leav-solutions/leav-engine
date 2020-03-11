module.exports = {
    db: {
        url: process.env.ARANGO_URL,
        name: process.env.DB_NAME
    },
    filesystem: {
        absolutePath: process.env.FILESYSTEM_ABSOLUTE_PATH
    },
    treeId: process.env.TREE_ID,
    rmq: {}
};
