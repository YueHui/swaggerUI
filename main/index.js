const {app,BrowserWindow,ipcMain,net,globalShortcut} = require("electron");
const isDev = require('electron-is-dev');
//忽略证书错误
app.commandLine.appendSwitch('ignore-certificate-errors', true);

let win;

function createWindow(){
	win = new BrowserWindow({
		width:1200,
        height:800,
        title:"swagger ui",
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		}
    });
	win.on('closed', () => {
		win = null
	})
	if(isDev){
		win.loadURL("http://localhost:8000/");
		win.webContents.openDevTools();
	}else{
		win.loadFile('./build/index.html');
    }

    win.on('focus', () => {
        globalShortcut.register('CommandOrControl+F', function () {
            if (win && win.webContents) {
                win.webContents.send('on-find', '')
            }
        })
    })
    win.on('blur', () => {
        globalShortcut.unregister('CommandOrControl+F')
    })

}

ipcMain.on("getData",function(e,url){
	console.log(url);
	const request = net.request({
		url,
		protocol:url.includes('htts')?'https:':'http:'
	});
	request.on('response', (response) => {
		let result = '';
		console.log(`STATUS: ${response.statusCode}`)
		response.on('data', (chunk) => {
			result += chunk;
		})
		response.on('end', () => {
			console.log('No more data in response.');
			e.sender.send('jsonData', result)
		})
	})
	request.on('error',res=>{
		console.log(res);
		e.sender.send('jsonData',JSON.stringify({status:-1,msg:'请求失败'}))
	})
	request.end()
})

ipcMain.on("showConsole",function(){
	if(win !== null){
		win.webContents.openDevTools();
	}
})

app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', () => {
	// 在macOS上，当单击dock图标并且没有其他窗口打开时，
	// 通常在应用程序中重新创建一个窗口。
	if (win === null) {
		createWindow()
	}
})
