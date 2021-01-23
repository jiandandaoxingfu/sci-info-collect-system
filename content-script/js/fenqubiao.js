message.send('is-start', {});
message.on('is-start', () => {
	alert('目前无法后台获取权限，需要用户登录来获取查询期刊分区权限。');
})
