
import {connect} from 'dva';
import { Form, Input, message, Button} from 'antd';
import {useState} from 'react';
import Apis from '../components/apis';
import Enums from '../components/enums';

function Index(props) {

    const {getFieldDecorator,getFieldValue} = props.form;
    // 当前显示 apis/enums
    const [showType,setShowType] = useState('apis');

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
                <Button type="primary" onClick={()=>setShowType(showType === "apis"?"enums":"apis")}>{showType === "apis"?"Enums":"Apis"}</Button>
                &nbsp;&nbsp;
                <Button type="primary" onClick={showConsole}>Console</Button>
            </div>
            {showType === "apis"?<Apis {...props} />:<Enums data={props.enumData || []} />}
        </div>
    );
}


export default connect(state=>state.global)(Form.create()(Index));
