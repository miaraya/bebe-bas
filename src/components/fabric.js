import React, {Component} from "react";
import {
  Icon,
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Rate,
  message
} from "antd";
import {Link} from "react-router";

import {api, formItemLayout, tailFormItemLayout} from "../containers/constants";

const FormItem = Form.Item;
const Option = Select.Option;

export class FabricForm extends Component {
  constructor(props) {
    super(props);
    this.state = {creatingLoading: false};
  }

  handleChangeType = id => {
    this.setState({typeId: id});
    this.getCode(id);
  };

  getCode = id => {
    fetch(api + "/getcodes/" + id)
      .then(res => res.json())
      .then(code => {
        //this.setState({code: code.code});
        this.props.form.setFieldsValue({
          code: code.code
        });
      });
  };

  componentWillMount = () => {};
  clear = () => {
    this.props.form.setFieldsValue({
      code: undefined,
      type: undefined,
      color: undefined,
      supplier_code: undefined,
      supplier: undefined,
      price: undefined,
      swatchbook: undefined,
      price_band: undefined,
      location: undefined,
      stock: undefined,
      price_band: undefined
    });
  };

  saveFabric = values => {
    this.setState({creatingLoading: true});
    fetch(api + "fabrics", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type_id: values.type,
        unique_code: values.code,
        color_id: values.color,
        old_code: values.supplier_code,
        supplier_id: values.supplier,
        price: values.price,
        swatchbook_id: values.swatchbook,
        price_band_id: values.price_band,
        image: values.code.toUpperCase() + ".jpg"
      })
    })
      .then(response => response.json())
      .then(responseData => {
        if (responseData.id) {
          this.saveStock(responseData.id, values.location, values.stock);
          message.success("Fabric: " + values.code + " created.");
        } else {
          message.error("Error: " + responseData.error.message);
        }
        console.log(
          "POST Response",
          "Response Body -> " + JSON.stringify(responseData)
        );
      });
  };

  saveStock = (fabric_id, location_id, quantity) => {
    fetch(api + "stocks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fabric_id,
        location_id,
        quantity
      })
    })
      .then(response => response.json())
      .then(responseData => {
        this.setState({creatingLoading: false});

        if (responseData.id) {
          message.success("Stock added.");
        }
      });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.saveFabric(values);
        this.clear();
      }
    });
  };
  render() {
    const {getFieldDecorator, setFieldsValue} = this.props.form;
    const code = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label={this.props.getWord("type")} {...formItemLayout}>
          {getFieldDecorator("type", {
            rules: [{required: true, message: "Please select a Fabric Type"}]
          })(
            <Select
              showSearch
              style={{width: 200}}
              placeholder={this.props.getWord("select-a-fabric-type")}
              optionFilterProp="children"
              onChange={value => this.handleChangeType(value)}
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.props.types() &&
                this.props.types().map(t => (
                  <Option value={t.id} key={t.id}>
                    {t.description + " - " + t.alias}
                  </Option>
                ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={this.props.getWord("fabric-code")}>
          {getFieldDecorator("code", {
            rules: [
              {
                required: true,
                message: "Please input a fabric code",
                whitespace: false
              }
            ]
          })(
            <Input
              style={{width: 200}}
              placeholder={this.props.getWord("add-fabric-code")}
            />
          )}
        </FormItem>
        <FormItem label={this.props.getWord("supplier")} {...formItemLayout}>
          {getFieldDecorator("supplier", {
            rules: [{required: true, message: "Please select a Supplier"}]
          })(
            <Select
              showSearch
              style={{width: 200}}
              placeholder={this.props.getWord("select-a-fabric-type")}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.props.suppliers() &&
                this.props.suppliers().map(t => (
                  <Option value={t.id} key={t.id}>
                    {t.name}
                  </Option>
                ))}
            </Select>
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label={this.props.getWord("supplier-code")}
        >
          {getFieldDecorator("supplier_code", {
            rules: [
              {
                required: true,
                message: "Please input a Supplier Code",
                whitespace: true
              }
            ]
          })(
            <Input
              style={{width: 200}}
              placeholder={this.props.getWord("add-supplier-code")}
            />
          )}
        </FormItem>

        <FormItem label={this.props.getWord("color")} {...formItemLayout}>
          {getFieldDecorator("color", {
            rules: [{required: true, message: "Please select a Color"}]
          })(
            <Select
              showSearch
              style={{width: 200}}
              placeholder={this.props.getWord("select-a-color")}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.props.colors() &&
                this.props.colors().map(t => (
                  <Option value={t.id} key={t.id}>
                    {t.description}
                  </Option>
                ))}
            </Select>
          )}
        </FormItem>
        <FormItem label={this.props.getWord("swatchbook")} {...formItemLayout}>
          {getFieldDecorator("swatchbook", {
            rules: [{required: true, message: "Please select a Swatchbook"}]
          })(
            <Select
              showSearch
              style={{width: 200}}
              placeholder={this.props.getWord("select-a-swatchbook")}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.props.swatchbooklist() && !this.state.typeId
                ? this.props.swatchbooklist().map(t => (
                    <Option value={t.id} key={t.id}>
                      {t.unique_code}
                    </Option>
                  ))
                : this.props
                    .swatchbooklist()
                    .filter(i => i.type_id === this.state.typeId)
                    .map(t => (
                      <Option value={t.id} key={t.id}>
                        {t.unique_code}
                      </Option>
                    ))}
            </Select>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={this.props.getWord("price")}>
          {getFieldDecorator("price", {
            rules: [
              {
                required: true,
                message: "Please input a Price"
              }
            ]
          })(
            <InputNumber
              min={0}
              style={{width: 200}}
              placeholder={this.props.getWord("add-price")}
            />
          )}
          <span className="ant-form-text"> ₫</span>
        </FormItem>

        <FormItem {...formItemLayout} label={this.props.getWord("price-band")}>
          {getFieldDecorator("price_band", {
            initialValue: 0
          })(<Rate />)}
        </FormItem>

        <FormItem {...formItemLayout} label={this.props.getWord("stock")}>
          {getFieldDecorator("stock", {
            rules: [
              {
                required: true,
                message: "Please input a Stock"
              }
            ]
          })(
            <InputNumber
              min={0}
              style={{width: 200}}
              placeholder={this.props.getWord("add-stock")}
            />
          )}
          <span className="ant-form-text"> meters</span>
        </FormItem>

        <FormItem label={this.props.getWord("location")} {...formItemLayout}>
          {getFieldDecorator("location", {
            rules: [{required: true, message: "Please select a Location"}]
          })(
            <Select
              showSearch
              style={{width: 200}}
              placeholder={this.props.getWord("select-a-location")}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.props.locationlist() &&
                this.props.locationlist().map(t => (
                  <Option value={t.id} key={t.id}>
                    {t.description}
                  </Option>
                ))}
            </Select>
          )}
        </FormItem>

        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            {this.props.getWord("save")}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export class SwatchbookForm extends Component {
  constructor(props) {
    super(props);
    this.state = {creatingLoading: false};
  }
  getSwatchbookCode = () => {
    fetch(api + "/getswatchbookcodes")
      .then(res => res.json())
      .then(swatchbookcode => {
        this.props.form.setFieldsValue({
          swatchbookcode: swatchbookcode[0].max
        });
      });
  };

  clear = () => {
    this.props.form.setFieldsValue({
      swatchbookcode: undefined,
      type: undefined
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.saveSwatchbook(values);
        this.clear();
      }
    });
  };

  saveSwatchbook = values => {
    this.setState({creatingLoading: true});
    fetch(api + "swatchbooks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        unique_code: values.swatchbookcode,
        type_id: values.type
      })
    })
      .then(response => response.json())
      .then(responseData => {
        this.setState({creatingLoading: false});

        if (responseData.id) {
          message.success("Swatchbook: " + values.swatchbookcode + " created.");
        } else {
          message.error("Error: " + responseData.error.message);
        }
        console.log(
          "POST Response",
          "Response Body -> " + JSON.stringify(responseData)
        );
      });
  };

  render() {
    const {getFieldDecorator, setFieldsValue} = this.props.form;
    const {creatingLoading} = this.state;

    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem label={this.props.getWord("type")} {...formItemLayout}>
          {getFieldDecorator("type", {
            rules: [{required: true, message: "Please select a Fabric Type"}]
          })(
            <Select
              showSearch
              style={{width: 200}}
              placeholder={this.props.getWord("select-a-fabric-type")}
              optionFilterProp="children"
              onChange={() => this.getSwatchbookCode()}
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.props.types() &&
                this.props.types().map(t => (
                  <Option value={t.id} key={t.id}>
                    {t.description + " - " + t.alias}
                  </Option>
                ))}
            </Select>
          )}
        </FormItem>
        <FormItem label={this.props.getWord("swatchbook")} {...formItemLayout}>
          {getFieldDecorator("swatchbookcode", {
            rules: [
              {
                required: true,
                message: "Please input a Swatchbook code",
                whitespace: false
              }
            ]
          })(
            <Input
              style={{width: 200}}
              placeholder={this.props.getWord("swatchbook")}
            />
          )}
        </FormItem>

        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" loading={creatingLoading}>
            {this.props.getWord("save")}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

FabricForm = Form.create({})(FabricForm);
SwatchbookForm = Form.create({})(SwatchbookForm);
