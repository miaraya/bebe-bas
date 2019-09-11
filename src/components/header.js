import React, {Component} from "react";
import {Layout, Menu, Icon, Dropdown, Modal} from "antd";
import {Link} from "react-router";
import PropTypes from "prop-types";
import {FabricForm, SwatchbookForm} from "../components/fabric.js";
import {api} from "../containers/constants";

const {Header} = Layout;

class HeaderApp extends Component {
  constructor(props) {
    super(props);
    this.getWord = this.props.getWord.bind(this);
    this.swatchbookcode = this.swatchbookcode.bind(this);
    this.state = {creatingLoading: false};
  }
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired
      }),
      staticContext: PropTypes.object
    }).isRequired
  };


  swatchbookcode = () => {
    return this.state.swatchbookcode;
  };
  getSwatchbookCode = () => {
    fetch(api + "/getswatchbookcodes")
      .then(res => res.json())
      .then(swatchbookcode => {
        this.setState({swatchbookcode: swatchbookcode[0].max});
        this.setState({addSwatchbookVisible: true});
      });
  };

  render() {
    const {addFabricVisible, addSwatchbookVisible} = this.state;

    return (
      <Header className="header">


        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            width: "100%"
          }}
        >
          <Menu
            mode="horizontal"
            defaultSelectedKeys={[this.props.index]}
            style={{width: "50%"}}
          >
            <Menu.Item
              key="1"
              onClick={() =>
                this.props.index !== 1 && this.context.router.push("/search")
              }
            >
              {this.props.getWord("search")}
            </Menu.Item>
            {(localStorage.getItem("role") === "admin" ||
              localStorage.getItem("role") === "cashier") && (
              <Menu.Item
                key="2"
                onClick={() =>
                  this.props.index !== 2 && this.context.router.push("/reports")
                }
              >
                {this.props.getWord("reports")}
              </Menu.Item>
            )}
          </Menu>
          {["admin", "stock"].find(i => i === localStorage.getItem("role")) && (
            <Dropdown
              style={{flex: 1}}
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => this.setState({addFabricVisible: true})}
                  >
                    {this.props.getWord("add-fabric")}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      this.getSwatchbookCode();
                    }}
                  >
                    {this.props.getWord("add-swatchbook")}
                  </Menu.Item>
                </Menu>
              }
            >
              <Link>
                <Icon
                  type="plus-circle"
                  theme="twoTone"
                  style={{
                    fontSize: 30,
                    alignSelf: "center"
                  }}
                />
              </Link>
            </Dropdown>
          )}
        </div>


          <FabricForm
            onCancel={(form)=>{
                this.setState({addFabricVisible:false})
                form.resetFields();
            }}
            visible={addFabricVisible}
            getWord={this.props.getWord}
            types={this.props.types}
            suppliers={this.props.suppliers}
            colors={this.props.colors}
            swatchbooklist={this.props.swatchbooklist}
            locationlist={this.props.locationlist}
            user={this.props.user}
            edit={false}
            onOk={this.props.handleNewFabric}
            wrappedComponentRef={this.props.newFabricFormRef}
          />
        <Modal
          title={this.props.getWord("add-swatchbook")}
          centered
          visible={addSwatchbookVisible}
          onOk={() => this.setState({addSwatchbookVisible: false})}
          onCancel={() => this.setState({addSwatchbookVisible: false})}
          footer={null}
        >
          <SwatchbookForm
            getWord={this.props.getWord}
            types={this.props.types}
            swatchbookcode={this.swatchbookcode}
            addSwatchbookVisible={this.setState.addSwatchbookVisible}
            user={this.props.user}
          />
        </Modal>
      </Header>
    );
  }
}
export default HeaderApp;
