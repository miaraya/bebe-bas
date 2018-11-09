import React, {Component} from "react";
import {Link} from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import {Spin} from "antd";
import {Divider} from "antd";
import {Button} from "antd";

import Logo from "../assets/logo_small.png";
import VN from "../assets/vietnam.png";
import EN from "../assets/united-kingdom.png";

import {api, fabric_url, fabric_url_full, location_url} from "./constants";
import {Card} from "antd";
import {Layout, Modal} from "antd";
import {Rate} from "antd";
import {Input} from "antd";

const Search = Input.Search;

const {Content, Header} = Layout;

class Fabric extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: true,
      image: "",
      visible: false,
      locations: [],
      language: "Vietnamese"
    };
  }
  componentWillMount = () => {
    let id = this.props.params.id;
    this.getFabricData(id);
    this.getStockData(id);
  };

  getStockData = id => {
    fetch(api + "fabric_location_stocks?filter[where][unique_code]=" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(locations => {
        this.setState({locations});
      })
      .catch(error => {});
  };

  getFabricData = id => {
    fetch(api + "fabricdetails/" + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          this.setState({error: true});
          throw new Error("Something went wrong ...");
        }
      })
      .then(fabric => {
        this.setState({fabric});
        this.setState({loading: false});
        this.setState({error: false});
      })
      .catch(error => {
        this.setState({loading: false});
        this.setState({error: true});
      });
  };
  render() {
    const {
      loading,
      error,
      fabric,
      image,
      visible,
      locations,
      language,
      query
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
          <b>FABRIC NOT FOUND :(</b>
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Header className="header">
            <img src={Logo} alt="Bebe Tailor" width="150px" />
          </Header>
          <Content className="container">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                flex: 1
              }}
            >
              <div
                style={{
                  margin: 20,
                  flex: 1
                }}
              >
                <Card
                  title={
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        justifyContent: "space-between"
                      }}
                    >
                      <h2>{fabric.unique_code}</h2>

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
                      style={{margin: "auto", maxWidth: 400}}
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
                  <div style={{margin: 10}}>Old Code: {fabric.old_code}</div>
                  <div style={{margin: 10}}>Supplier: {fabric.supplier}</div>
                </Card>
              </div>

              <div
                style={{
                  margin: 20,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 300,
                  flex: 2
                }}
              >
                <Card title={<h2>Fabric Details</h2>} bordered={true}>
                  <div style={{margin: 10}}>Type: {fabric.type}</div>
                  <div style={{margin: 10}}>Color: {fabric.color}</div>
                  <div style={{margin: 10}}>
                    Swatchbook:{" "}
                    <Link to={`/s/${fabric.swatchbook}`}>
                      {fabric.swatchbook}
                    </Link>
                  </div>
                  <div style={{margin: 10}}>
                    Total Stock:{" "}
                    {fabric.total_stock > 0 ? (
                      fabric.total_stock + "m"
                    ) : (
                      <span style={{color: "red"}}>NO STOCK</span>
                    )}
                  </div>

                  <div
                    style={{
                      margin: 10
                    }}
                  >
                    Extra Fabric:{" "}
                    {fabric.extra_fabric > 0 ? (
                      fabric.extra_fabric + "m"
                    ) : (
                      <span style={{color: "red"}}>NO EXTRA STOCK</span>
                    )}
                  </div>
                </Card>
                {locations.length > 0 ? (
                  <Card
                    style={{
                      marginTop: 20,
                      flex: 1
                    }}
                    title={<h2>Stock by Location </h2>}
                    bordered={true}
                  >
                    {locations.length > 0 ? (
                      locations.map((l, i) => (
                        <div key={l.location}>
                          <Button
                            style={{
                              borderColor: "transparent",
                              padding: 0
                            }}
                          >
                            <h3
                              onClick={() => {
                                this.setState({
                                  image: location_url + l.image
                                });
                                this.setState({visible: true});
                              }}
                            >
                              {l.location}
                            </h3>
                          </Button>
                          <div>
                            Quantity: {l.quantity}
                            {" - "} Extra: {l.extra}
                          </div>
                          {locations.length > 1 &&
                          locations.length - 1 !== i ? (
                            <Divider />
                          ) : (
                            <div />
                          )}
                        </div>
                      ))
                    ) : (
                      <div />
                    )}
                  </Card>
                ) : (
                  <div />
                )}
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

export default Fabric;
