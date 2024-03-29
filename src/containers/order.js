import React, { Component } from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import { StaffList } from "../components";
import {
  Layout,
  Row,
  Col,
  Modal,
  Statistic,
  Descriptions,
  Icon,
  Avatar,
  Typography,
} from "antd";
//import {Steps} from "antd";

import { Divider } from "antd";
import { Spin } from "antd";
import { Table } from "antd";
import { Link } from "react-router";

import Logo from "../assets/logo_small.png";
import { api } from "./constants";
import _ from "lodash";
import Top from "../components/top";
import AuthService from "../AuthService";
import moment from "moment";

//const { Step } = Steps;

const Auth = new AuthService(null);

const { Column } = Table;

const { Content, Footer } = Layout;

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      image: "",
      visible: false,
      order_customer: [],
      ifus: [],
    };
  }
  render() {
    const { id } = this.props.params;
    const {
      loading,
      error,
      image,
      visible,
      order_customer,
      ifus,
      items,
      // status_id,
      language,
    } = this.state;

    let dateFormat = "MMM DD,YY hh:mm A";
    let dateFormatViet = "DD/MM/YY hh:mm A";

    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error && !loading) {
      return (
        <div>
          ORDER <b>{this.props.params.id.toUpperCase()}</b> NOT FOUND :(
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Top
            username={this.state.user.username}
            handleLanguage={this.handleLanguage}
            getLanguage={this.getLanguage}
            getWord={this.getWord}
          />

          <Row
            type="flex"
            justify="center"
            align="middle"
            gutter={16}
            span={24}
            style={{
              marginBottom: 20,
            }}
          >
            <img src={Logo} alt="Bebe Tailor" width="150px" />
          </Row>
          <Row
            type="flex"
            justify="center"
            align="middle"
            gutter={16}
            span={24}
          >
            <Col xs={24} sm={24} md={12} justify="center">
              <Statistic
                title={this.getWord("order-number")}
                prefix="#"
                value={id}
                style={{
                  textAlign: "center",
                }}
                groupSeparator=""
              />
            </Col>
            <Col xs={24} sm={24} md={12} justify="center">
              <Statistic
                title={this.getWord("status")}
                prefix=""
                value={
                  language === "vietnamese"
                    ? order_customer.status.status
                    : order_customer.status.status
                }
                style={{
                  textAlign: "center",
                }}
              />
            </Col>
            {/*
            <Col
              justify="center"
              xs={12}
              sm={12}
              md={18}
              style={{
                margin: 20,
              }}
            >
              <Steps direction="horizontal" size="small" current={status_id}>
                <Step title="Paid" description="" />
                <Step title="In Progress" description="" />
                <Step title="Finished" description="" />
                <Step title="Delivered" description="" />
              </Steps>
            </Col> */}
          </Row>

          <Content className="container">
            <Descriptions title={this.getWord("order-details")}>
              <Descriptions.Item label={this.getWord("customer-name")}>
                {`${order_customer.customer_first_name} ${order_customer.customer_last_name}`}
              </Descriptions.Item>

              <Descriptions.Item label={this.getWord("email")}>
                {order_customer.customer_email.toLowerCase()}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("staff")}>
                <StaffList record={order_customer} />
              </Descriptions.Item>

              <Descriptions.Item label={this.getWord("store")}>
                {order_customer.store.name}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("date")}>
                {moment(order_customer.timestamp).format(dateFormat)}
              </Descriptions.Item>

              <Descriptions.Item label={this.getWord("hotel")}>
                {order_customer.hotel_ids && order_customer.hotel_ids.length
                  ? order_customer.hotel_ids.map(
                      (h) =>
                        h.active && (
                          <span
                            key={h.id}
                          >{`${h.hotel.name}, room: ${h.room} `}</span>
                        )
                    )
                  : order_customer.store_id === 4
                  ? "On Line"
                  : "No Hotel"}
                {order_customer.hotel}
              </Descriptions.Item>
              {order_customer.store_id !== 4 && (
                <Descriptions.Item label={this.getWord("fitting-day")}>
                  {order_customer.fitting !== null
                    ? moment(order_customer.fitting).format(
                        language === "vietnamese" ? dateFormatViet : dateFormat
                      )
                    : "-"}
                </Descriptions.Item>
              )}
              {order_customer.store_id !== 4 && (
                <Descriptions.Item label={this.getWord("last-day")}>
                  {order_customer.last_day !== null
                    ? moment(order_customer.last_day)
                        .utc()
                        .format(
                          language === "vietnamese" ? "DD/MM/YY" : "MMM DD,YY"
                        )
                    : "-"}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Row type="flex" justify="space-between"></Row>
            <Divider
              style={{
                marginTop: 40,
              }}
            >
              <h2>{this.getWord("items")}</h2>
            </Divider>
            <Table
              dataSource={items}
              pagination={false}
              rowKey="id"
              expandedRowRender={(record) => (
                <Table
                  dataSource={_.toArray(
                    _.sortBy(record.garments, (x) => x.index)
                  )}
                  pagination={false}
                  rowKey="id"
                >
                  <Column
                    title={this.getWord("item-number")}
                    dataIndex="item_alias"
                    key="_item_alias"
                    render={(item_alias, record) => (
                      <Link to={`/i/${item_alias}`}>{item_alias}</Link>
                    )}
                  />
                  <Column
                    title={this.getWord("description-")}
                    dataIndex="description"
                    key="_description"
                    render={(description, record) => (
                      <span>
                        {language === "vietnamese"
                          ? record.vietnamese
                          : description}
                      </span>
                    )}
                  />
                  <Column
                    title={this.getWord("status")}
                    dataIndex="status_id"
                    key="status_id"
                    render={(status, record) => (
                      <span>
                        {language === "vietnamese"
                          ? record.item_status_viet
                          : status}
                      </span>
                    )}
                  />
                  <Column
                    title={this.getWord("notes")}
                    dataIndex="notes"
                    key="_notes"
                    render={(notes) => (
                      <Typography>
                        {notes && notes.replace(/<[^>]*>?/gm, "")}
                      </Typography>
                    )}
                  />
                </Table>
              )}
            >
              <Column
                title={this.getWord("type")}
                dataIndex="garment"
                key="garment"
                render={(garment, record) => (
                  <span>
                    {language === "vietnamese"
                      ? record.garment_viet + " " + record.detail_viet
                      : garment + " " + record.detail}
                  </span>
                )}
              />
              <Column
                title={this.getWord("customer-name")}
                dataIndex="customer_name"
                key="customer_name"
              />
              <Column
                title={this.getWord("price")}
                dataIndex="price"
                key="price"
                render={(price) => <b>{price + " [USD]"}</b>}
              />
            </Table>
            <Divider
              style={{
                marginTop: 40,
              }}
            >
              <h2>{this.getWord("order-payments")}</h2>
            </Divider>
            <Row gutter={8}>
              <Col sm={24} xs={24} md={6} style={{ marginBottom: 20 }}>
                <Descriptions title="" column={1} bordered>
                  <Descriptions.Item
                    label={this.getWord("total-price")}
                    style={{ alignSelf: "right" }}
                  >
                    ${order_customer.total_price}
                  </Descriptions.Item>
                  {order_customer.discount > 0 && (
                    <Descriptions.Item label={this.getWord("discount")}>
                      ${order_customer.discount}
                    </Descriptions.Item>
                  )}
                  {order_customer.discount > 0 && (
                    <Descriptions.Item label={this.getWord("to-pay")}>
                      ${order_customer.total_price - order_customer.discount}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={this.getWord("paid")}>
                    $
                    {order_customer.total_price -
                      order_customer.discount -
                      order_customer.balance}
                  </Descriptions.Item>
                  <Descriptions.Item label={this.getWord("balance")}>
                    <span
                      style={{
                        color: order_customer.balance === "0" ? "green" : "red",
                      }}
                    >
                      ${order_customer.balance}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col sm={24} xs={24} md={18}>
                <Table
                  dataSource={order_customer.payments}
                  pagination={false}
                  rowKey="id"
                  size="small"
                >
                  <Column
                    title={this.getWord("date")}
                    dataIndex="creation_date"
                    key="creation_date"
                    render={(record) => moment(record).format(dateFormat)}
                  />
                  <Column
                    title={this.getWord("payment-type")}
                    dataIndex="type"
                    key="type"
                    render={(record) => record.name}
                  />
                  <Column
                    title="Amount [USD]"
                    dataIndex="amount"
                    key="amount"
                    render={(record) => `$${record}`}
                  />
                  <Column
                    title="Method"
                    dataIndex="is_cc"
                    key="is_cc"
                    render={(is_cc) =>
                      is_cc === 0 ? (
                        <Icon type="dollar" style={{ color: "green" }} />
                      ) : (
                        <Icon type="credit-card" style={{ color: "blue" }} />
                      )
                    }
                  />
                  <Column
                    title={this.getWord("cashier")}
                    dataIndex="staff"
                    key="staff"
                    render={(record) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <Avatar src={record.image} />
                        <span>{record.name}</span>
                      </div>
                    )}
                  />
                  <Column
                    title={this.getWord("store")}
                    dataIndex="store"
                    key="store"
                    render={(record) => record && record.name}
                  />
                  <Column
                    title={this.getWord("notes")}
                    dataIndex="notes"
                    key="notes"
                  />
                </Table>
              </Col>
            </Row>

            <Row>
              <Col>
                {ifus.length > 0 && (
                  <div>
                    <Divider
                      style={{
                        marginTop: 40,
                      }}
                    >
                      <h2>IFU</h2>
                    </Divider>
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <Table dataSource={ifus} pagination={false} rowKey="id">
                        <Column
                          title={this.getWord("date")}
                          dataIndex="creation_date"
                          key="creation_date"
                        />
                        <Column
                          title={this.getWord("staff")}
                          dataIndex="staff"
                          key="staff"
                        />
                        <Column
                          title={this.getWord("screen")}
                          dataIndex="screen"
                          key="screen"
                        />
                        <Column
                          title={this.getWord("notes")}
                          dataIndex="notes"
                          key="notes"
                        />
                        <Column
                          title={this.getWord("entity")}
                          dataIndex="entity"
                          key="entity"
                        />
                      </Table>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Content>
          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            onCancel={() => this.setState({ visible: false })}
          >
            <img
              style={{
                width: "100%",
              }}
              alt="Bebe Tailor"
              src={image}
              onClick={() => this.setState({ visible: false })}
            />
          </Modal>
          <Footer
            style={{
              textAlign: "center",
              flex: 1,
            }}
          >
            Bebe Tailor {new Date().getFullYear().toString()}, Hoi An, Vietnam.
          </Footer>
        </Layout>
      );
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.checkLanguage();
    this.setState({ user: Auth.getProfile() });
    this.getDictionary();

    this.getOrderData(id);
    this.getOrderItems(id);
    //this.getOrderPayments(id);
    //this.getOrderIFU(id);
  };
  getDictionary = () => {
    fetch(api + "/dictionaries")
      .then((res) => res.json())
      .then((dictionary) => {
        this.setState({ dictionary });
      });
  };

  checkLanguage = () => {
    localStorage.getItem("language")
      ? this.setState({ language: localStorage.getItem("language") })
      : this.setState({ language: "vietnamese" });
  };
  handleLanguage = () => {
    this.state.language === "vietnamese"
      ? this.setState({ language: "english" })
      : this.setState({ language: "vietnamese" });

    this.state.language === "vietnamese"
      ? localStorage.setItem("language", "english")
      : localStorage.setItem("language", "vietnamese");
  };

  getLanguage = () => {
    return this.state.language;
  };
  getWord = (key) => {
    return this.state.dictionary
      ? this.state.language === "vietnamese"
        ? this.state.dictionary.find((i) => i.key === key)
          ? this.state.dictionary.find((i) => i.key === key).vietnamese
          : ""
        : this.state.dictionary.find((i) => i.key === key)
        ? this.state.dictionary.find((i) => i.key === key).english
        : ""
      : "";
  };

  getOrderData = (id) => {
    fetch(api + "orders/detail/" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((order_customer) => {
        this.setState({ order_customer });
        this.setState({ error: false });
        this.setState({ loading: false });

        this.setState({ status_id: order_customer.status.id });
      })
      .catch((error) => {
        this.setState({ loading: false });
        this.setState({ error: true });
      });
  };

  getOrderItems = (id) => {
    fetch(api + "web_order_items?filter[where][order_id]=" + id)
      .then((res) => {
        return res.json();
      })
      .then((order_item) => {
        let items = _(order_item)
          .groupBy((x) => x.group + x.customer_name)

          .map((value, key) => ({
            group: key,
            garments: value,
            garment: value[0].garment,
            customer_name: value[0].customer_name,
            price: value[0].price,
            detail: value[0].is_suit
              ? "(" +
                value[0].num_jackets +
                " Jackets, " +
                value[0].num_pants +
                " Trousers)"
              : "",
            is_suit: value[0].is_suit,
            id: value[0].id,
            vietnamese: value[0].vietnamese,
            detail_viet: value[0].is_suit
              ? "(" +
                value[0].num_jackets +
                " Áo vét-tông, " +
                value[0].num_pants +
                " Quần tây)"
              : "",
            staff_thumbnail: value[0].staff_thumbnail,
            garment_viet: value[0].garment_viet,
            index: value[0].index,
          }))
          .value();
        this.setState({ items: _.sortBy(items, (x) => x.index) });
        this.setState({ order_item: _.sortBy(order_item, (x) => x.index) });
      });
  };

  getOrderPayments = (id) => {
    fetch(api + "web_order_payments?filter[where][order_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((payments) => {
        this.setState({ payments });
      })
      .catch((error) => this.setState({ error: true }));
  };

  getOrderIFU = (id) => {
    fetch(api + "web_order_ifus?filter[where][order_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((ifus) => {
        this.setState({ ifus });
      })
      .catch((error) => this.setState({ error: true }));
  };
}

export default Order;
