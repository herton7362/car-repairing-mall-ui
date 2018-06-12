import React from 'react';

import util from '@/libs/util';
import { hashHistory } from 'react-router';
import { TabBar } from 'antd-mobile';
import '../styles/icon/iconfont.css';

import Home from './home/Home';
import MyZone from './my-zone/MyZone';
import Stage3 from '../components/Stage3';

const tabKeys = ['home', 'all', 'my-zone'];

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vehicles: [],
            selectedTab: tabKeys[0],
            hidden: false
        };
    }

    componentDidMount () {
        this.setSelectedTab(this.props.params.selectedTab || 'home');
    }

    setSelectedTab = (tab) => {
        if(hashHistory.getCurrentLocation().pathname.indexOf(tab) < 0) {
            hashHistory.push(tab);
        }
        this.setState({
            selectedTab: tab
        });
    }

    loadVehicles = (memberId) => {
        const ajax = util.ajax.get('/api/vehicle', {
            params: {
                memberId,
                logicallyDeleted: 0
            }
        });
        ajax.then((response)=>{
            this.setState({
                vehicles: response.data
            });
        });
        return ajax;
    }

    render () {
        return (
            <div className="body">
                <TabBar
                    unselectedTintColor="#949494"
                    tintColor="#C3A769"
                    barTintColor="white"
                    hidden={this.state.hidden}
                >
                    <TabBar.Item
                        title="首页"
                        key={tabKeys[0]}
                        icon={
                            <i className="iconfont icon-all" style={{fontSize: '22px'}}></i>
                        }
                        selectedIcon={
                            <i className="iconfont icon-all" style={{fontSize: '22px'}}></i>
                        }
                        selected={this.state.selectedTab === tabKeys[0]}
                        onPress={() => {
                            this.setSelectedTab(tabKeys[0]);
                        }}
                    >
                        {this.state.selectedTab === tabKeys[0] && React.createElement(Home, {
                            setSelectedTab: this.setSelectedTab,
                            loadVehicles: this.loadVehicles,
                            vehicles: this.state.vehicles
                        })}
                    </TabBar.Item>
                    <TabBar.Item
                        icon={
                            <i className="iconfont icon-gerenzhongxin" style={{fontSize: '22px'}}></i>
                        }
                        selectedIcon={
                            <i className="iconfont icon-gerenzhongxin" style={{fontSize: '22px'}}></i>
                        }
                        title="个人中心"
                        key={tabKeys[2]}
                        selected={this.state.selectedTab === tabKeys[2]}
                        onPress={() => {
                            this.setSelectedTab(tabKeys[2]);
                        }}
                    >
                        {this.state.selectedTab === tabKeys[2] && React.createElement(MyZone, {
                            setSelectedTab: this.setSelectedTab,
                            loadVehicles: this.loadVehicles,
                            vehicles: this.state.vehicles
                        })}
                    </TabBar.Item>
                </TabBar>
            </div>
        );
    }
}
