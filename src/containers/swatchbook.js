import React, {Component} from "react";
import {Link} from "react-router";
import "antd/dist/antd.css";
import "../css/css.css";
import {Spin, Row, Col, Statistic, Descriptions, Tooltip} from "antd";
import {Divider} from "antd";

import Logo from "../assets/logo_small.png";

import {api} from "./constants";
import {Card, Icon, Switch} from "antd";
import {Layout, Modal} from "antd";
import {Rate} from "antd";
import _ from "lodash";

const {Content, Footer} = Layout;

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
        fetch(
            api + "fabricdetails?filter[where][swatchbook]=" + id
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
                var result = _(fabrics)
                    .groupBy(x => x.unique_code)
                    .map((value, key) => ({
                        unique_code: key,
                        old_code: value[0].old_code,
                        swatchbook: value[0].swatchbook,
                        fabric_image: value[0].fabric_image,
                        color: value[0].color,
                        fabric_id: value[0].fabric_id,
                        thumbnail_url: value[0].thumbnail_url,
                        image_url: value[0].image_url,
                        price_band: value[0].price_band,
                        last_stock_update: value[0].last_stock_update
                            ? value[0].last_stock_update
                            : "No Info",
                        total_stock: value[0].total_stock,
                        hetvai: value[0].total_stock <= 0
                    }))
                    .value();
                //result = this.checkHetVai(result);
                this.setState({
                    fabrics: _.filter(result, i => i.total_stock > 0)
                });
                this.setState({fabricsUnfiltered: result});
            })
            .catch(error => {
                this.setState({loading: false});

                this.setState({error: true});
            });
    };
    
    getSwatchbookData = id => {
        fetch(
            api + "web_swatchbooks?filter[where][unique_code]=" + id
        )
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    this.setState({error: true});
                    throw new Error("Something went wrong ...");
                }
            })
            .then(swatchbook => {
                if (swatchbook.length) {
                    this.setState({swatchbook: swatchbook[0]});
                    this.setState({loading: false});
                    this.setState({error: false});
                } else {
                    this.setState({loading: false});
                    this.setState({error: true});
                }
            })
            .catch(error => {
                this.setState({loading: false});
                this.setState({error: true});
            });
    };

    onChangeStockFilter(checked, fabricsUnfiltered) {
        checked
            ? this.setState({fabrics: fabricsUnfiltered})
            : this.setState({
                fabrics: _.filter(fabricsUnfiltered, i => i.total_stock > 0)
            });

    }

    render() {
        //const {id} = this.props.params;

        const {
            loading,
            error,
            fabrics,
            swatchbook,
            image,
            visible,
            fabricsUnfiltered
        } = this.state;

        if (loading) {
            return (
                <Content className="containerHome">
                    <Spin size="large"/>
                </Content>
            );
        } else if (error) {
            return (
                <div>
                    SWATCHBOOK <b>{(this.props.params.id).toUpperCase()}</b>  NOT FOUND :(
                </div>
            );
        } else 
            return (
                <Layout className="swrapper">
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
                        <Row type="flex" justify="center" align="middle" gutter={16} span={24}>
                            <Col xs={24} sm={24} md={4} justify="center">
                                <Statistic
                                    title="Swatchbook"
                                    value={swatchbook.unique_code}
                                    style={{
                                        textAlign: "center"
                                    }}/>
                            </Col>
                            <Col xs={24} sm={24} md={4} justify="center">
                                <Statistic
                                    title="Fabric Type"
                                    value={swatchbook.description + " - " + swatchbook.alias}
                                    style={{
                                        textAlign: "center"
                                    }}/>
                            </Col>
                            <Col xs={24} sm={24} md={4} justify="center">
                                <Statistic
                                    title="Number of Fabrics"
                                    value={fabrics && fabrics.length}
                                    style={{
                                        textAlign: "center"
                                    }}/>
                            </Col>
                        </Row>
                        <Divider/>


                        <Row type="flex" justify="center" align="middle" gutter={16} span={24}>
                            <Col xs={24} sm={24} md={4} justify="center" align="middle">
                                <Tooltip title="Filter">
                                    <Icon type="filter" style={{fontSize:20}} alt="Filter"/>
                                </Tooltip>
                            </Col>
                            <Col xs={24} sm={24} md={4} justify="center" gutter={16}>

                                <Row type="flex" justify="center" align="middle" gutter={16}>

                                    Show fabrics with no stock:

                                </Row>
                                <Row type="flex" justify="center" align="middle" gutter={16}>
                                    <Switch onChange={(value) => this.onChangeStockFilter(value, fabricsUnfiltered)}/>
                                </Row>
                            </Col>

                        </Row>
                        <Divider
                            style={{
                                backgroundColor: "transparent"
                            }}/>
                        <Row type="flex" justify="center" align="middle" gutter={16} span={24}>

                            {
                                fabrics
                                    ? (fabrics.map(fabric => (
                                        <Card
                                            size="small"
                                            style={{
                                                margin: 15,
                                                maxWidth: 300
                                            }}
                                            bordered={false}
                                            key={fabric.unique_code}
                                            title={<div
                                            style = {{
                                              display: "flex",
                                              flex: 1,
                                              justifyContent: "space-between",
                                              alignContent:"center",                                              
                                            }} > <h2>
                                                    <Link
                                                        to={`/f/${fabric.unique_code}`}
                                                        style={{
                                                            fontWeight: "normal",
                                                            color: "black"
                                                        }}>
                                                        {fabric.unique_code}
                                                    </Link>
                                                </h2>

                                                {
                                                fabric.price_band > 0 && (
                                                    <Rate
                                                        style={{
                                                            fontSize: 14
                                                        }}
                                                        disabled
                                                        defaultValue={Number(fabric.price_band)}/>
                                                )
                                            }
                                            </div>
}
                                            cover={<img
                                            style = {{height:200, overflow:"hidden"}}
                                            alt = {
                                                fabric.unique_code
                                            }
                                            src = {
                                                fabric.thumbnail_url
                                            }
                                            onClick = {
                                                () => {
                                                    this.setState({image: fabric.image_url});
                                                    this.setState({visible: true});
                                                }
                                            }
                                            />}>
                                            <Descriptions size="small" column={1}>
                                                <Descriptions.Item label="Color">{fabric.color}</Descriptions.Item>
                                                <Descriptions.Item label="Old Code">{fabric.old_code}</Descriptions.Item>
                                                <Descriptions.Item label="Stock">{
                                                        fabric.hetvai
                                                            ? (
                                                                <span
                                                                    style={{
                                                                        color: "red"
                                                                    }}>Out of Stock
                                                                </span>
                                                            )
                                                            : (
                                                                <span
                                                                    style={{
                                                                        color: "green"
                                                                    }}>In Stock, {fabric.total_stock}m</span>
                                                            )
                                                    }</Descriptions.Item>
                                                <Descriptions.Item label="Last Stock Update">{fabric.last_stock_update}</Descriptions.Item>

                                            </Descriptions>
                                        </Card>
                                    )))
                                    : <Spin size="medium"/>

                            }

                        </Row>

                    </Content>
                    <Footer
                        style={{
                            textAlign: "center",
                            flex: 1
                        }}>Bebe Tailor {
                            (new Date())
                                .getFullYear()
                                .toString()
                        }, Hoi An, Vietnam.</Footer>

                    <Modal
                        visible={visible}
                        footer={null}
                        maskClosable={true}
                        onCancel={() => {
                            this.setState({visible: false});
                            this.setState({image: null});
                        }}
                        width="100%">
                        <img
                            style={{
                                width: "100%"
                            }}
                            alt="Bebe Tailor"
                            src={image}
                            onClick={() => {
                                this.setState({visible: false});
                                this.setState({image: null});
                            }}/>
                    </Modal>
                </Layout>
            );
        }
    }

export default Swatchbook;
