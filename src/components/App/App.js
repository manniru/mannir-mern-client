import React, { Component } from "react";
import { Container } from "semantic-ui-react";
import axios from "axios";
import io from "socket.io-client";

import TableUser from "../TableUser/TableUser";
import ModalUser from "../ModalUser/ModalUser";

import logo from "../../logo.svg";
import shirts from "../../shirts.png";
import "./App.css";

//mannir
import PersonPage from "../../mannir/vrs/PersonPage";
import FormUser from "../FormUser/FormUser";

class App extends Component {
  constructor() {
    super();

    this.server =
      process.env.REACT_APP_API_URL || "https://2170w5ynvj.sse.codesandbox.io";
    this.socket = io.connect(this.server);

    this.state = {
      users: [],
      online: 0
    };

    this.fetchUsers = this.fetchUsers.bind(this);
    this.handleUserAdded = this.handleUserAdded.bind(this);
    this.handleUserUpdated = this.handleUserUpdated.bind(this);
    this.handleUserDeleted = this.handleUserDeleted.bind(this);
  }

  // Place socket.io code inside here
  componentDidMount() {
    this.fetchUsers();
    this.socket.on("visitor enters", data => this.setState({ online: data }));
    this.socket.on("visitor exits", data => this.setState({ online: data }));
    this.socket.on("add", data => this.handleUserAdded(data));
    this.socket.on("update", data => this.handleUserUpdated(data));
    this.socket.on("delete", data => this.handleUserDeleted(data));
  }

  // Fetch data from the back-end
  fetchUsers() {
    axios
      .get(`${this.server}/api/users/`)
      .then(response => {
        this.setState({ users: response.data });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleUserAdded(user) {
    let users = this.state.users.slice();
    users.push(user);
    this.setState({ users: users });
  }

  handleUserUpdated(user) {
    let users = this.state.users.slice();
    for (let i = 0, n = users.length; i < n; i++) {
      if (users[i]._id === user._id) {
        users[i].name = user.name;
        users[i].email = user.email;
        users[i].age = user.age;
        users[i].gender = user.gender;
        break; // Stop this loop, we found it!
      }
    }
    this.setState({ users: users });
  }

  handleUserDeleted(user) {
    let users = this.state.users.slice();
    users = users.filter(u => {
      return u._id !== user._id;
    });
    this.setState({ users: users });
  }

  render() {
    let online = this.state.online;
    let verb = online <= 1 ? "is" : "are"; // linking verb, if you'd prefer
    let noun = online <= 1 ? "person" : "people";

    console.log(this.state.users);

    return (
      <div>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-intro">MANNIR REALTIME SYSTEM</h1>
            <p>Build on top of Cutting Edge Technology Powered by MERN</p>
            <p>MongoDb, ExpressJS, ReactJS, NodeJS, and SocketIO</p>
            <p>
              <a
                className="social-link"
                href="https://github.com/manniru"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>{" "}
              &bull;{" "}
              <a
                className="social-link"
                href="https://linkedin.com/in/MuhammadMannirAhmad"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>{" "}
              &bull; j
              <a
                className="social-link"
                href="https://twitter.com/mannirahmad"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </p>
            <a
              className="shirts"
              href="https://www.teepublic.com/user/codeweario"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={shirts} alt="Programmer Shirts" />
              <span>Ad</span>
            </a>
          </div>
        </div>
        <Container>
          <ModalUser
            headerTitle="Add User"
            buttonTriggerTitle="Add New"
            buttonSubmitTitle="Add"
            buttonColor="green"
            onUserAdded={this.handleUserAdded}
            server={this.server}
            socket={this.socket}
          />
          <em id="online">{`${online} ${noun} ${verb} online.`}</em>
          <TableUser
            onUserUpdated={this.handleUserUpdated}
            onUserDeleted={this.handleUserDeleted}
            users={this.state.users}
            server={this.server}
            socket={this.socket}
          />
        </Container>
        <br />
      </div>
    );
  }
}

export default App;
