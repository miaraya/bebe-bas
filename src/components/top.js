import React, {Component} from "react";
import PropTypes from "prop-types";
import {Button} from "antd";
import AuthService from "../AuthService";
import {Icon} from "antd";

const Auth = new AuthService(null);

class Top extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired
      }),
      staticContext: PropTypes.object
    }).isRequired
  };

  handleLanguage = () => {
    console.log(localStorage.getItem("language"));
  };
  render() {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: 50,
          paddingLeft: 50,
          paddingTop: 10
        }}
      >
        <div>
          <Icon type="user" style={{marginRight: 10}} />
          {this.props.username}
        </div>

        <div
          style={{cursor: "pointer"}}
          onClick={() => {
            Auth.logout();
            this.context.router.push("/");
          }}
        >
          Log Out
          <Icon type="logout" style={{marginLeft: 10}} />
        </div>
      </div>
    );
  }
}
export default Top;
