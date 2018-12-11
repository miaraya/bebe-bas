import React, {Component} from "react";
import PropTypes from "prop-types";
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
          {Auth.loggedIn() && (
            <span>
              <Icon type="user" style={{marginRight: 10}} />
              {this.props.username}
            </span>
          )}

          <a
            style={{marginLeft: 20}}
            onClick={() => {
              this.props.handleLanguage();
            }}
          >
            <Icon type="global" style={{marginRight: 10}} />
            {this.props.getWord("to" + this.props.getLanguage())}
          </a>
        </div>
        {Auth.loggedIn() && (
          <a
            onClick={() => {
              Auth.logout();
              this.context.router.push("/");
            }}
          >
            {this.props.getWord("logout")}
            <Icon type="logout" style={{marginLeft: 10}} />
          </a>
        )}
      </div>
    );
  }
}
export default Top;
