import React from "react"

import {
	Modal,
	Form,
	InputNumber,
	Button,
} from "antd"


import { formItemLayout} from "../containers/constants"

export class AdjustModal extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			newLocation: undefined,
			all: 0,
			add: 0,
		}
	}

	render() {
		const {visible, onCancel, onOk, creatingLoading ,oldStockLocations, form, record} = this.props
		const {getFieldDecorator} = form
		const FormItem = Form.Item

                
		return (
			<Modal
				visible={visible}
				title={record
					? this.props.getWord("adjust-stock-for") + " " + record.unique_code
					: ""
				}
				centered
				okText={this.props.getWord("save")}
				cancelText={this.props.getWord("cancel")}
				onCancel={() => onCancel(form)}
				onOk={() =>  onOk(oldStockLocations)}
				okButtonProps={{ loading: creatingLoading }}>
				<div
					style={{
						display: "flex",
						flexDirection: "column"
					}}>
					<Button
						type="danger"
						style={{
							alignSelf: "flex-end"
						}}
						onClick={() => this.props.setHetVai(oldStockLocations)}>
						{this.props.getWord("mark-as-het-vai")}
					</Button>

					<Form>
						{
							oldStockLocations && oldStockLocations.map((l, i) => (
								
								<div key={i}>
									<h3>{l.location}</h3>
									
									<FormItem
										label={this.props.getWord("quantity")}
										{...formItemLayout}>
										{getFieldDecorator(oldStockLocations[i].location ,{
											initialValue: l.stock,
											rules: [
												{
													required: true,
													message: "Please input a quantity"
												}
											]
										})(
											<InputNumber
												min={0}
												onChange={value => l.stock=value }
												setFieldsValue={l.stock}

												
											/>)}
											
										
										<span>{" m"}</span>
										

									</FormItem>

								</div>
							))
						}
					</Form>

				</div>
			</Modal>
                    

		)
	}
}
AdjustModal = Form.create({})(AdjustModal)


