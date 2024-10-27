// Import the express micro-framework
const express = require("express");

// Import the built-in http module
const http = require("http");

// Import the Server class from the socket.io library
const { Server } = require("socket.io");

// Import the path module to work with file paths
const path = require("path");

//Import the body-parser module
const bodyParser = require("body-parser");

//Import the credentials
const credentials = require("./credentials");

//Import the express-session module
const session = require("express-session");

// Create an instance of the express framework
const app = express();

// Create a server using the built-in http module binding app
const server = http.createServer(app);

// Create an instance/object of the Server class
const io = new Server(server);

// Serve static files (e.g., CSS, JS)
app.use(express.static(__dirname + "/public"));

//To parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

const handlebars = require("express3-handlebars").create({
  defaultLayout: "main",
  helpers: {
    section: function (name, options) {
      if (!this._sections) {
        this._sections = {};
      }
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});

app.engine("handlebars", handlebars.engine);

app.set("view engine", "handlebars");

app.use(
  session({
    key: "monster",
    resave: false,
    saveUninitialized: true,
    secret: credentials.cookieCode,
    cookie: { signed: true },
  })
);

app.use(function (req, res, next) {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// Define the route to serve the index.html file
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.get("/signup", (req, res) => {
  res.render("signup", { title: "Signup" });
});

app.get("/userpage", (req, res) => {
  res.render("user", { title: "User" });
});

app.post("/signup", function (req, res) {
  const { username, password } = req.body;
  console.log(req.body);
  console.log(`Username: ${username}, Password: ${password}`);

  if (req.xhr || req.accepts("json", "html") === "json") {
    res.send({ success: true, redirect: "/login", name: username });
  } else {
    res.redirect(303, "/login");
  }
});

app.get("/login", function (req, res) {
  res.render("login", { title: "Login" });
});

// Adding an event listener to the io object
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle text message
  socket.on("chat message", (msg) => {
    console.log(`Message received: ${msg}`);
    io.emit("chat message", msg); // Broadcast the message to all clients
  });

  // Handle file message
  socket.on("file message", (fileData) => {
    console.log(`File received: ${fileData.fileName}`);
    io.emit("file message", fileData); // Broadcast the file to all clients
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Define the port
const port = process.env.PORT || 3000;

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on: ${port}`);
});
