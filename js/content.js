setTimeout(() => {
	console.log(location.href);
	chrome.runtime.sendMessage({msg: 'content2background'}, (res) => {
		console.log(res);
	})
}, 1000)