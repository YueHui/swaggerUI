import { message } from 'antd';
import { clipboard } from 'electron';

export function firstToUpper(str){
	if(!str || typeof str != "string"){
		throw new Error("type Error");
	}
	let upper = str[0].toUpperCase();
	return upper+str.substr(1);
}

export function copy(str){
	if (!str || typeof str != "string") {
		throw new Error("type Error");
	}
	
	clipboard.writeText(str);
	message.success("复制成功");
}