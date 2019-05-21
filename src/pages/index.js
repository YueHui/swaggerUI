
import {connect} from 'dva';
import { Form, Input, Row, Col, message, Button, Tree, Collapse} from 'antd';
import ReactJson from 'react-json-view'
import styles from './index.less';
import Service from '../components/service';
import Effect from '../components/effect';
import Reducer from '../components/reducer';

const TreeNode = Tree.TreeNode;
const Panel = Collapse.Panel;

function Index(props) {
    
    const {getFieldDecorator,getFieldValue} = props.form;
    const current = props.current;
    
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
        if (!e.selected) return;
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
            
            if (schema.properties[i].originalRef){
                result[i] = getPropties(props.originData.definitions[schema.properties[i].originalRef]);
            } else if (schema.properties[i].items){
                //如果不是树循环
                if (schema.properties[i].items.originalRef && schema.properties[i].items.originalRef != key){
                    result[i] = getPropties(props.originData.definitions[schema.properties[i].items.originalRef], schema.properties[i].items.originalRef);
                }else{
                    result[i] = i;
                }
                
            }else{
                result[i] = schema.properties[i].description;
            }
        }
        return result;
    }

    function showSingle(){
        return <div>
            当前接口：{current.summary}( {current.url} )
            <h2>Request:</h2>
            {current.parameters && getSchema(current.parameters[0].schema.originalRef)}
            <h2>Response:</h2>
            {current.responses && getSchema(current.responses["200"].schema.originalRef)}
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

    return (
        <div>
            <div>
                文档地址: &nbsp;
                {getFieldDecorator("jsonURL",{
                    initialValue:"http://172.16.10.41:8118/v2/api-docs"
                })(<Input placeholder="swagger文档地址" style={{ width: 200 }} onPressEnter={getJSON} />)}
                &nbsp;&nbsp;
                <Button type="primary" onClick={getJSON}>查询</Button>
            </div>
            <Row className={styles.contain} gutter={15}>
                <Col span={8}>
                    <Tree
                        onSelect={changeCurrent}
                    >
                        {props.data.map(tag=>{
                            return <TreeNode title={tagTitle(tag)} key={tag.description}>
                                {tag.urls.map(url=>{
                                    return <TreeNode title={url.summary} key={url.url} data={url} />
                                })}
                            </TreeNode>
                        })}
                    </Tree>
                </Col>
                <Col span={16}>
                    {props.showMode=="single"?showSingle():showBatch()}
                </Col>
            </Row>
        </div>
    );
}


export default connect(state=>state.global)(Form.create()(Index));