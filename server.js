const net = require("net");
const fs = require("fs");

const moment = require("moment");

//SERVER

const connections = [];
let buffer = Buffer.from("");

const server = net.createServer(connection => {
  console.log("Connection made by client! - " + moment().format('MMMM Do YYYY, h:mm:ss a'));

  if(buffer.length !== 0){
    connection.write(buffer);
    console.log("Buffered data has been sent to the client! - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
    buffer = Buffer.from("");
  }

  connections.push(connection);

  connection.on("error", err => {
    console.log("Client has disconnected! - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
    connection.end();
    connections.pop();
  });
});

server.listen(3000, () => {
  console.log("Server listening on 3000 - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
});

//CLIENT

//Original
const options = {port: 7000, host: '10.7.8.5'};

//Test
// const options = {port: 4000, host: "localhost"};

const appendFile = data => {
  fs.appendFile("log.txt", data, err => {
    if (err) throw err;
    console.log("The log file has been updated! - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
  });
};

async function connect() {
  try {
    const connection = new Promise(resolve => {
      let currentConnection = net.createConnection(options, () => {
        console.log("Connected to the server! - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
        resolve(currentConnection);
      });
    });

    const conn = await connection;
    monitor(conn);
  } catch (e) {
    console.log(e);
  }
}

const monitor = client => {
  client.on("data", data => {
    // console.log(data);
    appendFile(data.toString());

    if (connections.length === 0) {
      console.log("Client not connected. Buffering data.. - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
      buffer = Buffer.concat([buffer, data]);
    } else {
      buffer = Buffer.concat([buffer, data]);
      connections.forEach(conn => {
        conn.write(buffer);
	console.log('Data has been sent to JDS' + moment().format('MMMM Do YYYY, h:mm:ss a'));
      });
      buffer = Buffer.from("");
    }
  });
  client.on("error", err => {
    console.log(err);
  });
  client.on("end", () => {
    console.log("Disconnected from server.. Reconnecting... - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
    connect();
  });
};

connect();
