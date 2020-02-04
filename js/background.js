// chrome.tabs.query({
// 	active: true,
// 	currentWindow: true
// }, function(tabs) {
// 	chrome.tabs.sendMessage(tabs[0].id, {
// 		from: 'background',
// 		to: 'content_scripts'
// 	}, function(response) {
// 		console.log(response);
// 	});
// });

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {

})