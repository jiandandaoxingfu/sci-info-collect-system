class App {
	constructor() {
		this.is_start = false;
		this.data = [];
		this.sid = '';
		this.current_paper_info = {};
	}

	get_sid() {
		chrome.tabs.create({
			active: false,
			url: "https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com"
		})
	}

	message_handler() {
		message.on("sid", (msg) => {
			if( msg.sid ) {
				this.sid = msg.sid;
				alert("已获取sid");
			} else {
				alert('无法获取sid');
			}
		})

		message.on("open_detail_page", (msg) => {
			chrome.tabs.create({
				active: false,
				url: msg.url
			})
		})

		message.on('get-paras', (msg) => {
			chrome.tabs.sendMessage(this.search_win_id, this.current_paper_info);
		})
	}

	input_valid_check() {
		let title_arr = document.getElementById('title').value.replace(/，/g, ',').split(',').map(d => d.replace(/(^\s*)/, ''));
		let author = document.getElementById('author').value;
		let year = document.getElementById('year').value.replace(/，/g, ',').replace(/\s/g, '').split(',');
		if (title_arr[0] === "" || author === '' || year[0] === "") {
			alert('请输入标题， 年份， 作者');
			return false;
		}
		this.title_arr = title_arr;
		this.author = author;
		this.year = year;
		return true;
	}

	render() {
		if (this.is_start) {
			alert('请重新启动或者等待任务完成');
			return;
		}
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
		this.current_paper_info = {title: "paper-paras", sid: this.sid, id: 0, title_: this.title_arr[0], author: this.author};
		let url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/WOS_GeneralSearch.do?fieldCount=1&action=search&product=WOS&search_mode=GeneralSearch&SID=${this.sid}&max_field_count=25&max_field_notice=%E6%B3%A8%E6%84%8F%3A+%E6%97%A0%E6%B3%95%E6%B7%BB%E5%8A%A0%E5%8F%A6%E4%B8%80%E5%AD%97%E6%AE%B5%E3%80%82&input_invalid_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E8%AF%B7%E8%BE%93%E5%85%A5%E6%A3%80%E7%B4%A2%E8%AF%8D%E3%80%82&exp_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E4%B8%93%E5%88%A9%E6%A3%80%E7%B4%A2%E8%AF%8D%E5%8F%AF%E4%BB%A5%E5%9C%A8%E5%A4%9A%E4%B8%AA%E5%AE%B6%E6%97%8F%E4%B8%AD%E6%89%BE%E5%88%B0+%28&input_invalid_notice_limits=+%3Cbr%2F%3E%E6%B3%A8%E6%84%8F%3A+%E6%BB%9A%E5%8A%A8%E6%A1%86%E4%B8%AD%E6%98%BE%E7%A4%BA%E7%9A%84%E5%AD%97%E6%AE%B5%E5%BF%85%E9%A1%BB%E8%87%B3%E5%B0%91%E4%B8%8E%E4%B8%80%E4%B8%AA%E5%85%B6%E4%BB%96%E6%A3%80%E7%B4%A2%E5%AD%97%E6%AE%B5%E7%9B%B8%E7%BB%84%E9%85%8D%E3%80%82&sa_params=WOS%7C%7C7AVrjhmEcJpyJsy2QBT%7Chttp%3A%2F%2Fapps.webofknowledge.com%7C%27&formUpdated=true&value%28input1%29=${this.title_arr[0]}&value%28select1%29=TI&value%28hidInput1%29=&limitStatus=collapsed&ss_lemmatization=On&ss_spellchecking=Suggest&SinceLastVisit_UTC=&SinceLastVisit_DATE=&period=Range+Selection&range=ALL&startYear=1985&endYear=2020&editions=SCI&editions=SSCI&editions=AHCI&editions=ISTP&editions=ESCI&editions=CCR&editions=IC&update_back2search_link_param=yes&ssStatus=display%3Anone&ss_showsuggestions=ON&ss_numDefaultGeneralSearchFields=1&ss_query_language=&rs_sort_by=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A`;
		chrome.tabs.create({
			active: false,
			url: url
		}, (tab) => {
			console.log(tab)
			this.search_win_id = tab.id;
		})
	}

	restart() {
		window.open(window.location.href, '_self');
	}

	// update_and_load(data, message) {
	// 	this.setState({
	// 		data: data
	// 	}, () => {
	// 		let title_arr = this.state.title_arr;
	// 		let last_progress_status = this.state.data[this.state.data.length - 1].progress_status;
	// 		if (last_progress_status[1] !== 'normal' || last_progress_status[0] === 100) {
	// 			setTimeout(() => {
	// 				this.state.has_send_title = false;
	// 				this.valid_title();
	// 			}, 600);
	// 		} else if (!message.match(/\d/)) {
	// 			this.setState({
	// 				current_id: this.state.current_id + 1
	// 			}, () => {
	// 				electron.ipcRenderer.send('search_title_2_main', {
	// 					title: title_arr[this.state.current_id],
	// 					id: this.state.current_id + 1,
	// 				});
	// 			})
	// 		}
	// 	});
	// }

	// message_handle() {
	// 	if (this.state.has_listen_message) return;
	// 	this.state.has_listen_message = true;
	// 	electron.ipcRenderer.on('search_page_status', (event, message) => {
	// 		let data = [...this.state.data];
	// 		if (message === 'mutil') {
	// 			data[this.state.current_id].search_result = '标题不精确';
	// 			data[this.state.current_id].progress_status = [25, 'exception'];
	// 		} else if (message === 'no_cite') {
	// 			data[this.state.current_id].search_result = '引用量为0';
	// 			data[this.state.current_id].cite_num = 0;
	// 			data[this.state.current_id].progress_status = [100, 'success '];
	// 		} else if (message === 'no_found') {
	// 			data[this.state.current_id].search_result = '没有找到';
	// 			data[this.state.current_id].progress_status = [25, 'exception'];
	// 		} else {
	// 			data[this.state.current_id].search_result = '已截图';
	// 			data[this.state.current_id].progress_status = [25, 'normal'];
	// 		}
	// 		this.update_and_load(data, message);
	// 	})

	// 	electron.ipcRenderer.on('cite_page_status', (event, message) => {
	// 		let data = [...this.state.data];
	// 		if (message === 'no_cite') {
	// 			data[this.state.current_id].cite_num = '0';
	// 			data[this.state.current_id].progress_status = [100, 'success '];
	// 		} else {
	// 			data[this.state.current_id].cite_num = message;
	// 			data[this.state.current_id].progress_status = [50, 'normal'];
	// 		}
	// 		this.update_and_load(data, message);
	// 	})

	// 	electron.ipcRenderer.on('cite_num', (event, message) => {
	// 		let data = [...this.state.data];
	// 		data[this.state.current_id].self_cite_num = message.self_cite_num;
	// 		data[this.state.current_id].other_cite_num = message.other_cite_num;
	// 		console.log(message);
	// 		this.update_and_load(data, '1');
	// 	})

	// 	electron.ipcRenderer.on('print', (event, message) => {
	// 		let data = [...this.state.data];
	// 		if (message === 'cite_page_printed') {
	// 			data[this.state.current_id].cite_page_printed = '已打印';
	// 			data[this.state.current_id].progress_status = [75, 'normal']
	// 			this.update_and_load(data, '1');
	// 		} else if (message === 'detail_page_printed') {
	// 			data[this.state.current_id].detail_page_printed = '已打印';
	// 			data[this.state.current_id].progress_status = [100, 'success ']
	// 			this.update_and_load(data, '');
	// 		} else {
	// 			alert('统计完成');
	// 		}
	// 	})
	// }

	// valid_title() {
	// 	let title_arr = [];
	// 	for (let data of this.state.data) {
	// 		if (data.cite_num !== '0' || data.cite_num !== '') {
	// 			title_arr.push(data.id + '_search_' + data.title + '.png');
	// 		}
	// 	}
	// 	if (title_arr.length) {
	// 		electron.ipcRenderer.send('valid_title', title_arr);
	// 	}
	// }
}

var app = new App();
app.get_sid();
app.message_handler();

document.addEventListener('click', (e) => {
	if( e.target.tagName.toLowerCase() === 'button' ) {
		let action = e.target.innerText;
		if( action === "开始统计" ) {
			if( app.input_valid_check() ) {
				app.render();
				app.start();
			}
		} else if( action === "重新启动" ) {
			app.restart();
		}
	}
})