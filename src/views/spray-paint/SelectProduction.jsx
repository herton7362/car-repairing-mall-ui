import React from 'react';

import './SelectProduction.less';
import { WingBlank, WhiteSpace, Button, Toast, Modal, List, Flex } from 'antd-mobile';
import Pay from './Pay';
import numeral from 'numeral';

export default class SelectProduction extends React.Component {
    constructor(props) {
        super(props);
        const partses = this.getProductions(this.props.maintenanceItems);
        let total = 0;
        this.state = {
            maintenanceItems: this.props.maintenanceItems,
            partses,
            total,
            selectedProduction: null,
            payVisible: false
        }
    }

    componentWillMount () {
        this.selectParts(this.state.partses[0]);
    }

    getProductions = (maintenanceItems) => {
        const partses = maintenanceItems[0].partses;
        return partses;
    }

    getSelectedProduction = (maintenanceItem) => {
        return maintenanceItem.partses.find(i => i.selected);
    }

    selectParts = (parts) => {
        this.state.maintenanceItems[0].partses.forEach(parts=>parts.selected = false);
        parts.selected = true;
        this.setState((prevState) => {
            prevState.maintenanceItems[0] = this.state.maintenanceItems[0];
            const selectedProduction = this.getSelectedProduction(prevState.maintenanceItems[0]);
            let total = 0;

            this.state.maintenanceItems.forEach(i => {
                total += i.partses.find(t=>t.name === selectedProduction.name).count * selectedProduction.parts.price;
            });
            return {
                total,
                maintenanceItems: prevState.maintenanceItems,
                selectedProduction: selectedProduction
            }
        });
    }

    render() {
        const {maintenanceItems, partses, payVisible, total, selectedProduction} = this.state;
        const {vehicle} = this.props;
        return (<div className="select-production">
            {!payVisible && (<div>
                <div className="title">您当前购买喷漆服务的车型</div>
                <WhiteSpace></WhiteSpace>
                <div>
                    <Button type="primary" size="small" inline>{vehicle.vehicleCategories[0].name} {vehicle.vehicleCategories[2].name}</Button>
                </div>
                <WhiteSpace></WhiteSpace>
                <div className="description">请您确认车型，如果到店车型与所选车型不符，门店有权拒绝服务或要求您补车型差价。</div>
                <WhiteSpace size="lg"></WhiteSpace>
                <div className="title">选择油漆产品</div>
                <WhiteSpace></WhiteSpace>
                {partses.map(parts=>
                    <Button key={parts.id}
                            type={parts.selected? 'primary': 'ghost'}
                            size="small"
                            inline
                            style={{
                                marginRight: '15px',
                                height: 'auto',
                                lineHeight: '20px',
                                padding: '8px 15px'
                            }}
                            onClick={() => this.selectParts(parts)}>
                        {parts.parts.name}
                        <p style={{margin: 0}}>￥ {numeral(parts.parts.price * parts.count).format('0,0.0')}</p>
                    </Button>)}
                <WhiteSpace></WhiteSpace>
                <div className="title">标准面</div>
                <WhiteSpace></WhiteSpace>

                {maintenanceItems.map(item=>{
                    return (
                        <Button key={item.id} type="primary" size="small" inline style={{
                            marginRight: '15px',
                            height: 'auto',
                            lineHeight: '20px',
                            padding: '8px 15px'
                        }}>
                            {item.name}
                            <p style={{margin: 0}}>￥ {numeral(this.state.selectedProduction.parts.price * item.partses.find(i => {
                                return i.name === this.state.selectedProduction.name;
                            }).count).format('0,0.0')}</p>
                        </Button>
                    );
                })}

                <div className="footer">
                    <Flex>
                        <Flex.Item style={{textAlign: 'right'}}>
                            合计：
                            <span style={{color: '#C3A769'}}>￥ {numeral(total).format('0,0.0')}</span>
                        </Flex.Item>
                        <Flex.Item style={{width: 80}}>
                            <Button type="primary" onClick={()=>this.setState({payVisible: true})}>去结算</Button>
                        </Flex.Item>
                    </Flex>
                </div>
            </div>)}

            {payVisible && <Pay maintenanceItems={maintenanceItems}
                                total={total}
                                selectedProduction={selectedProduction}
                                vehicle={vehicle}></Pay>}
        </div>);
    }
}
