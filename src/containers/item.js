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
import Top from "../components/top";
import AuthService from "../AuthService";

const Auth = new AuthService(null);


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
    this.setState({language: localStorage.getItem("language")});
    const profile = Auth.getProfile();

    this.setState({
      user: profile
    });

    let id = this.props.params.id;
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
      .then(res => res.json())
      .then(dictionary => {
        this.setState({dictionary});
        this.setState({isLoading: false});
      });
  };


  handleLanguage = () => {
    this.state.language === "vietnamese"
      ? this.setState({language: "english"})
      : this.setState({language: "vietnamese"});

    this.state.language === "vietnamese"
      ? localStorage.setItem("language", "english")
      : localStorage.setItem("language", "vietnamese");
  };
  getLanguage = () => {
    return this.state.language;
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
              measurement_images: measurement_images[0]
                ? measurement_images[0].measurements
                : []
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
        json
          ? this.setState({measurement_note: json[0] ? json[0].note : ""})
          : this.setState({measurement_note: ""});
        var measurements = _(json)
          .groupBy(x => x.customer_name)
          .map((value, key) => ({
            measurements: value,
            name: key
          }))
          .value();

        measurements
          ? this.setState({
              measurements: measurements[0] ? _.sortBy(measurements[0].measurements, [function (o) {return o.order;}]) : []
            })
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
    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error|| !order_customer) {
      return (
        <div>
          <b>ITEM NOT FOUND :(</b>
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
          <Header className="header">
            <img src={Logo} alt="Bebe Tailor" width="150px" />
          </Header>

          <Content className="container">
            <Divider>
              <h2>{this.getWord("item")} #{id}</h2>
              <a href={`/i/print/${id}`} target="_blank" rel="noopener noreferrer">
              {this.getWord("print")}
              </a>
            </Divider>

            <Row type="flex" justify="space-between">
              <Col>
                <Row>
                {this.getWord("order")}: <b />
                {order_customer &&
                  <Link to={`/o/${order_customer.order_id}`}>
                    {order_customer.order_id}
                  </Link>
                }
                </Row>
                <Row>
                {this.getWord("order-status") }: <b>{this.state.language === "vietnamese" ? order_customer.order_status_viet: order_customer.status}</b>
                </Row>
                <Row>
                {this.getWord("customer-name")}: <b>{order_customer.customer_name}</b>
                </Row>
                <Row>
                {this.getWord("email")}:{" "}
                  <b>
                    {order_customer.email
                      ? order_customer.email.toLowerCase()
                      : ""}
                  </b>
                </Row>
                <Row>
                {this.getWord("staff")}:{" "}
                  <b>
                    {order_customer.staff} - {order_customer.store}
                  </b>
                </Row>
                <Row>
                  
                {this.getWord("date") }: <b>{this.state.language === "vietnamese" ? order_customer.order_date_viet: order_customer.order_date}</b>

                </Row>
              </Col>
              <Col>
                <Row>
                
                {this.getWord("item-status")}: <b>{this.state.language === "vietnamese" ? details.item_status_viet: details.status_id}</b>
                </Row>
                <Row>
                {this.getWord("hotel")}: <b>{order_customer.hotel}</b>
                </Row>

                <Row>
                {this.getWord("room")}: <b>{order_customer.room}</b>
                </Row>
                <Row>
                {this.getWord("fitting-day") }: <b>{this.state.language === "vietnamese" ? order_customer.fitting_day_viet: order_customer.fitting_day}</b>

                </Row>
                <Row>
                {this.getWord("last-day") }: <b>{this.state.language === "vietnamese" ? order_customer.last_day_viet: order_customer.last_day}</b>
                </Row>
              </Col>
            </Row>

            <Divider />

            <Row>
              <Tabs defaultActiveKey="1" tabPosition="top">
                <TabPane tab={<h3>{this.getWord("items")}</h3>} key="1">
                  <h3>{this.getWord("details")}</h3>
                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    <Col>
                      <Row>
                      {this.getWord("customer-name")}: <b>{details.customer_name}</b>
                      </Row>
                      <Row>
                      {this.getWord("type")}:  <b>{this.state.language === "vietnamese" ? details.vietnamese: details.description}</b>
                      </Row>

                      <Row>
                      
                      {this.getWord("status")}: <b>{this.state.language === "vietnamese" ? details.item_status_viet: details.status_id}</b>
                      
                      </Row>
                      <Row>
                      {this.getWord("notes")}:
                        <b>{details.notes ? details.notes : this.getWord("no-notes")}</b>
                      </Row>
                    </Col>
                  </Row>
                  <h3>{this.getWord("options")}</h3>
                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    <Col>
                      {options.length > 0
                        ? options.map(o => (
                            <Row key={o.id}>
                              { this.state.language === "vietnamese" ? 
                              <div>{o.option_name_viet}:  <b>{o.option_value_viet}</b></div>:
                              <div>{o.option_name}:  <b>{o.value}</b></div>
                        }

                            </Row>
                          ))
                        : this.getWord("no-options")}
                    </Col>
                  </Row>
                  <h3>{this.getWord("image")}</h3>

                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    {images.length > 0
                      ? images.map(m => (
                          <Card
                            key={m.id}
                            hoverable
                            onClick={() => {
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
                            <Meta title={m.notes ? m.notes : this.getWord("no-notes")} />
                          </Card>
                        ))
                      : this.getWord("no-images") }
                  </Row>
                  <h3>{this.getWord("fabric")}</h3>

                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    {fabrics.length > 0
                      ? fabrics.map(f => (
                          <Card
                            title={
                              f.unique_code + (f.type === 1 ? " - " + this.getWord("lining") : "")
                            }
                            key={f.id}
                            hoverable
                            onClick={() => {
                              this.setState({image: fabric_url_full + f.image});
                              this.setState({visible: true});
                            }}
                            style={{width: 300, margin: 10}}
                            cover={
                              <img
                                alt="Bebe Tailor"
                                src={fabric_url + f.image}
                              />
                            }
                          >
                            <Meta title={f.notes ? f.notes : this.getWord("no-notes")} />
                          </Card>
                        ))
                      : this.getWord("no-fabrics")}
                  </Row>
                </TabPane>
                <TabPane tab={<h3>{this.getWord("fitting-")}</h3>} key="2">
                  <h3>{this.getWord("history")}</h3>
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
                          dot={f.status === "done" && <Icon type="check" />}
                        >
                          <Row>
                            <b>{f.creation_date}</b>
                          </Row>
                          <Row>{this.getWord("alteration")}: <b>{this.state.language === "vietnamese" ? f.fitting_alteration_viet: f.alteration}</b></Row>
                          
                          {f.changes_needed !== "" &&
                          <Row>{this.getWord("changes-needed")}: <b>{f.changes_needed}</b></Row>   
                        }
                          <Row>{this.getWord("status")}:  <b>{this.state.language === "vietnamese" ? f.fitting_status_viet: f.status}</b></Row>
                        </Timeline.Item>
                      ))
                    ) : (
                      <div>{this.getWord("no-history")}</div>
                    )}
                  </Timeline>
                </TabPane>
                <TabPane tab={<h3>{this.getWord("measurements")}</h3>} key="3">
                  <h3>{this.getWord("notes")}</h3>
                  <Row type="flex" style={{margin: 20}}>
                    {measurement_note ? measurement_note : this.getWord("no-notes")}
                  </Row>
                  <h3>{this.getWord("measurements")}</h3>

                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    <Col>
                      {measurements.length > 0
                        ? measurements.map(m => (
                            <Row key={m.id}>
                              {m.type_viet + "  /  " + m.type_eng}:{" "}
                              <b>{m.value}</b>
                            </Row>
                          ))
                        : this.getWord("no-measurements")}
                    </Col>
                  </Row>

                  <h3>{this.getWord("images")}</h3>
                  <Row type="flex" justify="space-between" style={{margin: 20}}>
                    {measurement_images.length > 0
                      ? measurement_images.map(mi => (
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
                      : this.getWord("no-images")}
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
