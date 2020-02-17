function get_sid() {
	console.log('获取sid' + new Date().getMinutes() + ':' + new Date().getSeconds() );
	let sid = window.location.href.match(/&SID=(.*?)&/);
	if( sid ) {
		message.send('sid', { info: true, sid: sid[1] } );
	} else {
		message.send('sid', { info: false, sid: ''} );
	}
}

function init(n) {
	let container = document.createElement('div');
	container.setAttribute('id', 'container');
	document.body.appendChild(container);

	for( let i=0; i<n; i++ ) {
		let div = document.createElement('div');
		div.setAttribute('id', `div-${i}-part1`);
		container.appendChild(div);
	}
	
	container.innerHTML += '<div style="page-break-after: always;"></div>';

	for( let i=0; i<n; i++ ) {
		let div = document.createElement('div');
		div.setAttribute('id', `div-${i}-part2`);
		container.appendChild(div);
	}
}

function render(id, div1, div2) {
	document.querySelector(`#div-${id}-part1`).innerHTML = div1;
	document.querySelector(`#div-${id}-part2`).innerHTML = div2;
	document.querySelectorAll('span.label').forEach( e => e.setAttribute('class', '') );
}

message.send('is-start', {});
message.on('is-start', () => {
	document.write(`
		<div id='message'><br><br>
			<div style="font-size: 40px; width: 100%; text-align: center;">
				正在运行中，<span style="color: red;">请勿关闭</span>，其它运行中的窗口也不要关闭。<br>
				任务完成后，数据会显示在该页面，打印或导出为pdf即可<br><span style="font-size: 30px; color: red;">
				使用完成后，请将插件关闭，否则会影响Web of Science的正常使用。</span><br>
			</div><br><br><br><br>
		</div>`);
	document.title = '结果显示页面';
	window.stop();
	get_sid();
})

message.on('init', msg => {
	init(msg.num);
})

message.on('render', msg => {
	render(msg.id, msg.div1, msg.div2);
})

message.on('done', msg => {
	document.body.removeChild( document.querySelector('#message') );
	alert(`			任务已经完成，打印该页面或另存为pdf即可
			     		 检索结果越多，打印速度越慢
		`);
})