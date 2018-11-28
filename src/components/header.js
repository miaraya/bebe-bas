import React, {Component} from "react";
import {Layout, Menu} from "antd";
import Logo from "../assets/logo_small.png";
import {Link} from "react-router";
import PropTypes from "prop-types";

const {Header} = Layout;

class HeaderApp extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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
  render() {
    return (
      <Header className="header">
        <Link to={`/`}>
          <img src={Logo} alt="Bebe Tailor" width="150px" />
        </Link>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={[this.props.index]}
          style={{lineHeight: "64px", flex: 1, width: "100%"}}
        >
          <Menu.Item
            key="1"
            onClick={() =>
              this.props.index !== 1 ? this.context.router.push("/search") : ""
            }
          >
            Search
          </Menu.Item>
          {localStorage.getItem("role") === "admin" ? (
            <Menu.Item
              key="2"
              onClick={() =>
                this.props.index !== 2
                  ? this.context.router.push("/reports")
                  : ""
              }
            >
              Reports
            </Menu.Item>
          ) : (
            ""
          )}
        </Menu>
      </Header>
    );
  }
}
export default HeaderApp;
