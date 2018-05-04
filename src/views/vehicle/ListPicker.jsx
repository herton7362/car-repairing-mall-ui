import React from 'react';
import util from '@/libs/util';

import { List, SearchBar } from 'antd-mobile';

let datas = [];

export default class VehicleSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputValue: '',
            datas: [],
            isLoading: true
        };
    }

    componentDidMount() {
        // simulate initial Ajax
        util.ajax.get(this.props.url, {
            params: this.props.params
        }).then((response)=>{
            datas = response.data;
            this.setState({
                datas: response.data,
                isLoading: false
            });
        })
    }

    onSearch = (val) => {
        const pd = [...datas];
        this.setState({
            inputValue: val,
            datas: pd.filter(jj => (jj.pinyin && jj.pinyin.toLocaleLowerCase().indexOf(val) > -1) ||
                jj.name.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) > -1)
        });
    }

    onCancel = () => {
        this.setState({
            inputValue: '',
            datas: [...datas]
        });
    }

    onSelect (rowData) {
        this.props.onSelect(rowData);
    }

    render() {
        return (<div>
            <div style={{ position: 'absolute', top: 44, left: 0, right: 0 }}>
                <SearchBar
                    value={this.state.inputValue}
                    placeholder="搜索"
                    onChange={this.onSearch}
                    onCancel={this.onCancel}
                />
            </div>
            <List renderHeader={this.props.header}>
                {this.state.isLoading && <div style={{ padding: 25, textAlign: 'center' }}>加载中...</div>}
                {this.state.datas.map((data)=>(
                    <List.Item arrow={this.props.finalSelection && "horizontal"}
                               key={data.id}
                               onClick={()=>{this.onSelect(data)}}>{data.name}</List.Item>
                ))}
            </List>
        </div>);
    }
}
