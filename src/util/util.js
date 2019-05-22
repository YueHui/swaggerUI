export function firstToUpper(str){
	if(!str || typeof str != "string"){
		throw new Error("type Error");
	}
	let upper = str[0].toUpperCase();
	return upper+str.substr(1);
}