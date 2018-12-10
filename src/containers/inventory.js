import React, {Component} from "react";
import PropTypes from "prop-types";

import "antd/dist/antd.css";
import "../css/css.css";
import {Layout} from "antd";

import AuthService from "../AuthService";
import HeaderApp from "../components/header";
import Top from "../components/top";
const Auth = new AuthService(null);

const {Content} = Layout;

class Inventory extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount = () => {
    const profile = Auth.getProfile();
    this.setState({
      user: profile
    });
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired
      }),
      staticContext: PropTypes.object
    }).isRequired
  };
  render() {
    return (
      <Layout className="wrapper">
        {Auth.loggedIn() && <Top username={this.state.user.username} />}
        <HeaderApp index="3" />
        <Content className="container">invetyn</Content>
      </Layout>
    );
  }
}

export default Inventory;
