class App {
	constructor() {
		this.is_start = false;

		this.cite_tabs_id = [];
		this.spider_tab_id = 0;
		this.spider = null;

		this.title_arr = [];
		this.author_arr = '';
		this.year = '';
		this.data = [];
	}

	input_valid_check() {
		let title_arr = document.getElementById('title').value.replace(/，/g, ',').split(',').map(d => d.replace(/(^\s*)/, ''));
		let author = document.getElementById('author').value;
		let year = document.getElementById('year').value.replace(/，/g, ',').replace(/\s/g, '').split(',');
		if (title_arr[0] === "" || author === '' || year[0] === "") {
			alert('请输入标题， 年份， 作者');
			return false;
		} else {
			this.title_arr = title_arr;
			this.year = year;
			this.cite_tabs_id = new Array(title_arr.length).join(',').split(',');
			return this.name_format(author);
		}
	}

	name_format(s) {
		let s2 = s.split('-');
		if( s2.length === 3 ) {
			this.author_arr = [s.replace(/-/g, ''), s2[0]+s2[1]+s2[2].toLocaleLowerCase(), s2[1]+s2[2]+s2[0], s2[1]+s2[2].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0]+s2[2][0], s2[0]+s2[1][0]+s2[2][0].toLocaleLowerCase(), s2[1][0]+s2[2][0]+s2[0], s2[1][0]+s2[2][0].toLocaleLowerCase()+ s2[0] ];
		} else if( s2.length === 2 ) {
			this.author_arr = [s.replace(/-/g, ''), s2[0]+s2[1].toLocaleLowerCase(), s2[1]+s2[0], s2[1].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0], s2[0]+s2[1][0].toLocaleLowerCase(), s2[1][0]+s2[0], s2[1][0].toLocaleLowerCase()+ s2[0] ];
		} else {
			alert('请检查姓名是否符合要求');
			return false;
		}
		return true;
	}

	render() {
		this.data = [];
		this.title_arr.forEach((title, id) => {
			this.data.push({
				id: id + 1,
				title: title,
				search_result: '',
				cite_num: '',
				cite_page_printed: '',
				detail_page_printed: '',
				progress_status: [0, "normal"],
			})
		})
	}

	start() {
		this.is_start = true;
		chrome.tabs.create({
			active: false,
			url: 'https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com'
		}, tab => {
			this.spider_tab_id = tab.id;
		})
	}

	restart() {
		window.open(window.location.href, '_self');
	}

	message_handler() {
		message.on('is-start', (msg, tabid) => {
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '查询是否开始');
			let is_related_tabid = tabid == this.spider_tab_id ||
											this.cite_tabs_id.indexOf(tabid) > -1;
			if(this.is_start && is_related_tabid) {
				console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '发送开始命令');
				message.send(tabid, 'is-start', {info: ''});
			} else {
				console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '无关窗口');
			}
		})

		message.on('sid', (msg, tabid) => {
			if( !msg.info ) {
				console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '无法获取sid');
			} else {
				console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '已经获取sid')
				message.send(tabid, 'title-arr', {title_arr: this.title_arr, author_arr: this.author_arr});
			}
		})

		message.on('save-spider', msg => {
			this.spider = msg.spider;
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '已保存spider');
		})

		message.on('get-spider', (msg, tabid) => {
			message.send(tabid, 'spider', {spider: this.spider});
		})

		message.on('open-cite-page', msg => {
			chrome.tabs.create({
				active: false,
				url: msg.url
			}, (tab) => {
				this.cite_tabs_id[msg.id] = tab.id;
				console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '已经打开引用窗口');
			})
		})

		message.on('spider-get-detail-data', (msg, tabid) => {
			message.send(this.spider_tab_id, 'get-detail-data', {id: this.cite_tabs_id.indexOf(tabid)})
		});

		message.on("no-cite-refine-data", (msg, tabid) => {
			if( msg.info ) {
				console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + this.cite_tabs_id.indexOf(tabid) + ' not found');
				chrome.tabs.remove(tabid);
			}
		});

		message.on('cite-refine-done', (msg, tabid) => {
			if(msg.info) {
				message.send(this.spider_tab_id, 'get-cite-refine-data', {id: this.cite_tabs_id.indexOf(tabid), data: msg.data});
				chrome.tabs.remove(tabid);
			}
		});

		message.on('single-done', msg => {
			console.log(`第${msg.id + 1}个已经完成`)
		})

		message.on('done', msg => {
			console.log(`完成了`);
			app.spider = msg.spider;
		})
	}
}

var app = new App();
app.message_handler();

document.addEventListener('click', (e) => {
	if( e.target.tagName.toLowerCase() === 'button' ) {
		let action = e.target.innerText;
		if( action === "开始统计" ) {
			if (this.is_start) {
				alert('请重新启动或者等待任务完成');
				return;
			}
			if( app.input_valid_check() ) {
				app.render();
				app.start();
			}
		} else if( action === "重新启动" ) {
			app.restart();
		}
	}
})