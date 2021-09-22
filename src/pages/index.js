
import {connect} from 'dva';
import { Form, message, Input, Button, Select, Modal} from 'antd';
import {useState,useEffect} from 'react';
import Apis from '../components/apis';
import Enums from '../components/enums';
import { ipcRenderer } from 'electron';

const Option = Select.Option;

function Index(props) {

    const {getFieldDecorator,getFieldValue} = props.form;
    const [addDocModal,setAddDocModal] = useState(false);
    // 当前显示 apis/enums
    const [showType,setShowType] = useState('apis');
    const [docList,setDocList] = useState([]);
    const [currentURL,setCurrentURL] = useState("");

    useEffect(()=>{
        ipcRenderer.send("getDocList");
        ipcRenderer.on("docList",function(e,data){
            setDocList(JSON.parse(data));
        })
    },[])

    function showConsole(){
        props.dispatch({
            type:"global/showConsole",
        })
    }

    function addDoc(){
        setAddDocModal(true);
    }

    function selectDoc(docAddress){
        if(!docAddress){
            return message.warn("地址错误");
        }
        setCurrentURL(docAddress)
        props.dispatch({
            type:"global/getJSON",
            url:docAddress
        })
    }

    return (
        <div>
            <div>
                文档地址: &nbsp;
                <Select style={{minWidth:200}} placeholder="请选择" onSelect={selectDoc}>
                    {docList.map(doc=>{
                        return <Option value={doc.address} key={doc.id}>{doc.name}</Option>
                    })}
                </Select>
                &nbsp;&nbsp;
                <Button type="primary" onClick={()=> selectDoc(currentURL)}>查询</Button>
                &nbsp;&nbsp;
                <Button onClick={addDoc}>新增</Button>
                &nbsp;&nbsp;
                <Button type="primary" onClick={()=>setShowType(showType === "apis"?"enums":"apis")}>{showType === "apis"?"Enums":"Apis"}</Button>
                &nbsp;&nbsp;
                <Button type="primary" onClick={showConsole}>Console</Button>
            </div>
            {showType === "apis"?<Apis {...props} />:<Enums data={props.enumData || []} />}
            <AddDocModal visible={addDocModal} onCancel={()=> setAddDocModal(false)} />
        </div>
    );
}


export default connect(state=>state.global)(Form.create()(Index));


const AddDocModal = Form.create()(function(props){
    const {getFieldDecorator,validateFields} = props.form;

    function save(){
        validateFields((err,values)=>{
            if(err) return;
            ipcRenderer.send('addDoc',JSON.stringify(values));
            props.onCancel();
        })
    }

    return <Modal
        title="新增"
        visible={props.visible}
        onCancel={props.onCancel}
        onOk={save}
    >
        <Form labelCol={{span:6}} wrapperCol={{span:18}}>
            <Form.Item label="名称">
                {getFieldDecorator("name",{
                    rules:[{required:true, message:"请输入名称"}]
                })(
                    <Input placeholder="请输入名称" />
                )}
            </Form.Item>
            <Form.Item label="地址">
                {getFieldDecorator("address",{
                    rules:[{required:true, message:"请输入地址"}]
                })(
                    <Input placeholder="请输入地址" />
                )}
            </Form.Item>
        </Form>
    </Modal>
})
