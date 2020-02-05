var appId;
chrome.runtime.onMessage.addListener( (req, sender, sendRes) => {
	sendRes('已接收消息')
	if( req.msg === 'app' ) {
		appId = sender.tab.id;
	} else {
		if( appId ) {
			chrome.tabs.sendMessage(appId, {msg: '前端反馈'});
		}
	}
	console.log(appId)
})