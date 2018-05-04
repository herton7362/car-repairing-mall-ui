import React from 'react';

import './SprayPaint.less';
import util from '@/libs/util';
import { WingBlank, Flex, WhiteSpace, Button, Toast } from 'antd-mobile';
import {hashHistory} from "react-router";
import SelectProduction from './SelectProduction';

export default class Vehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vehicles: [],
            maintenanceItems: [],
            user: util.getUserInfo(),
            productionSelectorVisible: false
        }
    }

    componentDidMount () {
        this.loadVehicles().then((response)=>{
            if(response.data && response.data.length > 0) {
                this.loadSprayPaints(response.data);
            }
        });
    }

    loadVehicles = () => {
        const ajax = util.ajax.get('/api/vehicle', {params: {memberId: this.state.user.id}});

        ajax.then((response)=>{
            if(!response.data || response.data.length <= 0) {
                hashHistory.push('vehicle');
                return;
            }
            this.setState({
                vehicles: response.data
            });
        });
        return ajax;
    }

    loadSprayPaints = (vehicles) => {
        const defaultVehicle = vehicles.filter((vehicle)=>vehicle.isDefault)[0];
        util.ajax.get('/api/maintenanceItem', {
            params: {
                vehicleCategoryId: defaultVehicle.vehicleCategoryId[2],
                category: '钣金喷漆'
            }
        }).then((response)=>{
            this.setState({
                maintenanceItems: response.data
            });
        });
    }

    selectProduction = () => {
        if(this.state.maintenanceItems.filter(item=>item.selected).length === 0) {
            Toast.fail('请选择漆面', 1);
            return;
        }
        this.setState({
            productionSelectorVisible: true
        })
    }

    render() {
        const {maintenanceItems, productionSelectorVisible, vehicles} = this.state;
        return (<div className="spray-paint">
            {!productionSelectorVisible && (<div>
                <div className="car-view">
                    <img width="100%" src={`${util.baseURL}/static/image/wechat/yangche_02.png`}/>
                </div>
                <div className="options">
                    <ul>
                        {maintenanceItems.map((item, index)=>(
                            <li key={item.id} onClick={() => {
                                this.setState((prevState) => {
                                    prevState.maintenanceItems[index].selected = !prevState.maintenanceItems[index].selected;
                                    return {
                                        maintenanceItems: prevState.maintenanceItems
                                    }
                                })
                            }}>
                                <span className={item.selected? 'selected': ''}>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="footer">
                    <Button type="primary" onClick={this.selectProduction}>选产品</Button>
                </div>
            </div>)}

            {productionSelectorVisible && (<div>
                <SelectProduction maintenanceItems={maintenanceItems.filter(item=>item.selected)}
                                  vehicle={vehicles.find(v=>v.isDefault)}></SelectProduction>
            </div>)}
        </div>);
    }
}
