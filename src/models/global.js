import { message } from 'antd';
import { ipcRenderer } from 'electron';

export default {
	namespace: "global",
	state: {
		originData:{},
		data:[],
		current:{},
		showMode:'single',
        currentTag:{},
        enumData:[]
	},
	subscriptions: {},
	effects:{
		*getJSON({url},{put,call}){
			let originData = yield getData(url);
			try{
				const temp = originData.replace(/'-'/g,'').replace(/'/g,'"');
				originData = JSON.parse(temp);
			}catch(e){
				message.warn('请求数据错误');
				return;
			}
			

			if(originData.status === -1){
				return message.error(originData.msg || '请求发生错误');
			}
			message.success("查询成功");
			
			// console.log(originData);
			let data = [];
			originData.tags.forEach(tag=>{
				data.push({
					tagName:tag.name,
					description: tag.description,
					urls:[]
				});
			})
			for (let url in originData.paths){
				for(let method in originData.paths[url]){
					let tag = data.find(item => originData.paths[url][method].tags.indexOf(item.tagName)>=0);
					let strArray = url.split("/");
					if(tag){
						tag.urls.push({
							url,
							method,
							alias:strArray[strArray.length-1],
							description: originData.paths[url][method].description,
							summary: originData.paths[url][method].summary,
							parameters: originData.paths[url][method].parameters,
							responses: originData.paths[url][method].responses,
						})
					}
				}
			}
            //console.log(originData,data);
            const enums = [];
            //处理enums
            for(let i in originData.definitions){
                if(i.indexOf("API") === 0) continue;
                let obj = originData.definitions[i];
                if(!obj.properties) continue;
                for(let j in obj.properties){
                    if(obj.properties[j].description && obj.properties[j].enum){
                        let exists = enums.find(e=> e.description === obj.properties[j].description && e.enum.length === obj.properties[j].enum.length);
                        if(exists) continue;
                        enums.push({
                            description:obj.properties[j].description,
                            enum:obj.properties[j].enum,
                            structName:i
                        });
                    }
                }
            };
            // console.log(enums);
			yield put({
				type:"updateData",
				data,
                originData,
                enumData:enums
			})

		},
		showConsole(){
			ipcRenderer.send("showConsole");
		}
	},
	reducers:{
		updateData(state, { data, originData, enumData}){
			return {...state,data,originData, enumData}
		},
		updateCurrent(state, {current}){
			return { ...state, current,showMode:"single"}
		},
		updateCurrentTag(state, {currentTag}){
			return { ...state, currentTag,showMode:"batch"}
		},
		updateShowMode(state, {showMode}){
			return { ...state, showMode}
		}
	}
}

function getData(url){
	return new Promise((resolve,reject)=>{
		let timeout = 0;
		ipcRenderer.send("getData", url);
		ipcRenderer.on("jsonData",function(e,data){
			clearTimeout(timeout);
			resolve(data);
		})
		setTimeout(() => {
			reject({status:-1});
		}, 5000);
	})
}

