import React, {Component} from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import {Layout} from "antd";
import PropTypes from "prop-types";

import Logo from "../assets/logo.png";
import {Link} from "react-router";
import {Form, Icon, Input, Button} from "antd";

import AuthService from "../AuthService";

const auth = new AuthService(null);

const {Content} = Layout;
const FormItem = Form.Item;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      loading: false
    };
  }
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired
      }),
      staticContext: PropTypes.object
    }).isRequired
  };
  componentWillMount = () => {};

  doLogin = (username, password) => {
    auth
      .login(username, password)
      .then(
        () =>
          auth.loggedIn()
            ? this.context.router.push("/search")
            : this.setState({error: "Login Failed", loading: false})
      );
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({loading: true});
        this.doLogin(values.userName, values.password);
      }
    });
  };

  render() {
    const {error, loading} = this.state;
    const {getFieldDecorator} = this.props.form;

    return (
      <Layout className="wrapper">
        <Content className="containerHome">
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Link to={`/`}>
              <img
                style={{marginBottom: 50}}
                src={Logo}
                alt="Bebe Tailor"
                width="100%
                "
              />
            </Link>
            <FormItem>
              {getFieldDecorator("userName", {
                rules: [
                  {required: true, message: "Please input your username!"}
                ]
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{color: "rgba(0,0,0,.25)"}} />
                  }
                  placeholder="Username"
                  onFocus={() => this.setState({error: ""})}
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator("password", {
                rules: [
                  {required: true, message: "Please input your Password!"}
                ]
              })(
                <Input
                  prefix={
                    <Icon type="lock" style={{color: "rgba(0,0,0,.25)"}} />
                  }
                  type="password"
                  placeholder="Password"
                  onFocus={() => this.setState({error: ""})}
                />
              )}
            </FormItem>
            <FormItem
              style={{
                width: "100%",
                textAlign: "center",
                color: "red"
              }}
            >
              {error}
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={loading}
              >
                Log in
              </Button>
            </FormItem>
          </Form>
        </Content>
      </Layout>
    );
  }
}

export default Form.create()(Home);
