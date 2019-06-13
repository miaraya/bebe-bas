import React, {Component} from "react";
import "antd/dist/antd.css";
import "../css/css.css";
import {Layout, Row, Col, Modal} from "antd";
import {Divider} from "antd";
import {Spin} from "antd";
import _ from "lodash";

import Logo from "../assets/logo_small.png";
import {api, fabric_url, item_images} from "./constants";
import {Card} from "antd";

const {Meta} = Card;

const {Content, Header} = Layout;

class Itemprint extends Component {
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
    this.getMeasurements(id);
    this.getMeasurementImages(id);
  };

  componentDidMount = () => {
  	// window.onload = function () { window.print() };
  }

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
              measurements: measurements[0] ? measurements[0].measurements : []
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
      measurements,
      measurement_images,
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
          <b>ITEM NOT FOUND :(</b>
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Header className="header no-flex">
            <div class="col-3 ta-left">
              <img src={Logo} alt="Bebe Tailor" width="150px" />
            </div>
            <div class="col-3 ta-center">
              <h1><b class="big">1</b></h1>
             </div>
            <div class="col-3 ta-right">
              <div class="col-head">Mục #{id}</div>
            </div>
          </Header>
          <Content className="container">
            <Row type="flex" justify="space-between">
              <Col>
                <Row>
                  Số thứ tự: <b />
                    {order_customer.order_id}
                </Row>
                <Row>
                  Nhân viên:{" "}
                  <b>
                    {order_customer.staff} - {order_customer.store}
                  </b>
                </Row>
              </Col>
              <Col>
                <Row>
                  Ngày thử đồ: <b>{order_customer.fitting_day}</b>
                </Row>
                <Row>
                    Ngày cuối cùng: <b>{order_customer.last_day}</b>
                </Row>
              </Col>
            </Row>

            <div class="divider"></div>
            <div class="box col-1">
              <div class="col-head">Mục</div>
              
              <Row>
                  Loại vải: <b>{details.vietnamese}</b>
              </Row>
              <Row>
                  Ghi chú:{" "}
                <b>{details.notes ? details.notes : "Không ghi chú"}</b>
              </Row>

              <Divider />

              <div class="col-head">Tùy chọn</div>

              {options.length > 0
                ? options.map(o => (
                    <div class="item-half-width">
                      {o.option_name_viet}: <b>{o.option_value_viet}</b>
                    </div>
                  ))
                : "No Options"}
            </div>
            <div class="box col-2">
              <div class="col-head">Vải</div>
                {fabrics.length > 0
                  ? fabrics.map(f => (
                      <Card
                        title={
                          f.unique_code + (f.type === 1 ? " - Lining" : "")
                        }
                        key={f.id}
                        style={{width: "43%", margin: 10, display: "inline-block"}}
                        cover={
                          <img
                            alt="Bebe Tailor"
                            src={fabric_url + f.image}
                          />
                        }
                      >
                        <Meta title={f.notes ? f.notes : "Không ghi chú"} />
                      </Card>
                    ))
                  : "No Fabrics"}
              
            </div>

            <div class="divider-no-border" />
            <div class="width-100 box">
              <div class="col-head ta-center">Phép Đo</div>
              {measurements.length > 0
                ? measurements.map(m => (
                    <div class="item-half-width">
                      {m.type_viet + "  /  " + m.type_eng}:{" "}
                      <b>{m.value}</b>
                    </div>
                  ))
                : "Không có phép đo"}
            </div>

            <div class="always-break"></div>
            <div class="page-breaker">
              <Header className="header no-flex width-100">
                <div class="col-3 ta-left">
                  <img src={Logo} alt="Bebe Tailor" width="150px" />
                </div>
                <div class="col-3 ta-center">
                  <h1><b class="big">2</b></h1>
                 </div>
                <div class="col-3 ta-right">
                  <div class="col-head">Mục #{id}</div>
                </div>
              </Header>
              <div class="divider"></div>

              <div class="col-1 box">
                <div class="col-head">Hình ảnh may mặc</div>
                  {images.length > 0
                    ? images.map(m => (
                        <Card
                          key={m.id}
                          style={{width: "40%", margin: 10, display: "inline-block"}}
                          cover={
                            <img
                              alt="Bebe Tailor"
                              src={item_images + m.image}
                            />
                          }
                        >
                          <Meta title={m.notes ? m.notes : "Không có ghi chú"} />
                        </Card>
                      ))
                    : "Không có hình ảnh"}
              </div>
              <div class="col-2 box">
                <div class="col-head">Hình ảnh phù hợp</div>
  	            {measurement_images.length > 0
  	              ? measurement_images.map(mi => (
  	                  <Card
  	                    key={mi.id}
  	                    style={{width: "40%", margin: 10, display: "inline-block"}}
  	                    cover={
  	                      <img
  	                        alt="Bebe Tailor"
  	                        src={item_images + mi.image}
  	                      />
  	                    }
  	                  />
  	                ))
  	              : "Không có hình ảnh"}
              </div>
              <div class="divider"></div>
              <div class="ta-center">
                 <h1>Kết thúc tài liệu</h1>
              </div>
            </div>
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

export default Itemprint;
