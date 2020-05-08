import React, { Component } from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import { Layout, Tabs, Row, Col, Modal } from "antd";
import { Statistic, Steps, Descriptions, Avatar } from "antd";

import { Divider, Empty } from "antd";
import { Spin } from "antd";
import { Timeline, Icon } from "antd";

import _ from "lodash";
import { Link } from "react-router";

import Logo from "../assets/logo_small.png";
import { api } from "./constants";
import { Card } from "antd";
import Top from "../components/top";
import AuthService from "../AuthService";
import moment from "moment";

const { Step } = Steps;

const Auth = new AuthService(null);

const { Meta } = Card;

const { Content, Footer } = Layout;
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
      measurement_images: [],
    };
  }

  render() {
    const { id } = this.props.params;
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
      measurement_note,
      language,
      status_id,
    } = this.state;

    let dateFormat = "MMM DD,YY hh:mm A";
    let dateFormatViet = "DD/MM/YY hh:mm A";

    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error || !order_customer) {
      return (
        <div>
          ITEM <b>{this.props.params.id.toUpperCase()}</b> NOT FOUND :(
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
            <Col xs={24} sm={24} md={4} justify="center">
              <Statistic
                title={this.getWord("item-number")}
                prefix="#"
                value={id}
                groupSeparator=""
                style={{
                  textAlign: "center",
                }}
              />
            </Col>
            <Col xs={24} sm={24} md={4} justify="center">
              <Statistic
                title={this.getWord("item")}
                value={
                  this.state.language === "vietnamese"
                    ? details.vietnamese
                    : details.description
                }
                style={{
                  textAlign: "center",
                }}
              />
            </Col>
            <Col xs={24} sm={24} md={4} justify="center">
              <Statistic
                title={this.getWord("item-status")}
                value={
                  this.state.language === "vietnamese"
                    ? details.item_status_viet
                    : details.status_id
                }
                style={{
                  textAlign: "center",
                }}
              />
            </Col>

            <Col
              justify="center"
              xs={12}
              sm={16}
              md={18}
              style={{
                margin: 20,
              }}
            >
              <Steps direction="horizontal" size="small" current={status_id}>
                <Step title="Paid" description="" />
                <Step title="In Progress" description="" />
                <Step title="Finished" description="" />
              </Steps>
            </Col>
          </Row>
          <Content className="container">
            <Descriptions title={this.getWord("order-details")}>
              <Descriptions.Item label={this.getWord("order")}>
                {order_customer && (
                  <Link to={`/o/${order_customer.order_id}`}>
                    {order_customer.order_id}
                  </Link>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("order-status")}>
                {this.state.language === "vietnamese"
                  ? order_customer.order_status_viet
                  : order_customer.status}
              </Descriptions.Item>

              <Descriptions.Item label={this.getWord("customer-name")}>
                {order_customer.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("email")}>
                {order_customer.email ? order_customer.email.toLowerCase() : ""}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("staff")}>
                <span>
                  {order_customer.staff + " - " + order_customer.store}
                  <Avatar
                    src={order_customer.staff_thumbnail}
                    style={{ marginLeft: 20 }}
                  />
                </span>
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("date")}>
                {moment(order_customer.order_date).format(dateFormat)}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("item-status")}>
                {this.state.language === "vietnamese"
                  ? details.item_status_viet
                  : details.status_id}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("hotel")}>
                {order_customer.hotel}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("room")}>
                {order_customer.room}
              </Descriptions.Item>

              <Descriptions.Item label={this.getWord("fitting-day")}>
                {moment(order_customer.fitting_day).format(
                  language === "vietnamese" ? dateFormatViet : dateFormat
                )}
              </Descriptions.Item>
              <Descriptions.Item label={this.getWord("last-day")}>
                {moment(order_customer.last_day)
                  .utc()
                  .format(language === "vietnamese" ? "DD/MM/YY" : "MMM DD,YY")}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions title={this.getWord("item-details")}></Descriptions>

            <Row>
              <Tabs defaultActiveKey="1" tabPosition="top">
                <TabPane tab={<h3> {this.getWord("items")}</h3>} key="1">
                  <Row gutter={40}>
                    <Col span={8}>
                      <Descriptions title={this.getWord("options")} column={1}>
                        {options.length > 0 ? (
                          options.map((o) => (
                            <Descriptions.Item
                              label={
                                language === "vietnamese"
                                  ? o.option_name_viet
                                  : o.option_name
                              }
                            >
                              {language === "vietnamese"
                                ? o.option_value_viet
                                : o.value}
                            </Descriptions.Item>
                          ))
                        ) : (
                          <Empty />
                        )}
                      </Descriptions>
                      <Divider />{" "}
                      <Descriptions title={this.getWord("notes")} column={1}>
                        <Descriptions.Item label={this.getWord("notes")}>
                          {details.notes
                            ? details.notes
                            : this.getWord("no-notes")}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={8}>
                      <Descriptions
                        title={this.getWord("fabric")}
                        column={1}
                        bordered={false}
                      >
                        {fabrics.length > 0 &&
                          fabrics.map((o) => (
                            <Descriptions.Item key={o.id}>
                              <Card
                                size={"small"}
                                key={o.id}
                                hoverable="hoverable"
                                cover={
                                  <img
                                    onClick={() => {
                                      this.setState({
                                        image: o.image_url,
                                      });
                                      this.setState({ visible: true });
                                    }}
                                    style={{ height: 150, overflow: "hidden" }}
                                    alt={o.unique_code}
                                    src={o.thumbnail_url}
                                  />
                                }
                              >
                                <Meta
                                  title={
                                    <Link to={`/f/${o.unique_code}`}>
                                      {o.unique_code}
                                    </Link>
                                  }
                                  description={
                                    o.notes ? o.notes : this.getWord("no-notes")
                                  }
                                />
                              </Card>
                            </Descriptions.Item>
                          ))}
                      </Descriptions>
                    </Col>
                    <Col span={8}>
                      <Descriptions title={this.getWord("image")} column={1}>
                        {images.length > 0 ? (
                          images.map((o) => (
                            <Descriptions.Item key={o.id}>
                              <Card
                                title={o.unique_code}
                                size={"small"}
                                key={o.id}
                                hoverable="hoverable"
                                cover={
                                  <img
                                    onClick={() => {
                                      this.setState({
                                        image: o.image_url,
                                      });
                                      this.setState({ visible: true });
                                    }}
                                    alt={o.unique_code}
                                    src={o.image_url}
                                  />
                                }
                              >
                                <Meta
                                  description={
                                    o.notes ? o.notes : this.getWord("no-notes")
                                  }
                                />
                              </Card>
                            </Descriptions.Item>
                          ))
                        ) : (
                          <Descriptions.Item>
                            <Empty description={this.getWord("no-images")} />
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab={<h3> {this.getWord("fitting-")}</h3>} key="2">
                  <h3>{this.getWord("history")}</h3>
                  <Timeline
                    mode="left"
                    style={{
                      margin: 20,
                    }}
                  >
                    {fittings.length > 0 ? (
                      fittings.map((f) => (
                        <Timeline.Item
                          key={f.id}
                          color={
                            f.alteration === "yes"
                              ? "red"
                              : f.status === "done"
                              ? "green"
                              : ""
                          }
                          dot={f.status === "done" && <Icon type="check" />}
                        >
                          <Row>
                            <b>{f.creation_date}</b>
                          </Row>
                          <Row>
                            {this.getWord("alteration")}:
                            <b>
                              {this.state.language === "vietnamese"
                                ? f.fitting_alteration_viet
                                : f.alteration}
                            </b>
                          </Row>

                          {f.changes_needed !== "" && (
                            <Row>
                              {this.getWord("changes-needed")}:
                              <b>{f.changes_needed}</b>
                            </Row>
                          )}
                          <Row>
                            {this.getWord("status")}:
                            <b>
                              {this.state.language === "vietnamese"
                                ? f.fitting_status_viet
                                : f.status}
                            </b>
                          </Row>
                        </Timeline.Item>
                      ))
                    ) : (
                      <Empty description={this.getWord("no-history")} />
                    )}
                  </Timeline>
                </TabPane>
                <TabPane tab={<h3> {this.getWord("measurements")}</h3>} key="3">
                  <Row gutter={40}>
                    <Col span={16}>
                      <Descriptions title={this.getWord("values")} column={2}>
                        {measurements.length > 0 ? (
                          measurements.map((o) => (
                            <Descriptions.Item
                              key={o.id}
                              label={
                                language === "vietnamese"
                                  ? o.type_viet
                                  : o.type_eng
                              }
                            >
                              {o.value}
                            </Descriptions.Item>
                          ))
                        ) : (
                          <Empty />
                        )}
                      </Descriptions>
                      <Divider />
                      <Descriptions title={this.getWord("notes")} column={1}>
                        <Descriptions.Item>
                          {measurement_note
                            ? measurement_note
                            : this.getWord("no-notes")}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={8}>
                      <Descriptions title={this.getWord("image")} column={1}>
                        {measurement_images.length > 0 ? (
                          measurement_images.map((o) => (
                            <Descriptions.Item>
                              <Card
                                title={o.unique_code}
                                size={"small"}
                                key={o.id}
                                hoverable="hoverable"
                                cover={
                                  <img
                                    onClick={() => {
                                      this.setState({
                                        image: o.image_url,
                                      });
                                      this.setState({ visible: true });
                                    }}
                                    alt={o.unique_code}
                                    src={o.image_url}
                                  />
                                }
                              >
                                <Meta
                                  description={
                                    o.notes ? o.notes : this.getWord("no-notes")
                                  }
                                />
                              </Card>
                            </Descriptions.Item>
                          ))
                        ) : (
                          <Descriptions.Item>
                            <Empty description={this.getWord("no-images")} />
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Row>
          </Content>
          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            onCancel={() => this.setState({ visible: false })}
            width="100%"
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

    if (_.indexOf(id, "-") > 0) this.getItemId(id);
    else this.getData(id);
  };

  getItemId = (id) => {
    let aux = id.split("-");
    fetch(api + "/orders/getItem/" + aux[0] + "/" + aux[1])
      .then((res) => res.json())
      .then((res) => {
        this.getData(res.id);
      });
  };

  checkLanguage = () => {
    localStorage.getItem("language")
      ? this.setState({ language: localStorage.getItem("language") })
      : this.setState({ language: "vietnamese" });
  };

  getData = (id) => {
    this.getDictionary();
    this.getOrderData(id);
    this.getItemInfo(id);
    this.getItemImages(id);
    this.getItemOptions(id);
    this.getItemFabrics(id);
    this.getItemFittings(id);
    this.getMeasurements(id);
    this.getMeasurementImages(id);
  };

  getDictionary = () => {
    fetch(api + "/dictionaries")
      .then((res) => res.json())
      .then((dictionary) => {
        this.setState({ dictionary });
        this.setState({ isLoading: false });
      });
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

  getMeasurementImages = (id) => {
    fetch(
      api + "web_order_measurement_image_items?filter[where][item_id]=" + id
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((json) => {
        var measurement_images = _(json)
          .groupBy((x) => x.customer_name)
          .map((value, key) => ({ measurements: value, name: key }))
          .value();
        measurement_images
          ? this.setState({
              measurement_images: measurement_images[0]
                ? measurement_images[0].measurements
                : [],
            })
          : this.setState({ measurement_images: [] });
      });
  };
  getMeasurements = (id) => {
    fetch(api + "web_order_measurement_items?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((json) => {
        json
          ? this.setState({
              measurement_note: json[0] ? json[0].note : "",
            })
          : this.setState({ measurement_note: "" });
        var measurements = _(json)
          .groupBy((x) => x.customer_name)
          .map((value, key) => ({ measurements: value, name: key }))
          .value();

        measurements
          ? this.setState({
              measurements: measurements[0]
                ? _.sortBy(measurements[0].measurements, [
                    function (o) {
                      return o.order;
                    },
                  ])
                : [],
            })
          : this.setState({ measurements: [] });
        this.setState({ error: false });
      });
  };

  getItemFittings = (id) => {
    fetch(api + "web_order_fittings?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((fittings) => {
        this.setState({ fittings });
      });
  };
  getItemFabrics = (id) => {
    fetch(api + "web_order_fabrics?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((fabrics) => {
        this.setState({ fabrics });
      });
  };
  getItemOptions = (id) => {
    fetch(api + "web_order_options?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((options) => {
        this.setState({ options });
      });
  };

  getItemImages = (id) => {
    fetch(api + "web_order_images?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((images) => {
        this.setState({ images });
      });
  };

  getItemInfo = (id) => {
    fetch(api + "web_order_items?filter[where][item_id]=" + id)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({ error: true });
          throw new Error("Something went wrong ...");
        }
      })
      .then((details) => {
        details
          ? this.setState({ details: details[0] })
          : this.setState({ details: [] });
        this.setState({ error: false });

        switch (details[0].status_id) {
          case "done":
            this.setState({ status_id: 2 });
            break;
          case "pending":
            this.setState({ status_id: -1 });
            break;
          default:
            this.setState({ status_id: 1 });
        }
      })
      .catch((error) => this.setState({ error: true }));
  };

  getOrderData = (id) => {
    fetch(api + "web_item_customers/" + id)
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
      })
      .catch((error) => {
        this.setState({ loading: false });

        this.setState({ error: true });
      });
  };
}

export default Item;
