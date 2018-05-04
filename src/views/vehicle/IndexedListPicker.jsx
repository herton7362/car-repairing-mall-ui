import React from 'react';
import util from '@/libs/util';

import { ListView, List, SearchBar } from 'antd-mobile';

function genData(ds, data) {
    const dataBlob = {};
    const sectionIDs = [];
    const rowIDs = [];
    let tempItem;
    Object.keys(data).forEach((item, index) => {
        tempItem = item.split(",");
        sectionIDs.push(tempItem[0]);
        dataBlob[tempItem[0]] = tempItem[1];

        rowIDs[index] = [];

        data[item].forEach((jj) => {
            rowIDs[index].push(jj.id);
            dataBlob[jj.id] = jj;
        });
    });
    return ds.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
}

let datas = [];

export default class VehicleSelector extends React.Component {
    constructor(props) {
        super(props);
        const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
        const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];

        const dataSource = new ListView.DataSource({
            getRowData,
            getSectionHeaderData: getSectionData,
            rowHasChanged: (row1, row2) => row1 !== row2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });

        this.state = {
            inputValue: '',
            dataSource,
            isLoading: true
        };
    }

    componentDidMount() {
        // simulate initial Ajax
        util.ajax.get(this.props.url).then((response)=>{
            datas = response.data;
            this.setState({
                dataSource: genData(this.state.dataSource, response.data),
                isLoading: false
            });
        })
    }

    onSearch = (val) => {
        const pd = { ...datas };
        Object.keys(pd).forEach((item) => {
            const arr = pd[item].filter(jj => (jj.pinyin && jj.pinyin.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) > -1) ||
                jj.name.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) > -1);
            if (!arr.length) {
                delete pd[item];
            } else {
                pd[item] = arr;
            }
        });
        this.setState({
            inputValue: val,
            dataSource: genData(this.state.dataSource, pd),
        });
    }

    onCancel = () => {
        this.setState({
            inputValue: '',
            dataSource: genData(this.state.dataSource, datas),
        });
    }

    onSelect (sectionData, rowData) {
        this.props.onSelect(sectionData, rowData);
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
            <ListView.IndexedList
                dataSource={this.state.dataSource}
                useBodyScroll
                renderSectionHeader={sectionData => (
                    <div>{sectionData}</div>
                )}
                renderHeader={this.props.header}
                renderRow={(rowData, sectionId, rowId) => (<List.Item onClick={()=>{this.onSelect({id: sectionId}, rowData)}} >{rowData.name}</List.Item>)}
                quickSearchBarStyle={{
                    top: 129,
                    display: this.props.showQuickSearchBar? 'inline-block': 'none'
                }}
                delayTime={10}
                delayActivityIndicator={<div style={{ padding: 25, textAlign: 'center' }}>加载中...</div>}
            />
        </div>);
    }
}
