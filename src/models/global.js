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
				originData = JSON.parse(originData);
			}catch(e){
				message.warn('请求数据错误');
			}
			

			if(originData.status === -1){
				return message.error(originData.msg || '请求发生错误');
			}
			
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
				if (originData.paths[url] && originData.paths[url].post){
					let tag = data.find(item => originData.paths[url].post.tags.indexOf(item.tagName)>=0);
					let strArray = url.split("/");
					if(tag){
						tag.urls.push({
							url,
							alias:strArray[strArray.length-1],
							description: originData.paths[url].post.description,
							summary: originData.paths[url].post.summary,
							parameters: originData.paths[url].post.parameters,
							responses: originData.paths[url].post.responses,
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

