class App {
	constructor() {
		this.is_start = false;

		this.cite_tabs_id = [];
		this.spider_tab_id = 0;

		this.title_arr = [];
		this.author = '';
		this.year = '';
		this.data = [];
	}

	message_handler() {
		message.on('sid', msg => {
			if( !msg.sid ) {
				alert('无法获取sid');
			}
		})

		message.on('open-cite-page', msg => {
			chrome.tabs.create({
				active: false,
				url: msg.url
			}, (tab) => {
				this.cite_tabs_id[msg.id] = tab.id;
			})
		})

		message.on("no-cite-refine-data", (msg, tabid) => {
			if( msg.info ) {
				console.log(this.cite_tabs_id.indexOf(tabid) + ' not found');
			}
		});

		message.on('cite-refine-data', (msg, tabid) => {
			chrome.tabs.remove(tabid);
			message.send('data-id', {id: this.cite_tabs_id.indexOf(tabid)})
		} );

		message.on('cite-refine-data-done', (msg, tabid) => {
			if(msg.info) {
				chrome.tabs.remove(tabid);
			}
		});

		// message.on("open_detail_page", (msg) => {
		// 	chrome.tabs.create({
		// 		active: false,
		// 		url: msg.url
		// 	}, (tab) => {
		// 		this.detail_tabs_id = tab.id;
		// 	})
		// })

		message.on('close-window', (msg) => {
			this.is_start = false;
			// chrome.tabs.remove(this.detail_tab_id);
		})
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
			this.author = author;
			this.year = year;
			this.cite_tabs_id = new Array(title_arr.length).join(',').split(',');
			return true;
		}
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
			url: ''
		}, tabid => {
			message.send(tabid, 'title-arr', {title_arr: this.title_arr});
		})
	}

	restart() {
		window.open(window.location.href, '_self');
	}
}

var app = new App();
app.get_sid();
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