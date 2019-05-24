import { ipcRenderer } from 'electron';

export default {
	namespace: "global",
	state: {
		originData:{},
		data:[],
		current:{},
		showMode:'single',
		currentTag:{}
	},
	subscriptions: {},
	effects:{
		*getJSON({url},{put,call}){
			let originData = yield getData(url);
			originData = JSON.parse(originData);
			
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
			console.log(originData,data);
			yield put({
				type:"updateData",
				data,
				originData
			})
			
		},
		showConsole(){
			ipcRenderer.send("showConsole");
		}
	},
	reducers:{
		updateData(state, { data, originData}){
			return {...state,data,originData}
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
			reject();
		}, 5000);
	})
}

