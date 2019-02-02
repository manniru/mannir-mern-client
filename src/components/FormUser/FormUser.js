import React, { Component } from "react";
import { Message, Form, Select } from "semantic-ui-react";
import axios from "axios";
import faker from "faker";

//mui
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Checkbox from "@material-ui/core/Checkbox";

const t1 = { margin: 5 };
const b1 = { margin: 5, width: 200 };
const genders = [
  {
    value: "m",
    label: "Male"
  },
  {
    value: "f",
    label: "Female"
  }
];

const genderOptions = [
  { key: "m", text: "Male", value: "m" },
  { key: "f", text: "Female", value: "f" },
  { key: "o", text: "Do Not Disclose", value: "o" }
];

class FormUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      age: "",
      gender: "",
      formClassName: "",
      formSuccessMessage: "",
      formErrorMessage: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // Fill in the form with the appropriate data if user id is provided
    if (this.props.userID) {
      axios
        .get(`${this.props.server}/api/users/${this.props.userID}`)
        .then(response => {
          this.setState({
            name: response.data.name,
            email: response.data.email,
            age: response.data.age === null ? "" : response.data.age,
            gender: response.data.gender
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  handleInputChange(e) {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  handleSelectChange(e, data) {
    this.setState({ gender: data.value });
  }

  handleSubmit(e) {
    // Prevent browser refresh
    e.preventDefault();

    const user = {
      name: this.state.name,
      email: this.state.email,
      age: this.state.age,
      gender: this.state.gender
    };

    console.log(user);

    // Acknowledge that if the user id is provided, we're updating via PUT
    // Otherwise, we're creating a new data via POST
    const method = this.props.userID ? "put" : "post";
    const params = this.props.userID ? this.props.userID : "";

    axios({
      method: method,
      responseType: "json",
      url: `${this.props.server}/api/users/${params}`,
      data: user
    })
      .then(response => {
        this.setState({
          formClassName: "success",
          formSuccessMessage: response.data.msg
        });

        if (!this.props.userID) {
          this.setState({
            name: "",
            email: "",
            age: "",
            gender: ""
          });
          this.props.onUserAdded(response.data.result);
          this.props.socket.emit("add", response.data.result);
        } else {
          this.props.onUserUpdated(response.data.result);
          this.props.socket.emit("update", response.data.result);
        }
      })
      .catch(err => {
        if (err.response) {
          if (err.response.data) {
            this.setState({
              formClassName: "warning",
              formErrorMessage: err.response.data.msg
            });
          }
        } else {
          this.setState({
            formClassName: "warning",
            formErrorMessage: "Something went wrong. " + err
          });
        }
      });
  }

  //mui
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleClick = (e, id) => {
    e.preventDefault();
    switch (id) {
      case "demo":
        this.setState({
          name: faker.name.findName(),
          email: faker.internet.email(),
          age: faker.random.number({ min: 20, max: 60 }),
          gender: faker.random.arrayElement(["m", "f"])
        });
        break;

      default:
        console.log("default");
        break;
    }
  };

  render() {
    const formClassName = this.state.formClassName;
    const formSuccessMessage = this.state.formSuccessMessage;
    const formErrorMessage = this.state.formErrorMessage;

    return (
      <div>
        <div>
          <Paper style={{ margin: 5, padding: 10 }} elevation={3}>
            <Typography variant="h5" component="h3">
              Add User
            </Typography>

            <form noValidate autoComplete="off">
              <TextField
                id="name"
                name="name"
                label="Name"
                placeholder="Elon Musk"
                style={t1}
                value={this.state.name}
                onChange={this.handleInputChange}
                variant="outlined"
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                placeholder="elonmusk@tesla.com"
                name="email"
                maxLength="40"
                value={this.state.email}
                onChange={this.handleInputChange}
                variant="outlined"
                style={t1}
                fullWidth
              />

              <TextField
                label="Age"
                type="number"
                placeholder="18"
                min={5}
                max={130}
                name="age"
                value={this.state.age}
                onChange={this.handleInputChange}
                variant="outlined"
                style={{ margin: 5, width: "48%" }}
              />

              <TextField
                id="gender"
                name="gender"
                select
                label="Gender"
                style={{ margin: 5, width: "48%" }}
                value={this.state.gender}
                onChange={this.handleInputChange}
                SelectProps={{
                  MenuProps: {
                    style: { width: 200 }
                  }
                }}
                variant="outlined"
              >
                {genders.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <br />

              <FormControl>
                <FormLabel component="legend">Status</FormLabel>
                <FormControlLabel control={<Checkbox value="A" label="A" />} />
              </FormControl>

              <Button
                variant="contained"
                style={b1}
                onClick={e => this.handleClick(e, "demo")}
              >
                Demo
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={b1}
                // onClick={e => this.handleClick(e, "submit")}
                onClick={this.handleSubmit}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={b1}
                onClick={e => this.handleClick(e, "cancel")}
              >
                Cancel
              </Button>
            </form>
          </Paper>
        </div>
      </div>
    );
  }
}

export default FormUser;
