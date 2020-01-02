/*
 * @Author: yueHui
 * @Date: 2020-01-02 15:45:51
 * @Last Modified by: yueHui
 * @Last Modified time: 2020-01-02 16:10:25
 */

import { Input, Row, Col, Tree, Collapse} from 'antd';
import {useState} from 'react';
import ReactJson from 'react-json-view'
import Service from './service';
import Effect from './effect';
import Reducer from './reducer';
import {copy} from '../util/util';
import styles from './styles.less';

const TreeNode = Tree.TreeNode;
const Search = Input.Search;
const Panel = Collapse.Panel;

function Apis(props){

    const [expandedKeys,setExpandedKeys] = useState([]);
    const [searchValue,setSearchValue] = useState('');

    const current = props.current;

    function changeCurrent(selectedKeys,e){
        if (!e.selected || !e.node.props.data) return;
        props.dispatch({
            type:"global/updateCurrent",
            current: e.node.props.data
        })
    }

    function tagTitle(tag){
        return <div>
            {tag.tagName} &nbsp;
            <span className="blueText" onClick={generateCode.bind(null,tag)}>生成代码</span>
        </div>
    }

    function urlTitle(url){
        const index = url.summary.indexOf(searchValue);
        const beforeStr = url.summary.substr(0, index);
        const afterStr = url.summary.substr(index + searchValue.length);
        return <div>
            {index >= 0 ? <span>{beforeStr}<span style={{ color: '#f50' }}>{searchValue}</span>{afterStr}</span> : url.url === searchValue ? <span style={{ color: '#f50' }}>{url.summary}</span>:url.summary} &nbsp;
            <span className="blueText" >({url.alias})</span>
        </div>
    }

    function generateCode(tag,e){
        e.stopPropagation();
        props.dispatch({
            type:"global/updateCurrentTag",
            currentTag:tag
        });
    }

    function getSchema(key){
        let schema = props.originData.definitions[key];
        let properties = getPropties(schema);
        return <ReactJson collapsed={2} name={false} theme="monokai" src={properties} />
    }

    function getPropties(schema,key){
        //return schema.properties;
        let result = {};
        for(let i in schema.properties){
            let name = i;
            if(schema.required && schema.required.indexOf(i)>=0){
                name = '*'+i;
            }

            if (schema.properties[i].originalRef){
                result[name] = getPropties(props.originData.definitions[schema.properties[i].originalRef]);
            } else if (schema.properties[i].items){
                //如果不是树循环
                if (schema.properties[i].items.originalRef && schema.properties[i].items.originalRef !== key){
                    if (schema.properties[i].type === "array"){
                        result[name] = [];
                        result[name].push(getPropties(props.originData.definitions[schema.properties[i].items.originalRef], schema.properties[i].items.originalRef));
                    }else{
                        result[name] = getPropties(props.originData.definitions[schema.properties[i].items.originalRef], schema.properties[i].items.originalRef);
                    }
                }else{
                    if (schema.properties[i].type === "array") {
                        result[name] = [];
                        result[name].push(i);
                    }else{
                        result[name] = i;
                    }
                }

            }else{
                result[name] = schema.properties[i].description;
                if (schema.properties[i].enum){
                    result[name] += "  ";
                    result[name] += schema.properties[i].enum.toString();
                }
            }
        }
        return result;
    }

    function showSingle(){
        if (!current.url) return "请选择一个接口";
        return <div>
            当前接口：{current.summary}( <span className="blueText" onClick={copy.bind(null,current.url)}>{current.url}</span> )
            <h2>Request:</h2>
            {current.parameters && current.parameters[0].schema && getSchema(current.parameters[0].schema.originalRef)}
            <h2>Response:</h2>
            {current.responses && getSchema(current.responses["200"].schema.originalRef)}
            <h2>Code:</h2>
            <Collapse>
                <Panel key="services" header="Services (可点击复制)">
                    {Service(current)}
                </Panel>
                <Panel key="effects" header="Effects (可点击复制)">
                    {Effect(current)}
                </Panel>
                <Panel key="reducers" header="Reducers (可点击复制)">
                    {Reducer(current)}
                </Panel>
            </Collapse>
        </div>
    }

    function showBatch(){
        const currentTag = props.currentTag;
        return <Collapse>
            <Panel key="services" header="Services">
                {currentTag.urls.map(url => {
                    return Service(url);
                })}
            </Panel>
            <Panel key="effects" header="Effects">
                {currentTag.urls.map(url => {
                    return Effect(url);
                })}
            </Panel>
            <Panel key="reducers" header="Reducers">
                {currentTag.urls.map(url => {
                    return Reducer(url);
                })}
            </Panel>
        </Collapse>
    }

    function onExpand(expandedKeys){
        setExpandedKeys(expandedKeys);
    }

    function searchTree(e){
        let value = e.target.value;
        if(!value) return;
        value = value.trim();
        const expandedKeys = [];
        props.data.forEach(tag=>{
            tag.urls.forEach(url=>{
                if(url.summary.indexOf(value)>=0 || url.url.indexOf(value)>=0){
                    expandedKeys.push(tag.description);
                }
            })
        })
        setExpandedKeys(expandedKeys);
        setSearchValue(value);
    }

    return <Row className={styles.contain} gutter={15}>
    <Col span={8}>
        <Search placeholder="模糊搜索" onChange={searchTree} />
        <div className={styles.treeContain}>
            <Tree
                onSelect={changeCurrent}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                autoExpandParent
            >
                {props.data.map(tag => {
                    return <TreeNode title={tagTitle(tag)} key={tag.description}>
                        {tag.urls.map(url => {
                            return <TreeNode title={urlTitle(url)} key={url.url} data={url} />
                        })}
                    </TreeNode>
                })}
            </Tree>
        </div>
    </Col>
    <Col span={16}>
        {props.showMode === "single"?showSingle():showBatch()}
    </Col>
</Row>
}

export default Apis;
