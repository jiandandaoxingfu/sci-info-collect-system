class Message {
	send(title, msg) {
		chrome.runtime.sendMessage({title: title, msg: msg});
	}

	on(title, callback) {
		chrome.runtime.onMessage.addListener( (req, sender, sendRes) => {
			if(req.title === title) {
				callback(req.msg);
			}
		});
	}
}

message = new Message();