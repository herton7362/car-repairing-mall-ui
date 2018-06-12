import React from "react";

import util from '@/libs/util';
import { SearchBar, Flex,WhiteSpace, Button, WingBlank } from 'antd-mobile';
import { hashHistory, Link } from 'react-router';

import './home.less';
import Tyre from "../tyre/Tyre";

import indexIcon1 from './index_icon_fg.png';
import indexIcon2 from './index_icon_fg1.png';
import indexBanner from './index_banner.png';
import numeral from "numeral";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: util.getUserInfo(),
            tyres: [],
            maintenances: []
        }
    }

    componentDidMount () {
        if(util.hasLogin()) {
            this.props.loadVehicles(this.state.user.id).then((response)=>{
                this.loadTyre(response.data);
                this.loadMaintenance(response.data);
            });
        } else {
            this.loadTyre();
            this.loadMaintenance();
        }

    }

    goToMyZoneTab = () => {
        this.props.setSelectedTab('my-zone');
    }

    myVehicle = (vehicles) => {
        if(vehicles.length > 0) {
            let vehicle = vehicles.find((vehicle) => vehicle.isDefault);
            if(vehicle == null) {
                vehicle = vehicles[0];
            }
            return (
                <div key={vehicle.id} className="my-car" onClick={this.goToMyZoneTab}>
                    <h2>您好！{vehicle.vehicleCategories[0].name} {vehicle.vehicleCategories[2].name} 车主</h2>
                    <WhiteSpace size="sm"/>
                    <div>{[...vehicle.plateNumber].map((v, i) => i > 1 && i < 4 ? '*' : v)}</div>
                </div>
            )
        }
    }

    checkVehicleExist = () => {
        const {vehicles} = this.props;
        if(vehicles == null || vehicles.length == 0) {
            hashHistory.push('vehicle');
            return false;
        }
        return true;
    }

    loadTyre = (vehicles) => {
        let defaultVehicle;
        if(util.hasLogin()) {
            defaultVehicle = vehicles.find((vehicle)=>vehicle.isDefault);
        }
        if(defaultVehicle == null && vehicles != null) {
            defaultVehicle = vehicles[0];
        }
        util.ajax.get('/maintenanceItem', {
            params: {
                vehicleCategoryId: defaultVehicle? defaultVehicle.vehicleCategoryId[4]: null,
                category: '轮胎',
                logicallyDeleted: 0
            }
        }).then((response)=>{
            response.data.forEach((item, i1)=>{
                item.partses.forEach((parts, i2)=>{
                    util.ajax.get(`/parts/${parts.parts.id}`).then((res)=>{
                        response.data[i1].partses[i2].parts = res.data;
                        this.setState({
                            tyres: response.data
                        });
                    })
                })
            })
        });
    }

    loadMaintenance = (vehicles) => {
        let defaultVehicle;
        if(util.hasLogin()) {
            defaultVehicle = vehicles.find((vehicle)=>vehicle.isDefault);
        }
        if(defaultVehicle == null && vehicles != null) {
            defaultVehicle = vehicles[0];
        }
        util.ajax.get('/maintenanceItem', {
            params: {
                vehicleCategoryId: defaultVehicle? defaultVehicle.vehicleCategoryId[4]: null,
                category: '保养',
                logicallyDeleted: 0
            }
        }).then((response)=>{
            response.data.forEach((item, i1)=>{
                item.partses.forEach((parts, i2)=>{
                    util.ajax.get(`/parts/${parts.parts.id}`).then((res)=>{
                        response.data[i1].partses[i2].parts = res.data;
                        this.setState({
                            maintenances: response.data
                        });
                    })
                })
            })
        });
    }

    render () {
        const {vehicles, loadVehicles} = this.props;
        const {tyres, maintenances} = this.state;
        return (
            <div className="home">
                <SearchBar placeholder="请您输入您想要查询的商品或服务" maxLength={16}/>
                <Flex className="apps">
                    <Flex.Item>
                        <a onClick={() => this.checkVehicleExist() && hashHistory.push('tyre')} className="btn btn-app">
                            <i className="iconfont icon-tyre"></i>
                            <div style={{marginTop: 6}}>轮胎</div>
                        </a>
                    </Flex.Item>
                    <Flex.Item>
                        <a onClick={() => this.checkVehicleExist() && hashHistory.push('maintenance')} className="btn btn-app">
                            <i className="iconfont icon-car_maintenance"></i>
                            <div style={{marginTop: 6}}>保养</div>
                        </a>
                    </Flex.Item>
                    <Flex.Item>
                        <a onClick={() => this.checkVehicleExist() && hashHistory.push('sprayPaint')} className="btn btn-app">
                            <i className="iconfont icon-sheet_metal_paint"></i>
                            <div style={{marginTop: 6}}>钣金喷漆</div>
                        </a>
                    </Flex.Item>
                </Flex>
                <WingBlank size="md">
                    <WhiteSpace size="lg" />
                    {vehicles.length === 0 && <Button className="add-car-button" type="primary" onClick={this.goToMyZoneTab}>
                        <span><i className="iconfont icon-car"></i> 添加我的爱车 +</span>
                    </Button>}
                    {this.myVehicle(vehicles)}
                    <WhiteSpace size="lg" />
                    <img className="banner" width="100%" src={indexBanner} />
                </WingBlank>
                <WhiteSpace size="xl" />
                <WhiteSpace size="xl" />
                <WingBlank size="md">
                    <div className="area_title">
                        <img src={indexIcon1} className="index_icon_fg" />
                        <span className="area_title_text">轮胎专区</span>
                    </div>
                    <WhiteSpace />
                    <Flex wrap="wrap">
                        {tyres.map(tyre=>(
                            <div className="thumbnail" key={tyre.id} onClick={()=>{
                                this.checkVehicleExist() && hashHistory.push({
                                    pathname: '/tyre',
                                    state: {
                                        selectedItem: tyre
                                    }
                                })
                            }}>
                                {tyre.partses[0].parts.partsCoverImage && <img src={`${util.baseURL}/attachment/download/${tyre.partses[0].parts.partsCoverImage.attachmentId}`} />}
                                <div className="caption">
                                    <p className="product-title">
                                        {tyre.partses[0].parts.name}
                                    </p>
                                    <p className="bottom-area">
                                        <em className="product-price">¥ {numeral(tyre.partses[0].parts.price).format('0,0.0')}</em>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </Flex>
                </WingBlank>
                <WhiteSpace size="xl" />
                <WhiteSpace size="xl" />
                <WingBlank size="md">
                    <div className="area_title">
                        <img src={indexIcon2} className="index_icon_fg" />
                        <span className="area_title_text">保养专区</span>
                    </div>
                    <WhiteSpace />
                    <Flex wrap="wrap">
                        {maintenances.map(maintenance=>(
                            <div className="thumbnail" key={maintenance.id} onClick={()=>{
                                this.checkVehicleExist() && hashHistory.push({
                                    pathname: '/maintenance',
                                    state: {
                                        selectedItem: maintenance
                                    }
                                })
                            }}>
                                {maintenance.partses[0].parts.partsCoverImage && <img src={`${util.baseURL}/attachment/download/${maintenance.partses[0].parts.partsCoverImage.attachmentId}`} />}
                                <div className="caption">
                                    <p className="product-title">
                                        {maintenance.partses[0].parts.name}
                                    </p>
                                    <p className="bottom-area">
                                        <em className="product-price">¥ {numeral(maintenance.partses[0].parts.price).format('0,0.0')}</em>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </Flex>
                </WingBlank>
            </div>
        )
    }
}
