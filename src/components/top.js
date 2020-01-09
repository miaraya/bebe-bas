import React, { Component } from "react";
import PropTypes from "prop-types";
import AuthService from "../AuthService";
import { Link } from "react-router";
import { Row, Col, Icon } from "antd";

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
      <Row type="flex" justify="space-between">
        {this.props.getLanguage && (
          <Col span={4} justify="center" align="middle">
            {this.props.getLanguage && (
              <Link
                onClick={() => {
                  this.props.handleLanguage();
                }}
              >
                <Icon type="global" style={{ marginRight: 10 }} />
                {this.props.getWord("to" + this.props.getLanguage())}
              </Link>
            )}
          </Col>
        )}
        <Col span={4} justify="center" align="middle">
          {Auth.loggedIn() && (
            <span>
              <Icon type="user" style={{ marginRight: 10 }} />
              {this.props.username}
            </span>
          )}
        </Col>
        <Col span={4} offset={8}>
          {Auth.loggedIn() && (
            <Link
              onClick={() => {
                Auth.logout();
                this.context.router.push("/");
              }}
            >
              {this.props.getWord("logout")}
              <Icon type="logout" style={{ marginLeft: 10 }} />
            </Link>
          )}
        </Col>
      </Row>
    );
  }
}
export default Top;
