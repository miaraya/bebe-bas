import React, { Component } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Rate,
  message,
  Modal,
  Icon
} from "antd";

import {
  api,
  formItemLayout,
  tailFormItemLayout
} from "../containers/constants";

const FormItem = Form.Item;
const Option = Select.Option;

export class FabricForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creatingLoading: false,
      typeId: this.props.record && this.props.record.type_id
    };
  }

  handleChangeType = id => {
    this.setState({ typeId: id });
    this.getCode(id);
  };

  getCode = id => {
    fetch(api + "/getcodes/" + id)
      .then(res => res.json())
      .then(code => {
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
      stock: undefined
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      visible,
      onCancel,
      form,
      edit,
      record,
      onOk,
      creatingLoading
    } = this.props;

    return (
      <Modal
        title={
          edit === true
            ? this.props.getWord("edit-fabric") +
              " " +
              (record && record.unique_code)
            : this.props.getWord("add-fabric")
        }
        centered
        visible={visible}
        onOk={onOk}
        onCancel={() => onCancel(form)}
        okButtonProps={{ loading: creatingLoading }}
      >
        <Form>
          <FormItem label={this.props.getWord("type")} {...formItemLayout}>
            {getFieldDecorator("type", {
              initialValue: record && record.type_id,
              rules: [
                { required: true, message: "Please select a Fabric Type" }
              ]
            })(
              <Select
                disabled={edit}
                showSearch
                style={{ width: 200 }}
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
          <FormItem
            {...formItemLayout}
            label={this.props.getWord("fabric-code")}
          >
            {getFieldDecorator("code", {
              initialValue: record && record.unique_code,
              rules: [
                {
                  required: true,
                  message: "Please input a fabric code",
                  whitespace: false
                }
              ]
            })(
              <Input
                disabled={true}
                style={{ width: 200 }}
                placeholder={this.props.getWord("add-fabric-code")}
              />
            )}
          </FormItem>
          <FormItem label={this.props.getWord("supplier")} {...formItemLayout}>
            {getFieldDecorator("supplier", {
              initialValue: record && record.supplier_id,
              rules: [{ required: true, message: "Please select a Supplier" }]
            })(
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder={this.props.getWord("select-a-supplier")}
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
              initialValue: record && record.old_code,
              rules: [
                {
                  required: true,
                  message: "Please input a Supplier Code",
                  whitespace: true
                }
              ]
            })(
              <Input
                style={{ width: 200 }}
                placeholder={this.props.getWord("add-supplier-code")}
              />
            )}
          </FormItem>
          <FormItem label={this.props.getWord("color")} {...formItemLayout}>
            {getFieldDecorator("color", {
              initialValue: record && record.color_id,
              rules: [{ required: true, message: "Please select a Color" }]
            })(
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder={this.props.getWord("select-a-color")}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children &&
                  option.props.children
                    //.toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {this.props.colors() &&
                  this.props.colors().map(t => (
                    <Option value={t.id} key={t.id}>
                      <Icon
                        type="border"
                        style={{
                          backgroundColor: t.hex_code,
                          color: "transparent",
                          marginRight: 20
                        }}
                      />
                      {t.description}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={this.props.getWord("swatchbook")}
            {...formItemLayout}
          >
            {getFieldDecorator("swatchbook", {
              initialValue: record && record.swatchbook_id,

              rules: [{ required: true, message: "Please select a Swatchbook" }]
            })(
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder={this.props.getWord("select-a-swatchbook")}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {this.props.swatchbooklist(null) && !this.state.typeId
                  ? this.props.swatchbooklist(null).map(t => (
                      <Option value={t.id} key={t.id}>
                        {t.unique_code}
                      </Option>
                    ))
                  : this.props.swatchbooklist(null) &&
                    this.props
                      .swatchbooklist(null)
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
              initialValue: record && record.price,
              rules: [
                {
                  required: true,
                  message: "Please input a Price"
                }
              ]
            })(
              <InputNumber
                min={0}
                style={{ width: 200 }}
                placeholder={this.props.getWord("add-price")}
              />
            )}
            <span className="ant-form-text"> ₫</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.props.getWord("price-band")}
          >
            {getFieldDecorator("price_band", {
              initialValue: record ? Number(record.price_band) : -1
            })(<Rate />)}
          </FormItem>
          {edit === false && (
            <div>
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
                    style={{ width: 200 }}
                    placeholder={this.props.getWord("add-stock")}
                  />
                )}
                <span className="ant-form-text"> meters</span>
              </FormItem>
              <FormItem
                label={this.props.getWord("location")}
                {...formItemLayout}
              >
                {getFieldDecorator("location", {
                  rules: [
                    { required: true, message: "Please select a Location" }
                  ]
                })(
                  <Select
                    showSearch
                    style={{ width: 200 }}
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
            </div>
          )}
        </Form>
      </Modal>
    );
  }
}

export class SwatchbookForm extends Component {
  constructor(props) {
    super(props);
    this.state = { creatingLoading: false };
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
    this.setState({ creatingLoading: true });
    fetch(api + "swatchbooks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        unique_code: values.swatchbookcode,
        type_id: values.type,
        user_id: this.props.user ? Number(this.props.user.staff_id) : -1
      })
    })
      .then(response => response.json())
      .then(responseData => {
        this.setState({ creatingLoading: false });

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
    const { getFieldDecorator } = this.props.form;
    const { creatingLoading } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem label={this.props.getWord("type")} {...formItemLayout}>
          {getFieldDecorator("type", {
            rules: [{ required: true, message: "Please select a Fabric Type" }]
          })(
            <Select
              showSearch
              style={{ width: 200 }}
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
              style={{ width: 200 }}
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
