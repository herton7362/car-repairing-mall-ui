import React from "react";

import util from '@/libs/util';
import { List, Flex,WhiteSpace, Button, WingBlank, NavBar, Icon, Stepper } from 'antd-mobile';
import { hashHistory, Link } from 'react-router';
import numeral from 'numeral';
import Pay from './Pay';

import './Maintenance.less';
import {Toast} from "antd-mobile/lib/index";

export default class Maintenance extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            vehicles: [],
            maintenanceItems: [],
            user: util.getUserInfo(),
            total: 0,
            selectedItem: this.props.location.state? this.props.location.state.selectedItem: null,
            payVisible: !!this.props.location.state
        }
    }

    componentDidMount () {
        this.loadVehicles().then((response)=>{
            if(response.data && response.data.length > 0) {
                this.loadMaintenance(response.data);
            }
        });
    }

    loadVehicles = () => {
        const ajax = util.ajax.get('/api/vehicle', {params: {memberId: this.state.user.id}});

        ajax.then((response)=>{
            this.setState({
                vehicles: response.data
            });
        });
        return ajax;
    }

    loadMaintenance = (vehicles) => {
        const defaultVehicle = vehicles.filter((vehicle)=>vehicle.isDefault)[0];
        util.ajax.get('/api/maintenanceItem', {
            params: {
                vehicleCategoryId: defaultVehicle.vehicleCategoryId[4],
                category: '保养'
            }
        }).then((response)=>{
            response.data.forEach((item, i1)=>{
                item.partses.forEach((parts, i2)=>{
                    util.ajax.get(`/api/parts/${parts.parts.id}`).then((res)=>{
                        response.data[i1].partses[i2].parts = res.data;
                        this.setState({
                            maintenanceItems: response.data
                        });
                    })
                })
            })
        });
    }

    handleSubmit = () => {
        if(!this.state.selectedItem) {
            Toast.fail("请选择保养项目", 1);
            return;
        }
        this.setState({
            payVisible: true
        })
    }

    render () {
        const { vehicles, maintenanceItems, total, selectedItem, payVisible } = this.state;
        const vehicle = vehicles.find(v=>v.isDefault);
        return (<div className="maintenance">
            <NavBar
                mode="light"
                leftContent={[<Icon key="1" type="left" />, <span key="2">返回</span>]}
                onLeftClick={()=>{history.back(-1)}}
            >
                {vehicle && vehicle.vehicleCategories[0].name} {vehicle && vehicle.vehicleCategories[2].name}
            </NavBar>
            {!payVisible && <div style={{marginBottom: 50}}>
                {maintenanceItems.map(item=>(<div key={item.id}>
                    <List>
                        <List.Item extra={
                            <a onClick={(e)=>{
                                e.stopPropagation();
                                const target = maintenanceItems.find((i)=>i.id === item.id);
                                if (target) {
                                    target.editable = !target.editable;
                                    this.setState({ maintenanceItems });
                                }
                            }}>{item.editable? '保存': '编辑'}</a>
                        }
                                   onClick={() => {
                                       this.setState({
                                           selectedItem: item
                                       })
                                   }}
                        >
                            {selectedItem && selectedItem.id === item.id ? <Icon
                                type="check-circle"
                                style={{color: '#C3A769', verticalAlign: 'middle', marginTop: '-4px'}}
                                size="sm"
                            />: <Icon
                                type="check-circle-o"
                                style={{color: '#999', verticalAlign: 'middle', marginTop: '-4px'}}
                                size="sm"
                            />} {item.name} <span style={{color: '#999', fontSize: 12}}>（工时费 ￥ {numeral(item.manHourPrice).format('0,0.0')}）</span>
                        </List.Item>
                        {item.partses.map(parts=>(
                            <List.Item
                                key={parts.id}
                                thumb={parts.parts.partsCoverImage && <img src={`${util.baseURL}/attachment/download/${parts.parts.partsCoverImage.attachmentId}`} style={{width: 60, height: 60, margin: '10px 0'}} />}
                                extra={`￥${numeral(parts.count * parts.parts.price).format('0,0.0')}`}
                            >
                                {parts.parts.name}
                                {item.editable? <div><Stepper
                                    showNumber
                                    value={parts.count}
                                    min={1}
                                    max={4}
                                    onChange={(v)=>{
                                        parts.count = v;
                                        this.setState({
                                            maintenanceItems
                                        })
                                    }}></Stepper></div>: <p style={{margin: 0, color: '#999'}}>
                                    x {parts.count}
                                </p>}
                            </List.Item>
                        ))}
                    </List>
                    <WhiteSpace size="lg"/>
                </div>))}
                <div className="footer">
                    <Flex>
                        <Flex.Item style={{textAlign: 'right'}}>
                            合计：
                            <span style={{color: '#C3A769'}}>￥ {selectedItem? numeral(selectedItem.manHourPrice
                                + selectedItem.partses.reduce((prev, cur)=>cur.count * cur.parts.price + prev, 0)).format('0,0.0'): '0.0'}</span>
                        </Flex.Item>
                        <Flex.Item style={{width: 80}}>
                            <Button type="primary" onClick={this.handleSubmit}>提交订单</Button>
                        </Flex.Item>
                    </Flex>
                </div>
            </div>}
            {payVisible && <Pay selectedItem={selectedItem} vehicle={vehicle}></Pay>}
        </div>);
    }
}
