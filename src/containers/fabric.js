import React, {Component} from "react";
import {Link} from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import {Spin} from "antd";
import {Divider} from "antd";
import {Button} from "antd";
import _ from "lodash";
import Top from "../components/top";

import Logo from "../assets/logo_small.png";

import {api, fabric_url, fabric_url_full, location_url} from "./constants";
import {Card} from "antd";
import {Layout, Modal} from "antd";
import {Rate} from "antd";
import AuthService from "../AuthService";

const Auth = new AuthService(null);

const {Content, Header} = Layout;

class Fabric extends Component {
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
    this.getFabricData(id);
    this.getStockData(id);
    this.getDictionary();
    const profile = Auth.getProfile();
    //console.log(profile);
    this.setState({
      user: profile
    });
    this.setState({language: localStorage.getItem("language")});
  };
  getDictionary = () => {
    fetch(api + "/dictionaries")
      .then(res => res.json())
      .then(dictionary => {
        this.setState({dictionary});
        this.setState({isLoading: false});
      });
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
        this.setState({
          locations: _.filter(locations, i => i.quantity > 0 || i.extra > 0)
        });
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
  render() {
    const {loading, error, fabric, image, visible, locations} = this.state;

    if (loading) {
      return (
        <Content className="containerHome">
          <Spin size="large" />
        </Content>
      );
    } else if (error) {
      return (
        <div>
          <b>FABRIC {this.props.params.id} NOT FOUND :(</b>
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Top
            username={this.state.user.username}
            handleLanguage={this.handleLanguage}
            getWord={this.getWord}
            getLanguage={this.getLanguage}
          />
          <Header className="header">
            <Link to={`/`}>
              <img src={Logo} alt="Bebe Tailor" width="150px" />
            </Link>
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
                  <div style={{margin: 10}}>
                    {this.getWord("old-code")}: {fabric.old_code}
                  </div>
                  <div style={{margin: 10}}>
                    {this.getWord("supplier")}: {fabric.supplier}
                  </div>
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
                <Card
                  title={<h2>{this.getWord("fabric-details")}</h2>}
                  bordered={true}
                >
                  <div style={{margin: 10}}>
                    {this.getWord("type")}: {fabric.type}
                  </div>
                  <div style={{margin: 10}}>
                    {this.getWord("color")}: {fabric.color}
                  </div>
                  <div style={{margin: 10}}>
                    {this.getWord("swatchbook")}:{" "}
                    <Link to={`/s/${fabric.swatchbook}`}>
                      {fabric.swatchbook}
                    </Link>
                  </div>
                  <div style={{margin: 10}}>
                    {this.getWord("total-stock")}:{" "}
                    {fabric.stock > 0 ? (
                      fabric.stock + "m"
                    ) : (
                      <span style={{color: "red"}}>
                        {this.getWord("no-stock")}
                      </span>
                    )}
                  </div>
                </Card>
                {locations.length > 0 ? (
                  <Card
                    style={{
                      marginTop: 20,
                      flex: 1
                    }}
                    title={<h2>{this.getWord("stock-fabric-location")}</h2>}
                    bordered={true}
                  >
                    {locations.length > 0 ? (
                      locations.map((l, i) => (
                        <div key={l.location} style={{margin: 10}}>
                          <a
                            style={{
                              borderColor: "transparent",
                              padding: 0
                            }}
                            onClick={() => {
                              this.setState({
                                image: location_url + l.image
                              });
                              this.setState({visible: true});
                            }}
                          >
                            <span>{l.location + ": "}</span>
                          </a>
                          <span> {l.quantity + "m"}</span>
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

export default Fabric;
