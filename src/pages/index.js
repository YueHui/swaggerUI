
import {connect} from 'dva';
import { Form, Input, Row, Col, message, Button, Tree, Collapse} from 'antd';
import {useState} from 'react';
import ReactJson from 'react-json-view'
import styles from './index.less';
import Service from '../components/service';
import Effect from '../components/effect';
import Reducer from '../components/reducer';

const TreeNode = Tree.TreeNode;
const Panel = Collapse.Panel;
const Search = Input.Search;

function Index(props) {
    
    const {getFieldDecorator,getFieldValue} = props.form;
    const current = props.current;
    const [expandedKeys,setExpandedKeys] = useState([]);
    const [searchValue,setSearchValue] = useState('');
    
    function getJSON(e){
        let url = getFieldValue("jsonURL");
        if(!url){
            message.warn("请输入地址");
            return;
        }
        props.dispatch({
            type:"global/getJSON",
            url
        })
    }

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
            <span className={styles.blueText} onClick={generateCode.bind(null,tag)}>生成代码</span>
        </div>
    }

    function urlTitle(url){
        const index = url.summary.indexOf(searchValue);
        const beforeStr = url.summary.substr(0, index);
        const afterStr = url.summary.substr(index + searchValue.length);
        return <div>
            {index>=0?<span>{beforeStr}<span style={{ color: '#f50' }}>{searchValue}</span>{afterStr}</span>:url.summary} &nbsp;
            <span className={styles.blueText} >({url.alias})</span>
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
                if (schema.properties[i].items.originalRef && schema.properties[i].items.originalRef != key){
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
            当前接口：{current.summary}( {current.url} )
            <h2>Request:</h2>
            {current.parameters && current.parameters[0].schema && getSchema(current.parameters[0].schema.originalRef)}
            <h2>Response:</h2>
            {current.responses && getSchema(current.responses["200"].schema.originalRef)}
            <h2>Code:</h2>
            <Collapse>
                <Panel header="Services">
                    {Service(current)}
                </Panel>
                <Panel header="Effects">
                    {Effect(current)}
                </Panel>
                <Panel header="Reducers">
                    {Reducer(current)}
                </Panel>
            </Collapse>
        </div>
    }

    function showBatch(){
        const currentTag = props.currentTag;
        return <Collapse>
            <Panel header="Services">
                {currentTag.urls.map(url => {
                    return Service(url);
                })}
            </Panel>
            <Panel header="Effects">
                {currentTag.urls.map(url => {
                    return Effect(url);
                })}
            </Panel>
            <Panel header="Reducers">
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
        props.data.map(tag=>{
            tag.urls.map(url=>{
                if(url.summary.indexOf(value)>=0 || url.url.indexOf(value)>=0){
                    expandedKeys.push(url.url);
                }
            })
        })
        setExpandedKeys(expandedKeys);
        setSearchValue(value);
    }

    function showConsole(){
        props.dispatch({
            type:"global/showConsole",
        })
    }

    return (
        <div>
            <div>
                文档地址: &nbsp;
                {getFieldDecorator("jsonURL",{
                    initialValue:"http://172.16.10.41:8118/v2/api-docs"
                })(<Input placeholder="swagger文档地址" style={{ width: 200 }} onPressEnter={getJSON} />)}
                &nbsp;&nbsp;
                <Button type="primary" onClick={getJSON}>查询</Button>
                &nbsp;&nbsp;
                <Button type="primary" onClick={showConsole}>Console</Button>
            </div>
            <Row className={styles.contain} gutter={15}>
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
                    {props.showMode=="single"?showSingle():showBatch()}
                </Col>
            </Row>
        </div>
    );
}


export default connect(state=>state.global)(Form.create()(Index));