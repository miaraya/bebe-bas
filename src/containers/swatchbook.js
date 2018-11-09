import React, {Component} from "react";
import {Link} from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import {Spin} from "antd";
import {Divider} from "antd";
import {Button} from "antd";

import Logo from "../assets/logo_small.png";

import {api, fabric_url, fabric_url_full, location_url} from "./constants";
import {Card} from "antd";
import {Layout, Modal} from "antd";
import {Rate} from "antd";
import {Input} from "antd";

const Search = Input.Search;

const {Content, Header} = Layout;

class Swatchbook extends Component {
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
        this.setState({fabrics});
      })
      .catch(error => {});
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

    const {
      loading,
      error,
      fabrics,
      swatchbook,
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
          <b>SWATCHBOOK NOT FOUND :(</b>
        </div>
      );
    } else
      return (
        <Layout className="wrapper">
          <Header className="header">
            <img src={Logo} alt="Bebe Tailor" width="150px" />
          </Header>
          <Content className="container">
            {swatchbook.length > 0 ? (
              swatchbook.map(s => (
                <div key={s.id}>
                  <div>
                    <Divider>
                      <h2>Swatchbook {id}</h2>
                    </Divider>
                    <div>Number of fabrics: {s.count}</div>
                    <div>Type: {s.description}</div>
                    <div>Alias: {s.alias}</div>
                  </div>
                </div>
              ))
            ) : (
              <div>Swatchbook not found</div>
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
                    <div style={{margin: 10}}>Supplier: {fabric.supplier}</div>
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

export default Swatchbook;
