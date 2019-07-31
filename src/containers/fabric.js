import React, {Component} from "react";
import {Link} from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import {Spin, Descriptions, Divider} from "antd";
import _ from "lodash";
import Top from "../components/top";

import Logo from "../assets/logo_small.png";

import {api, location_url} from "./constants";
import {Layout, Modal,Row, Col} from "antd";
import {Rate} from "antd";
import AuthService from "../AuthService";

const Auth = new AuthService(null);

const {Content} = Layout;

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
           <Row
                        type="flex"
                        justify="center"
                        align="middle"
                        gutter={16}
                        span={24}
                        style={{
                            marginBottom: 20
                        }}>
                        <img src={Logo} alt="Bebe Tailor" width="150px"/>
                    </Row>
          
          <Content className="container">
          <Row type="flex" justify="center" align="top" gutter={40} span={24}>
            <Col xm={24} sm={24} md={8}> 

            <Descriptions >
                <Descriptions.Item>
                <img
                      style={{maxWidth: 300}}
                      alt={fabric.unique_code}
                      src={fabric.thumbnail_url}
                      onClick={() => {
                        this.setState({
                          image: fabric.image_url
                        });
                        this.setState({visible: true});
                      }}
                    />
                </Descriptions.Item>
            </Descriptions>
            
            
            </Col>
            <Col xs={24} sm={24} md={16} style={{paddingTop:16}}>
              <Descriptions title={this.getWord("fabric-details")} column={2}>
              <Descriptions.Item label={this.getWord("fabric-code")}><b>{fabric.unique_code}</b></Descriptions.Item>

                <Descriptions.Item label={this.getWord("type")}>{fabric.type}</Descriptions.Item>
                {fabric.price_band > 0 && (
                  <Descriptions.Item label={this.getWord("price-band")}><Rate disabled="disabled" defaultValue={Number(fabric.price_band)}/></Descriptions.Item>
                ) }
                <Descriptions.Item label={this.getWord("swatchbook")}>
                  <Link to={`/s/${fabric.swatchbook}`}>
                      {fabric.swatchbook}
                  </Link>
                </Descriptions.Item>
                <Descriptions.Item label={this.getWord("old-code")}>{fabric.old_code}</Descriptions.Item>
                <Descriptions.Item label={this.getWord("supplier")}>{fabric.supplier}</Descriptions.Item>
                <Descriptions.Item label={this.getWord("total-stock")}>{fabric.total_stock > 0 ? (
                      fabric.total_stock + "m"
                    ) : (
                      <span style={{color: "red"}}>
                        {this.getWord("no-stock")}
                      </span>
                    )}</Descriptions.Item>

              </Descriptions>

              {locations.length > 0 && (
                <span>
                  <Divider/>
                  <Descriptions title={this.getWord("stock-fabric-location")} column={2}>
                    {locations.map(l=>                 
                    <Descriptions.Item key={l.id} label={
                      <Link
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
                    </Link>}>{l.quantity}m</Descriptions.Item>
                    )}
                  </Descriptions>
                </span>)}
            </Col>
          </Row>
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
