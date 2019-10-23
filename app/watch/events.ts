import { sendToRabbitMQ, generateMsgRabbitMQ } from "../rabbitmq/rabbitmq";
import { updateData, deleteData } from "../redis/redis";
import { Params } from "../types";

export const handleCreate = async (
  path: string,
  inode: number,
  params: Params,
) => {
  await updateData(path, inode);
  sendToRabbitMQ(
    generateMsgRabbitMQ("create", null, path, inode, params.rootKey),
    params.amqp,
  );
  if (params.verbose) {
    console.info("create", path);
  }
};

export const handleDelete = async (
  path: string,
  inode: number,
  params: Params,
) => {
  await deleteData(path);
  sendToRabbitMQ(
    generateMsgRabbitMQ("delete", path, null, inode, params.rootKey),
    params.amqp,
  );
  if (params.verbose) {
    console.info("delete", path);
  }
};

export const handleUpdate = async (
  path: string,
  inode: number,
  params: Params,
) => {
  await updateData(path, inode);
  sendToRabbitMQ(
    generateMsgRabbitMQ("update", path, path, inode, params.rootKey),
    params.amqp,
  );
  if (params.verbose) {
    console.info("update", path);
  }
};

export const handleMove = async (
  pathBefore: string,
  pathAfter: string,
  inode: number,
  params: Params,
) => {
  await updateData(pathAfter, inode, pathBefore);
  sendToRabbitMQ(
    generateMsgRabbitMQ("move", pathBefore, pathAfter, inode, params.rootKey),
    params.amqp,
  );
  if (params.verbose) {
    console.info("move", pathBefore, pathAfter);
  }
};
