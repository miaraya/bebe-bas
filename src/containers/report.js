import React, {Component} from "react";
import PropTypes from "prop-types";

import "antd/dist/antd.css";
import "../css/css.css";
import {Layout} from "antd";

import AuthService from "../AuthService";
import HeaderApp from "../components/header";
import Top from "../components/top";
import {Table} from "antd";

import {api} from "./constants";
import {Link} from "react-router";

import {DatePicker} from "antd";

import {Spin} from "antd";

const Auth = new AuthService(null);

const {Content} = Layout;

const {RangePicker} = DatePicker;

class Report extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      columns: [
        {
          title: "Order",
          dataIndex: "order_id",
          key: "order_id",
          render: id => <Link to={`/o/${id}`}>{id}</Link>
        },
        {
          title: "Date",
          dataIndex: "order_date",
          key: "order_date",
          render: date => (
            <div>{new Date(date).toLocaleString("ES").slice(0, 10)}</div>
          )
        },
        {
          title: "Customer",
          dataIndex: "customer_name",
          key: "customer_name"
        },
        {
          title: "Hotel",
          dataIndex: "hotel_name",
          key: "hotel_name"
        },
        {
          title: "Room",
          dataIndex: "hotel_room",
          key: "hotel_room"
        },
        {
          title: "Origin",
          dataIndex: "order_origin",
          key: "order_origin"
        },
        {
          title: "Total [USD]",
          dataIndex: "total",
          key: "total"
        },
        {
          title: "# Items",
          dataIndex: "num_items",
          key: "num_items"
        }
      ]
    };
  }
  componentWillMount = () => {
    let today = new Date().toISOString().slice(0, 10);

    //console.log(today);
    const profile = Auth.getProfile();
    this.setState({
      user: profile
    });

    this.getOrders(today, today);
  };

  getOrders = (from, to) => {
    fetch(
      api +
        "report_orders?filter[where][order_date][gt]=" +
        from +
        "&[where][order_date][lt]=" +
        to
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(orders => {
        this.setState({orders, loading: false});
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

  onDateChange = date => {
    date.length &&
      this.getOrders(
        new Date(date[0]).toISOString().slice(0, 10),
        new Date(date[1]).toISOString().slice(0, 10)
      );
  };
  render() {
    const {orders, columns, user, loading} = this.state;
    return (
      <Layout className="wrapper">
        {Auth.loggedIn() && <Top username={user.username} />}
        <HeaderApp index="2" />
        <Content className="container">
          <div
            style={{
              flex: 1,
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
              paddingBottom: 50
            }}
          >
            <RangePicker
              format="DD/MM/YYYY"
              onChange={date => this.onDateChange(date)}
            />
          </div>
          {!loading > 0 ? (
            <Table
              dataSource={orders}
              columns={columns}
              rowKey="id"
              size="small"
            />
          ) : (
            <div style={{display: "flex", justifyContent: "center"}}>
              <Spin size="large" />
            </div>
          )}
        </Content>
      </Layout>
    );
  }
}

export default Report;
