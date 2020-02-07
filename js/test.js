console.log(chrome.paper);

setTimeout( () => {
	chrome.paper = Math.random();
	window.location.href = 'https://www.baidu.com?s=1';
}, 3000)

