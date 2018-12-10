import React, {Component} from "react";
import {Table} from "antd";

import PropTypes from "prop-types";

import "antd/dist/antd.css";
import "../css/css.css";
import {Layout} from "antd";

import AuthService from "../AuthService";
import HeaderApp from "../components/header";
import Top from "../components/top";

import {api} from "./constants";
import {Link} from "react-router";

import {DatePicker} from "antd";

import {Spin} from "antd";
import locale from "antd/lib/date-picker/locale/vi_VN";

const Auth = new AuthService(null);

const {Content} = Layout;

const {RangePicker} = DatePicker;

class Report extends Component {
  constructor(props) {
    super(props);
    this.getWord = this.getWord.bind(this);
    this.handleLanguage = this.handleLanguage.bind(this);
    this.getLanguage = this.getLanguage.bind(this);

    this.state = {
      loading: true,
      isLoading: true,
      language: "vietnamese"
    };
  }
  getLanguage = () => {
    return this.state.language;
  };
  componentWillMount = () => {
    //console.log(Auth.loggedIn());
    if (!Auth.loggedIn()) {
      this.context.router.replace("/");
    } else {
      try {
        const profile = Auth.getProfile();
        //console.log(profile);
        this.setState({
          user: profile
        });
        this.getDictionary();
        this.setState({language: localStorage.getItem("language")});

        let today = new Date().toISOString().slice(0, 10);

        this.getOrders(today, today);
      } catch (err) {
        //console.log(err);
        Auth.logout();
        this.context.router.replace("/");
      }
    }
  };
  getDictionary = () => {
    fetch(api + "/dictionaries")
      .then(res => res.json())
      .then(dictionary => {
        this.setState({dictionary});
        this.setState({isLoading: false});
      });
  };
  getWord = key => {
    return this.state.dictionary
      ? this.state.language === "vietnamese"
        ? this.state.dictionary.find(i => i.key === key)
          ? this.state.dictionary.find(i => i.key === key).vietnamese
          : ""
        : this.state.dictionary.find(i => i.key === key)
          ? this.state.dictionary.find(i => i.key === key).english
          : ""
      : "";
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
        return res.json();
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
  handleLanguage = () => {
    this.state.language === "vietnamese"
      ? this.setState({language: "english"})
      : this.setState({language: "vietnamese"});

    this.state.language === "vietnamese"
      ? localStorage.setItem("language", "english")
      : localStorage.setItem("language", "vietnamese");
  };

  render() {
    const {orders, loading, isLoading} = this.state;

    const columns = [
      {
        title: this.getWord("order"),
        dataIndex: "order_id",
        key: "order_id",
        render: id => <Link to={`/o/${id}`}>{id}</Link>
      },
      {
        title: this.getWord("date"),
        dataIndex: "order_date",
        key: "order_date",
        render: date => (
          <div>{new Date(date).toLocaleString("ES").slice(0, 10)}</div>
        )
      },
      {
        title: this.getWord("customer-name"),
        dataIndex: "customer_name",
        key: "customer_name"
      },
      {
        title: this.getWord("hotel"),
        dataIndex: "hotel_name",
        key: "hotel_name"
      },
      {
        title: this.getWord("room"),
        dataIndex: "hotel_room",
        key: "hotel_room"
      },
      {
        title: this.getWord("origin"),
        dataIndex: "order_origin",
        key: "order_origin"
      },
      {
        title: this.getWord("price-usd") + " [USD]",
        dataIndex: "total",
        key: "total"
      },
      {
        title: this.getWord("total-items"),
        dataIndex: "num_items",
        key: "num_items"
      }
    ];

    return !isLoading ? (
      <Layout className="wrapper">
        {Auth.loggedIn() && (
          <Top
            username={this.state.user.username}
            handleLanguage={this.handleLanguage}
            getWord={this.getWord}
            getLanguage={this.getLanguage}
          />
        )}
        <HeaderApp index="2" getWord={this.getWord} />

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
              locale={this.state.language === "vietnamese" && locale}
              format="DD/MM/YYYY"
              onChange={date => this.onDateChange(date)}
            />
          </div>

          {!loading ? (
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
    ) : (
      <Content className="containerHome">
        <Spin size="large" />
      </Content>
    );
  }
}

export default Report;
