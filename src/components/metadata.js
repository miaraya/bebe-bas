import React, { Component } from "react";
import { Form, Modal, Tag, Rate } from "antd";
import { formItemLayout } from "../containers/constants";
import _ from "lodash";

const { CheckableTag } = Tag;
const FormItem = Form.Item;

export class MetadataForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creatingLoading: false
    };
  }
  componentWillMount = () => {};
  handleChange = (checked, m) => {
    m.checked = checked;

    this.forceUpdate();
  };
  handleChangeRate = (value, m) => {
    m.meta.forEach(e => {
      if (e.checked) e.checked = false;
    });
    _.find(m.meta, e => Number(e.value) === Number(value)).checked = true;
    _.find(m.meta, e => Number(e.value) === Number(value)).value = value;

    //((_.find(m.meta, e => e.value === value).value = value;

    this.forceUpdate();
  };

  render() {
    const {
      creatingLoading,
      record,
      visible,
      onCancel,
      form,
      metadata,
      saveMetadata
    } = this.props;
    return (
      <Modal
        title={record && `Edit metadata for fabric: ${record.unique_code}`}
        centered
        visible={visible}
        onCancel={() => onCancel(form)}
        okButtonProps={{ loading: creatingLoading }}
        onOk={() => {
          saveMetadata(metadata, record && record.fabric_id);
        }}
      >
        <div>
          {record && (
            <img
              style={{
                overflow: "hidden",
                width: "100%",
                marginBottom: 20
              }}
              alt={record.unique_code}
              src={record.image_url}
            />
          )}
          <Form>
            {metadata &&
              metadata.map(m =>
                m.id !== 3 ? (
                  <FormItem
                    key={m.id}
                    label={m.metadata}
                    {...formItemLayout}
                    value={m}
                  >
                    {_.sortBy(m.meta, m => m.value).map(m => (
                      <CheckableTag
                        key={m.id}
                        onChange={checked => this.handleChange(checked, m)}
                        checked={m.checked}
                      >
                        {m.value}
                      </CheckableTag>
                    ))}
                  </FormItem>
                ) : (
                  <FormItem
                    key={m.id}
                    label={m.metadata}
                    {...formItemLayout}
                    value={m.value}
                  >
                    <Rate
                      value={
                        _.find(m.meta, x => x.fabric_metadata_id) &&
                        Number(_.find(m.meta, x => x.checked).value)
                      }
                      onChange={checked => {
                        this.handleChangeRate(checked, m);
                      }}
                      checked={m.checked}
                    />
                  </FormItem>
                )
              )}
          </Form>
        </div>
      </Modal>
    );
  }
}

//MetadataForm = Form.create({})(MetadataForm);
