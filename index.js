const amqp = require("amqplib/callback_api");
const watcher = require("./src/watch");

const folder_arg = process.argv[2];
const folder = folder_arg ? folder_arg : "./data";

amqp.connect("amqp://localhost", (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }

    watcher(folder, channel);
  });
});
