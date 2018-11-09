import React, {Component} from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import {Layout, Tabs, Row, Col, Modal} from "antd";
import {Divider} from "antd";
import {Spin} from "antd";
import {Timeline, Icon} from "antd";
import _ from "lodash";
import {Link} from "react-router";

import Logo from "../assets/logo_small.png";
import {api, fabric_url, item_images, fabric_url_full} from "./constants";
import {Card} from "antd";

const {Meta} = Card;

const {Content, Header} = Layout;
const TabPane = Tabs.TabPane;

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      details: [],
      images: [],
      options: [],
      image: "",
      visible: false,
      fabrics: [],
      fittings: [],
      measurements: [],
      measurement_images: []
    };
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.getOrderData(id);
    this.getItemInfo(id);
    this.getItemImages(id);
    this.getItemOptions(id);
    this.getItemFabrics(id);
    this.getItemFittings(id);
    this.getMeasurements(id);
    this.getMeasurementImages(id);
  };
  getMeasurementImages = id => {
    fetch(
      api +
        "web_order_measurement_image_items?filter[where][item_id]=" +
        this.props.params.id
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(json => {
        var measurement_images = _(json)
          .groupBy(x => x.customer_name)
          .map((value, key) => ({
            measurements: value,
            name: key
          }))
          .value();
        measurement_images
          ? this.setState({
              measurement_images: measurement_images[0].measurements
            })
          : this.setState({measurement_images: []});
      });
  };
  getMeasurements = id => {
    fetch(api + "web_order_measurement_items?filter[where][item_id]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(json => {
        console.log(json);
        json
          ? this.setState({measurement_note: json[0].note})
          : this.setState({measurement_note: ""});
        var measurements = _(json)
          .groupBy(x => x.customer_name)
          .map((value, key) => ({
            measurements: value,
            name: key
          }))
          .value();

        measurements
          ? this.setState({measurements: measurements[0].measurements})
          : this.setState({measurements: []});
        this.setState({error: false});
      });
  };

  getItemFittings = id => {
    fetch(api + "web_order_fittings?filter[where][item_id]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(fittings => {
        this.setState({fittings});
      });
  };
  getItemFabrics = id => {
    fetch(
      api + "web_order_fabrics?filter[where][item_id]=" + this.props.params.id
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(fabrics => {
        this.setState({fabrics});
      });
  };
  getItemOptions = id => {
    fetch(
      api + "web_order_options?filter[where][item_id]=" + this.props.params.id
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(options => {
        this.setState({options});
      });
  };

  getItemImages = id => {
    fetch(api + "item_images?filter[where][item_id]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(images => {
        this.setState({images});
      });
  };

  getItemInfo = id => {
    fetch(api + "web_order_items?filter[where][item_id]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(details => {
        details
          ? this.setState({details: details[0]})
          : this.setState({details: []});
        this.setState({error: false});
      })
      .catch(error => this.setState({error: true}));
  };

  getOrderData = id => {
    fetch(api + "web_item_customers/" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
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
  render() {
    const {id} = this.props.params;
    const {
      order_customer,
      loading,
      error,
      details,
      images,
      image,
      visible,
      options,
      fabrics,
      fittings,
      measurements,
      measurement_images,
      measurement_note
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
          <b>ITEM NOT FOUND :(</b>
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
              <h2>Item #{id}</h2>
            </Divider>

            <Row type="flex" justify="space-between">
              <Col>
                <Row>
                  Order Number: <b />
                  <Link to={`/o/${order_customer.order_id}`}>
                    {order_customer.order_id}
                  </Link>
                </Row>
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
              </Col>
              <Col>
                <Row>
                  Status: <b>{order_customer.status}</b>
                </Row>
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

            <Divider />

            <Row>
              <Tabs defaultActiveKey="1" tabPosition="top">
                <TabPane tab={<h3>Item</h3>} key="1">
                  <h3>Details</h3>
                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    <Col>
                      <Row>
                        Sub Customer Name: <b>{details.customer_name}</b>
                      </Row>
                      <Row>
                        Type: <b>{details.description}</b>
                      </Row>

                      <Row>
                        Status: <b>{details.status_id}</b>
                      </Row>
                      <Row>
                        Notes:{" "}
                        <b>{details.notes ? details.notes : "No notes"}</b>
                      </Row>
                    </Col>
                  </Row>
                  <h3>Options</h3>
                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    <Col>
                      {options.length > 0 ? (
                        options.map(o => (
                          <Row key={o.id}>
                            {o.option_name}: <b>{o.value}</b>
                          </Row>
                        ))
                      ) : (
                        <div />
                      )}
                    </Col>
                  </Row>
                  <h3>Images</h3>

                  <Row type="flex" justify="center">
                    {images.length > 0 ? (
                      images.map(m => (
                        <Card
                          key={m.id}
                          hoverable
                          onClick={() => {
                            console.log(m.image);
                            this.setState({image: item_images + m.image});
                            this.setState({visible: true});
                          }}
                          style={{width: 300, margin: 10}}
                          cover={
                            <img
                              alt="Bebe Tailor"
                              src={item_images + m.image}
                            />
                          }
                        >
                          <Meta title={m.notes ? m.notes : "No notes"} />
                        </Card>
                      ))
                    ) : (
                      <div />
                    )}
                  </Row>
                  <h3>Fabrics</h3>

                  <Row type="flex" justify="center">
                    {fabrics.length > 0 ? (
                      fabrics.map(f => (
                        <Card
                          title={
                            f.unique_code + (f.type === 1 ? " - Lining" : "")
                          }
                          key={f.id}
                          hoverable
                          onClick={() => {
                            this.setState({image: fabric_url_full + f.image});
                            this.setState({visible: true});
                          }}
                          style={{width: 300, margin: 10}}
                          cover={
                            <img alt="Bebe Tailor" src={fabric_url + f.image} />
                          }
                        >
                          <Meta title={f.notes ? f.notes : "No notes"} />
                        </Card>
                      ))
                    ) : (
                      <div />
                    )}
                  </Row>
                </TabPane>
                <TabPane tab={<h3>Fittings</h3>} key="2">
                  <h3>History</h3>
                  <Timeline mode="left" style={{margin: 20}}>
                    {fittings.length > 0 ? (
                      fittings.map(f => (
                        <Timeline.Item
                          key={f.id}
                          color={
                            f.alteration === "yes"
                              ? "red"
                              : f.status === "done"
                                ? "green"
                                : ""
                          }
                          dot={f.status === "done" ? <Icon type="check" /> : ""}
                        >
                          <Row>
                            <b>{f.creation_date}</b>
                          </Row>
                          <Row>Alteration: {f.alteration}</Row>
                          <Row>Changes Needed: {f.changes_needed}</Row>
                          <Row>Status: {f.status}</Row>
                        </Timeline.Item>
                      ))
                    ) : (
                      <div />
                    )}
                  </Timeline>
                </TabPane>
                <TabPane tab={<h3>Measuremets</h3>} key="3">
                  <h3>Notes</h3>
                  <Row type="flex" style={{margin: 20}}>
                    {measurement_note ? measurement_note : "No notes"}
                  </Row>
                  <h3>Measurements</h3>

                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    <Col>
                      {measurements.length > 0 ? (
                        measurements.map(m => (
                          <Row key={m.id}>
                            {m.type_viet + "  /  " + m.type_eng}:{" "}
                            <b>{m.value}</b>
                          </Row>
                        ))
                      ) : (
                        <div />
                      )}
                    </Col>
                  </Row>

                  <h3>Images</h3>
                  <Row type="flex" justify="center">
                    {measurement_images.length > 0 ? (
                      measurement_images.map(mi => (
                        <Card
                          key={mi.id}
                          hoverable
                          onClick={() => {
                            this.setState({image: item_images + mi.image});
                            this.setState({visible: true});
                          }}
                          style={{width: 300, margin: 10}}
                          cover={
                            <img
                              alt="Bebe Tailor"
                              src={item_images + mi.image}
                            />
                          }
                        />
                      ))
                    ) : (
                      <div />
                    )}
                  </Row>
                </TabPane>
              </Tabs>
            </Row>
          </Content>
          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            onCancel={() => this.setState({visible: false})}
            width="100%"
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

export default Item;
