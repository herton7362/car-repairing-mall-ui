import React from 'react';

import './SprayPaint.less';
import util from '@/libs/util';
import { WingBlank, Flex, WhiteSpace, Button, Toast } from 'antd-mobile';
import {hashHistory} from "react-router";
import SelectProduction from './SelectProduction';

import A柱 from './imgs/A柱.png';
import C柱 from './imgs/C柱.png';
import 前保险杠 from './imgs/前保险杠.png';
import 前翼子板 from './imgs/前翼子板.png';
import 前车盖 from './imgs/前车盖.png';
import 前车门 from './imgs/前车门.png';
import 后保险杠 from './imgs/后保险杠.png';
import 后翼子板 from './imgs/后翼子板.png';
import 后视镜 from './imgs/后视镜.png';
import 后车盖 from './imgs/后车盖.png';
import 后车门 from './imgs/后车门.png';
import 裙边 from './imgs/裙边.png';
import 车顶 from './imgs/车顶.png';

const imgs = {
    A柱,
    C柱,
    前保险杠,
    前翼子板,
    前车盖,
    前车门,
    后保险杠,
    后翼子板,
    后视镜,
    后车盖,
    后车门,
    裙边,
    车顶
}

export default class Vehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vehicles: [],
            maintenanceItems: [],
            user: util.getUserInfo(),
            productionSelectorVisible: false,
            selectedImgs: []
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
        const ajax = util.ajax.get('/api/vehicle', {
            params: {
                memberId: this.state.user.id,
                logicallyDeleted: 0
            }
        });

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
        let defaultVehicle = vehicles.filter((vehicle)=>vehicle.isDefault)[0];
        if(defaultVehicle == null && vehicles != null) {
            defaultVehicle = vehicles[0];
        }
        util.ajax.get('/api/maintenanceItem', {
            params: {
                vehicleCategoryId: defaultVehicle.vehicleCategoryId[2],
                category: '钣金喷漆',
                sort:'sortNumber,updatedDate',
                order: 'asc,desc',
                logicallyDeleted: 0
            }
        }).then((response)=>{
            this.setState({
                maintenanceItems: response.data.content
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
        const {maintenanceItems, productionSelectorVisible, vehicles,selectedImgs} = this.state;
        let vehicle = vehicles.find(v=>v.isDefault);
        if(vehicle == null && vehicles != null) {
            vehicle = vehicles[0];
        }
        function guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
        return (<div className="spray-paint">
            {!productionSelectorVisible && (<div>
                <div className="car-view">
                    <img width="100%" src={`${util.baseURL}/static/image/wechat/yangche_02.png`}/>
                    {selectedImgs.map((img)=><img key={guid()} width="100%" src={img} />)}
                </div>
                <div className="options">
                    <ul>
                        {maintenanceItems.map((item, index)=>(
                            <li key={item.id} onClick={() => {
                                this.setState((prevState) => {
                                    let selected = !prevState.maintenanceItems[index].selected;
                                    prevState.maintenanceItems[index].selected = selected;
                                    const matchImg = (name)=> {
                                        return imgs[Object.keys(imgs).find(key=>name.includes(key))];
                                    }
                                    if(selected) {
                                        prevState.selectedImgs.push(matchImg(prevState.maintenanceItems[index].name));
                                    } else {
                                        prevState.selectedImgs.splice(prevState.selectedImgs.indexOf(matchImg(prevState.maintenanceItems[index].name)), 1);
                                    }
                                    return {
                                        maintenanceItems: prevState.maintenanceItems,
                                        selectedImgs: prevState.selectedImgs
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
                                  vehicle={vehicle}></SelectProduction>
            </div>)}
        </div>);
    }
}
