import React, { Component } from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import { Layout, Row, Col, Modal } from "antd";
import { Divider } from "antd";
import { Spin } from "antd";
import { Table } from "antd";
import { Link } from "react-router";

import Logo from "../assets/logo_small.png";
import { api } from "./constants";
const { Column } = Table;

const { Content, Header } = Layout;

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      image: "",
      visible: false,
      order_customer: [],
      ifus:[]
    };
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.getOrderData(id);
    this.getOrderItems(id);
    this.getOrderPayments(id);
    this.getOrderIFU(id);
  };

  getOrderData = id => {
    fetch(api + "web_order_customers/" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then(order_customer => {
        this.setState({ order_customer });
        this.setState({ error: false });
        this.setState({ loading: false });
      })
      .catch(error => {
        this.setState({ loading: false });
        this.setState({ error: true });
      });
  };

  getOrderItems = id => {
    fetch(api + "web_order_items?filter[where][order_id]=" + id)
      .then(res => {
        return res.json();
      })
      .then(order_item => {
        this.setState({ order_item });
        this.setState({ loading: false });
      });
  };

  getOrderPayments = id => {
    fetch(api + "web_order_payments?filter[where][order_id]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then(payments => {
        this.setState({ payments });
      })
      .catch(error => this.setState({ error: true }));
  };

  getOrderIFU = id => {
    fetch(api + "web_order_ifus?filter[where][order_id]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then(ifus => {
        this.setState({ ifus });
      })
      .catch(error => this.setState({ error: true }));
  };
  
  render() {
    const { id } = this.props.params;
    const {
      loading,
      error,
      image,
      visible,
      order_customer,
      order_item,
      payments,
      ifus
    } = this.state;
    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error) {
      return (
        <div>
          <b>Order NOT FOUND :(</b>
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Header className="header">
            <img src={Logo} alt="Bebe Tailor" width="150px" />
          </Header>

          <Content className="container">
            <Divider>
              <h2>Order #{id}</h2>
            </Divider>
            <Row type="flex" justify="space-between">
              <Col>
                <Row>
                  Customer Name: <b>{order_customer.customer_name}</b>
                </Row>
                <Row>
                  Email:{" "}
                  <b>
                    {order_customer.email
                      ? order_customer.email.toLowerCase()
                      : ""}
                  </b>
                </Row>
                <Row>
                  Staff:{" "}
                  <b>
                    {order_customer.staff} - {order_customer.store}
                  </b>
                </Row>
                <Row>
                  Date: <b>{order_customer.order_date}</b>
                </Row>
                <Row>
                  Status: <b>{order_customer.status}</b>
                </Row>
              </Col>
              <Col>
                <Row>
                  Hotel: <b>{order_customer.hotel}</b>
                </Row>

                <Row>
                  Room: <b>{order_customer.room}</b>
                </Row>
                <Row>
                  Fitting Day: <b>{order_customer.fitting_day}</b>
                </Row>
                <Row>
                  Last Day: <b>{order_customer.last_day}</b>
                </Row>
              </Col>
            </Row>
            <Divider style={{ marginTop: 40 }}>
              <h2>Items</h2>
            </Divider>
            <Table dataSource={order_item} pagination={false} rowKey="id"

            >
              <Column
                title="Item Number"
                dataIndex="id"
                key="id"
                render={id => <Link to={`/i/${id}`}>{id}</Link>}
              />
              <Column
                title="Type"
                dataIndex="description"
                key="description"
              />
              <Column
                title="Customer Name"
                dataIndex="customer_name"
                key="customer_name"
              />
              <Column
                title="Status"
                dataIndex="status_id"
                key="status_id"
              />
              <Column title="Notes" dataIndex="notes" key="notes" />
              <Column
                title="Price"
                dataIndex="price"
                key="price"
                render={price => <b>{price + " [USD]"}</b>}
              />
            </Table>
            <Divider style={{ marginTop: 40 }}>
              <h2>Payments</h2>
            </Divider>

            <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
              <div style={{ marginRight: 40, marginTop: 20 }}>
                <h4>Total:</h4>
                {
                  order_customer.discount > 0 && (
                    <span>
                      <h4>Discount:</h4>
                      <h4>To Pay:</h4> </span>)
                }
                <h4>Paid:</h4>
                <h4>Balance:</h4>
              </div>

              <div style={{ marginRight: 40, marginTop: 20 }}>
                <h4>${order_customer.total}</h4>
                {order_customer.discount > 0 && (
                  <span>
                    <h4>${order_customer.discount}</h4>
                    <h4>${order_customer.to_pay}</h4>
                  </span>)}
                <h4>${order_customer.paid}</h4>
                <h4>${order_customer.balance}</h4>
              </div>



              <div style={{ flex: 1 }}>
                <Table dataSource={payments} pagination={false} rowKey="id"
                >
                  <Column
                    title="Date"
                    dataIndex="creation_date"
                    key="creation_date"
                  />
                  <Column title="Type"
                    dataIndex="type"
                    key="type" />
                  <Column title="Amount [USD]" dataIndex="amount" key="amount" />
                  <Column title="Cashier" dataIndex="cashier" key="cashier" />
                  <Column title="Store" dataIndex="store" key="store" />ç
              <Column title="Notes" dataIndex="notes" key="notes" />

                </Table>
              </div>
            </div>
{ifus.length >0 && <div>
            <Divider style={{ marginTop: 40 }}>
              <h2>IFU</h2>
            </Divider>
            <div style={{ flex: 1 }}>
                <Table dataSource={ifus} pagination={false} rowKey="id"
                >
                  <Column
                    title="Date"
                    dataIndex="creation_date"
                    key="creation_date"
                  />
                  <Column title="Staff"
                    dataIndex="staff"
                    key="staff" />
                  <Column title="Screen" dataIndex="screen" key="screen" />
              <Column title="Notes" dataIndex="notes" key="notes" />
              <Column title="Entity" dataIndex="entity" key="entity" />


                </Table>
              </div>
              </div>
}
          </Content>
          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            onCancel={() => this.setState({ visible: false })}
          >
            <img
              style={{ width: "100%" }}
              alt="Bebe Tailor"
              src={image}
              onClick={() => this.setState({ visible: false })}
            />
          </Modal>
        </Layout>
      );
  }
}

export default Order;
