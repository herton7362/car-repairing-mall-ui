import React from 'react';

import util from '@/libs/util';
import VehicleCategorySelector from './VehicleCategorySelector';
import { NavBar, Icon, DatePicker, List, InputItem, WingBlank, Button, WhiteSpace, Modal, Toast } from 'antd-mobile';
import { hashHistory } from 'react-router';

export default class Vehicle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: util.getUserInfo(),
            form: {
                id: this.props.params.id,
                vehicleCategoryId: [],
                driveDate: null,
                plateNumber: null,
                mileage: null
            },
            oldPlateNumber: null,
            selectedCategories: [],
            isOpenVehicleCategorySelector: this.props.params.id? false: true
        }
    }

    componentDidMount () {
        if(this.state.form.id) {
            util.ajax.get(`/api/vehicle/${this.state.form.id}`).then((response)=>{
                let vehicleCategories = response.data.vehicleCategories;
                vehicleCategories.splice(1, 1);
                this.setState({
                    oldPlateNumber: response.data.plateNumber,
                    form: response.data,
                    selectedCategories: vehicleCategories
                })
            })
        }
    }

    openVehicleCategorySelector = () => {
        this.setState({
            isOpenVehicleCategorySelector: true
        });
    }

    onFinishSelectedVehicle = (result, resultObj) => {
        this.setState((prevState, props) => ({
            form: Object.assign(prevState.form, {
                vehicleCategoryId: result,
            }),
            selectedCategories: resultObj,
            isOpenVehicleCategorySelector: false
        }));
    }

    onVehicleSelectorQuit = () => {
        if(!this.state.form.id) {
            history.back(-1);
        } else {
            this.setState({
                isOpenVehicleCategorySelector: false
            });
        }
    }

    save = () => {
        if(!/(^[\u4E00-\u9FA5]{1}[A-Z0-9]{6}$)|(^[A-Z]{2}[A-Z0-9]{2}[A-Z0-9\u4E00-\u9FA5]{1}[A-Z0-9]{4}$)|(^[\u4E00-\u9FA5]{1}[A-Z0-9]{5}[挂学警军港澳]{1}$)|(^[A-Z]{2}[0-9]{5}$)|(^(08|38){1}[A-Z0-9]{4}[A-Z0-9挂学警军港澳]{1}$)/.test(this.state.form.plateNumber)) {
            Toast.fail('车牌号不正确', 1);
            return;
        }
        util.ajax.get('/api/vehicle', {
            params: {
                plateNumber: this.state.form.plateNumber
            }
        }).then((response)=>{
            if(response.data.length > 0 && this.state.oldPlateNumber != this.state.form.plateNumber) {
                Toast.fail('车牌号已被使用', 1);
                return;
            }
            if(!this.state.form.driveDate) {
                Toast.fail('请填写上路时间', 1);
                return;
            }
            if(!this.state.form.mileage) {
                Toast.fail('请填写行驶里程', 1);
                return;
            }
            util.ajax.post(`/api/vehicle`, Object.assign({}, this.state.form, {
                memberId: this.state.user.id,
                isDefault: !this.state.form.id
            })).then(()=>{
                Toast.success('保存成功', 1);
                history.go(-1);
            });
        })

    }

    render() {
        return (
            <div>
                {this.state.isOpenVehicleCategorySelector && React.createElement(VehicleCategorySelector, {
                    onFinishSelected: this.onFinishSelectedVehicle,
                    onQuit: this.onVehicleSelectorQuit
                })}

                <form className="form"
                      onSubmit={(e)=>e.preventDefault}
                      style={{display: this.state.isOpenVehicleCategorySelector? 'none': 'block'}}>
                    <NavBar
                        mode="light"
                        leftContent={[<Icon key="1" type="left" />, <span key="2">返回</span>]}
                        onLeftClick={()=>{history.back(-1)}}
                        rightContent={this.state.form.id && <span onClick={()=>{
                            Modal.alert('系统提示',
                                `你确定删除吗？`,
                                [
                                    { text: '取消' },
                                    {
                                        text: '确定',
                                        onPress: () =>
                                            util.ajax.delete(`/api/vehicle/${this.state.form.id}`).then(()=>{
                                                hashHistory.push('/my-zone');
                                            })
                                    },
                                ])
                        }}>删除</span>}>
                        车辆信息
                    </NavBar>
                    <List>
                        <List.Item arrow="horizontal" onClick={this.openVehicleCategorySelector} extra="车型">
                            {this.state.selectedCategories.map((category, i)=>i < 2?category.name:'')}
                            <br/>
                            {this.state.selectedCategories.map((category, i)=>i > 1?category.name:'')}
                        </List.Item>
                        <InputItem maxLength={7} value={this.state.form.plateNumber} onChange={(v)=>{
                            this.setState((prevState, props) => ({
                                form: Object.assign(prevState.form, {
                                    plateNumber: v.toUpperCase()
                                })
                            }));
                        }}>车牌号码</InputItem>
                    </List>
                    <List renderHeader={() => '爱车保养需要完善以下信息'}>
                        <DatePicker
                            mode="month"
                            format={(val) => JSON.stringify(val) !== 'null' && util.dateFormat(val, 'yyyy-MM') || '请选择'}
                            title="上路时间"
                            required
                            value={new Date(this.state.form.driveDate)}
                            onChange={(v)=>{
                                this.setState((prevState, props) => ({
                                    form: Object.assign(prevState.form, {
                                        driveDate: v
                                    })
                                }));
                            }}
                        >
                            <List.Item arrow="horizontal">上路时间</List.Item>
                        </DatePicker>
                        <InputItem placeholder="请输入当前里程数"
                                   type="number"
                                   extra="km"
                                   value={this.state.form.mileage}
                                   required
                                   onChange={(v)=>{
                                       this.setState((prevState, props) => ({
                                           form: Object.assign(prevState.form, {
                                               mileage: v
                                           })
                                       }));
                                   }}>行驶里程</InputItem>
                    </List>
                    <WhiteSpace size="lg"></WhiteSpace>
                    <WingBlank><Button type="primary" onClick={this.save}>保存</Button></WingBlank>
                </form>
            </div>
        )
    }
}
