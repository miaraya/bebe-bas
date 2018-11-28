import React, {Component} from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import {Layout, Row, Col, Modal} from "antd";
import {Divider} from "antd";
import {Spin} from "antd";
import {Table} from "antd";
import {Link} from "react-router";

import Logo from "../assets/logo_small.png";
import {api} from "./constants";
const {Column} = Table;

const {Content, Header} = Layout;

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      image: "",
      visible: false,
      order_customer: []
    };
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.getOrderData(id);
    this.getOrderItems(id);
    this.getOrderPayments(id);
  };

  getOrderData = id => {
    fetch(api + "web_order_customers/" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          console.log("error");
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(order_customer => {
        this.setState({order_customer});
        this.setState({error: false});
        this.setState({loading: false});
      })
      .catch(error => {
        this.setState({loading: false});
        this.setState({error: true});
      });
  };

  getOrderItems = id => {
    fetch(api + "web_order_items?filter[where][order_id]=" + id)
      .then(res => {
        return res.json();
      })
      .then(order_item => {
        this.setState({order_item});
        this.setState({loading: false});
      });
  };

  getOrderPayments = id => {
    fetch(api + "web_order_payments?filter[where][order_id]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(payments => {
        this.setState({payments});
        console.log("no errror");
      })
      .catch(error => this.setState({error: true}));
  };
  render() {
    const {id} = this.props.params;
    const {
      loading,
      error,
      image,
      visible,
      order_customer,
      order_item,
      payments
    } = this.state;
    console.log(this.state);
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
            <Divider style={{marginTop: 40}}>
              <h2>Items</h2>
            </Divider>
            <Table dataSource={order_item} pagination={false}>
              <Column
                title="Item Number"
                dataIndex="id"
                key="id"
                render={id => <Link to={`/i/${id}`}>{id}</Link>}
              />
              <Column
                title="Garment Type"
                dataIndex="description"
                key="description"
              />
              <Column
                title="Customer"
                dataIndex="customer_name"
                key="customer_name"
              />
              <Column
                title="Item Status"
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
            <Divider style={{marginTop: 40}}>
              <h2>Payments</h2>
            </Divider>
            <Col style={{margin: 20}}>
              <h3>Total: {order_customer.total}</h3>
              <h3>Balance: {order_customer.balance}</h3>
            </Col>

            <Table dataSource={payments} pagination={false}>
              <Column
                title="Payment Date"
                dataIndex="creation_date"
                key="creation_date"
              />
              <Column title="Paymen Type" dataIndex="type" key="type" />
              <Column title="Amount" dataIndex="amount" key="amount" />
              <Column title="Currency" dataIndex="currency" key="currency" />
              <Column title="Notes" dataIndex="notes" key="notes" />
            </Table>
          </Content>
          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            onCancel={() => this.setState({visible: false})}
          >
            <img
              style={{width: "100%"}}
              alt="Bebe Tailor"
              src={image}
              onClick={() => this.setState({visible: false})}
            />
          </Modal>
        </Layout>
      );
  }
}

export default Order;
