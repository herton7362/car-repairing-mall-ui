import React from "react";

import './Shop.less';
import util from '@/libs/util';
import { List } from 'antd-mobile';

export default class Shops extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shops: [],
        }
    }

    componentDidMount () {
        this.loadShops();
    }

    loadShops = ()=> {
        util.ajax.get('/api/shop/all').then((response)=>{
            this.setState({
                shops: response.data
            })
        })
    }

    render() {
        const {shops} = this.state;
        const {onSelect} = this.props;
        return (<div>
            <List renderHeader={() => '选择门店'}>
                {shops.map(shop=>(
                    <List.Item key={shop.id}
                               arrow="horizontal"
                               thumb={<img src={`${util.baseURL}/attachment/download/${shop.styleImages[0].id}`} style={{width: 60, height: 60}} />}
                               style={{padding: '10px 0 10px 15px'}}
                               onClick={()=>{onSelect(shop)}}>
                        {shop.name}
                        <List.Item.Brief>{shop.address}</List.Item.Brief>
                    </List.Item>
                ))}
            </List>
        </div>);
    }
}
