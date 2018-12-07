import React, {Component} from "react";
import {Link} from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import {Spin} from "antd";
import {Divider} from "antd";

import Logo from "../assets/logo_small.png";

import {api, fabric_url, fabric_url_full} from "./constants";
import {Card} from "antd";
import {Layout, Modal} from "antd";
import {Rate} from "antd";
import _ from "lodash";

const {Content, Header} = Layout;

class Swatchbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      image: "",
      visible: false,
      locations: []
    };
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.getSwatchbookData(id);
    this.getFabrics(id);
  };

  getFabrics = id => {
    fetch(api + "fabricdetails?filter[where][swatchbook]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(fabrics => {
        var result = _(fabrics)
          .groupBy(x => x.unique_code)
          .map((value, key) => ({
            stock: value,
            unique_code: key,
            old_code: value[0].old_code,
            swatchbook: value[0].swatchbook,
            fabric_image: value[0].fabric_image,
            color: value[0].color,
            fabric_id: value[0].fabric_id,
            hetvai: true
          }))
          .value();
        result = this.checkHetVai(result);

        this.setState({fabrics: result});
      })
      .catch(error => {});
  };
  checkHetVai = data => {
    var total;

    data.map(r => {
      total = 0;
      r.stock.map(s => {
        total = total + Number(s.total_stock) + Number(s.extra_fabric);
        //console.log(total);
      });
      total > 0 ? (r.hetvai = false) : (r.hetvai = true);
    });
    return data;
  };
  getSwatchbookData = id => {
    fetch(api + "web_swatchbooks?filter[where][unique_code]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(swatchbook => {
        this.setState({swatchbook});
        this.setState({loading: false});
        this.setState({error: false});
      })
      .catch(error => {
        this.setState({loading: false});
        this.setState({error: true});
      });
  };
  render() {
    const {id} = this.props.params;

    const {loading, error, fabrics, swatchbook, image, visible} = this.state;

    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error) {
      return (
        <div>
          <b>SWATCHBOOK {this.props.params.id} NOT FOUND :(</b>
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Header className="header">
            <Link to={`/`}>
              <img src={Logo} alt="Bebe Tailor" width="150px" />
            </Link>{" "}
          </Header>
          <Content className="container">
            {swatchbook.length > 0 ? (
              swatchbook.map(s => (
                <div key={s.id}>
                  <div>
                    <Divider>
                      <h2>Swatchbook {id.toUpperCase()}</h2>
                    </Divider>
                    <div>Number of fabrics: {s.count}</div>
                    <div>Type: {s.description}</div>
                    <div>Alias: {s.alias}</div>
                  </div>
                </div>
              ))
            ) : (
              <div>Swatchbook {this.props.params.id} not found</div>
            )}
            <div
              style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}
            >
              {fabrics ? (
                fabrics.map(fabric => (
                  <Card
                    style={{margin: "auto", maxWidth: 300, marginTop: 20}}
                    title={
                      <div
                        style={{
                          display: "flex",
                          flex: 1,
                          justifyContent: "space-between"
                        }}
                      >
                        <Link to={`/f/${fabric.unique_code}`}>
                          <h2>{fabric.unique_code}</h2>
                        </Link>

                        {fabric.price_band > 0 ? (
                          <Rate
                            disabled
                            defaultValue={Number(fabric.price_band)}
                          />
                        ) : (
                          <div />
                        )}
                      </div>
                    }
                    bordered={true}
                    cover={
                      <img
                        alt={fabric.unique_code}
                        src={fabric_url + fabric.fabric_image}
                        onClick={() => {
                          this.setState({
                            image: fabric_url_full + fabric.fabric_image
                          });
                          this.setState({visible: true});
                        }}
                      />
                    }
                  >
                    <div style={{margin: 10}}>Color: {fabric.color}</div>
                    <div style={{margin: 10}}>Old Code: {fabric.old_code}</div>
                    {fabric.hetvai ? (
                      <div style={{margin: 10, color: "red"}}>Out of Stock</div>
                    ) : (
                      <div style={{margin: 10, color: "green"}}>In Stock</div>
                    )}
                  </Card>
                ))
              ) : (
                <div />
              )}
            </div>
          </Content>

          <Modal
            visible={visible}
            footer={null}
            maskClosable={true}
            onCancel={() => {
              this.setState({visible: false});
              this.setState({image: null});
            }}
            width="100%"
          >
            <img
              style={{width: "100%"}}
              alt="Bebe Tailor"
              src={image}
              onClick={() => {
                this.setState({visible: false});
                this.setState({image: null});
              }}
            />
          </Modal>
        </Layout>
      );
  }
}

export default Swatchbook;
