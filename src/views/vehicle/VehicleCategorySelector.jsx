import React from 'react';
import util from '@/libs/util';

import { NavBar, Icon } from 'antd-mobile';
import IndexedListPicker from './IndexedListPicker';
import ListPicker from './ListPicker';
import Home from "../home/Home";

import './vehicle-category-selector.less';

const titles = ['请选择品牌', '请选择车系', '请选择排量', '请选择生产年份'];

export default class VehicleSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 0,
            selectedDatas: []
        };
    }

    onBrandSelect = (sectionData, rowData) => {
        this.setState({
            step: 1,
            selectedDatas: [[rowData]]
        });
    }

    onTrainSelect = (sectionData, rowData) => {
        this.setState((prevState, props) => ({
            step: 2,
            selectedDatas: [...prevState.selectedDatas, [sectionData, rowData]]
        }));
    }

    onDisplacementSelect = (rowData) => {
        this.setState((prevState, props) => ({
            step: 3,
            selectedDatas: [...prevState.selectedDatas, [rowData]]
        }));
    }

    onYearOfProductionSelect = (rowData) => {
        const result = [];
        const resultObj = [];
        this.state.selectedDatas.push([rowData]);
        this.state.selectedDatas.forEach((data)=>{
            result.push(...data.map(d=>d.id));
            resultObj.push(...data.map(d=>d));
        });
        this.props.onFinishSelected(result, resultObj);
    }

    goBack = () => {
        if(this.state.step > 0) {
            this.setState((prevState, props) => {
                prevState.selectedDatas.splice(prevState.step - 1)
                return {
                    step: prevState.step - 1,
                    selectedDatas: prevState.selectedDatas
                }
            });
        } else {
            this.props.onQuit();
        }
    }

    createHeader = () => {
        return (
            <div>
                <img width={30} src={`${util.baseURL}/attachment/download/${this.state.selectedDatas[0][0].logo.id}`}/>
                <span>{
                    `${this.state.selectedDatas[0][0].name}
                    ${this.state.selectedDatas[1] && this.state.selectedDatas[1][1].name || ''}`
                }</span>
            </div>
        );
    }

    render() {
        return (<div className="vehicle-category-selector">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                <NavBar
                    mode="light"
                    leftContent={[<Icon key="1" type="left" />, <span key="2">返回</span>]}
                    onLeftClick={this.goBack}
                >{titles[this.state.step]}</NavBar>
            </div>
            {this.state.step === 0 && React.createElement(IndexedListPicker, {
                url: '/vehicleCategory/brand',
                header: () => <div className="text-header">请选择品牌</div>,
                showQuickSearchBar: true,
                onSelect: this.onBrandSelect
            })}

            {this.state.step === 1 && React.createElement(IndexedListPicker, {
                url: `/vehicleCategory/train/${this.state.selectedDatas[0][0].id}`,
                header: () => {
                    return this.createHeader()
                },
                onSelect: this.onTrainSelect
            })}

            {this.state.step === 2 && React.createElement(ListPicker, {
                url: `/vehicleCategory`,
                params: {
                    'parent.id': this.state.selectedDatas[1][1].id
                },
                header: () => {
                    return this.createHeader()
                },
                onSelect: this.onDisplacementSelect
            })}

            {this.state.step === 3 && React.createElement(ListPicker, {
                url: `/vehicleCategory`,
                params: {
                    'parent.id': this.state.selectedDatas[2][0].id
                },
                header: () => {
                    return this.createHeader()
                },
                onSelect: this.onYearOfProductionSelect,
                finalSelection: true
            })}
        </div>);
    }
}
