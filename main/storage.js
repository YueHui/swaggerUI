const fs = require('fs');
const storagePath = `${process.env.HOME}/.swaggerUI/`;
const configName = 'config.json';
const configFile = storagePath+configName;

module.exports = {
    addDoc(doc){
        checkDir();
        const config = require(configFile);
        const docList = config.docList;
        docList.push({
            id: docList.length > 0 ? docList[docList.length-1].id+1:0,
            ...doc
        })
        saveConfig(config);
    },
    getDocList(){
        if(!fs.existsSync(configFile)){
            return [];
        }
        const config = require(configFile);
        return config.docList || [];
    }
}

/**
 * 检查存储文件 不存在则创建
 */
function checkDir(){
    if(!fs.existsSync(storagePath)){
        fs.mkdirSync(storagePath,{recursive:true});
    }
    if(!fs.existsSync(configFile)){
        fs.writeFileSync(configFile);
        fs.writeFileSync(configFile,`{"docList": []}`)
    }
}

function saveConfig(config){
    fs.writeFileSync(configFile,JSON.stringify(config))
}