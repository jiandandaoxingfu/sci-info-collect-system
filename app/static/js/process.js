class App {
	constructor() {
		this.is_start = false;
		this.data = [];
	}

	render() {
		if (this.is_start) {
			alert('请重新启动或者等待任务完成');
			return;
		}
		let title_arr = document.getElementById('title').value.replace(/，/g, ',').split(',').map(d => d.replace(/(^\s*)/, ''));
		let author = document.getElementById('author').value;
		let year = document.getElementById('year').value.replace(/，/g, ',').replace(/\s/g, '').split(',');
		if (title_arr[0] === "" || author === '' || year[0] === "") {
			alert('请输入标题， 年份， 作者');
			return;
		}
		this.title_arr = title_arr;
		this.author = author;
		this.year = year;
		this.data.push({
			key: id + 1,
			id: id + 1,
			title: title,
			search_result: '',
			cite_num: '',
			cite_page_printed: '',
			detail_page_printed: '',
			progress_status: [0, "normal"],
		})
	}

	start() {
		this.is_start = true;
		chrome.tabs.create({
			url: `https://www.baidu.com/?s=${this.title_arr[0]}, ${this.year}, ${this.author}`
		}, (tab) => {
			console.log(tab.id);
		})
	}

	restart() {
		
	}

	update_and_load(data, message) {
		this.setState({
			data: data
		}, () => {
			let title_arr = this.state.title_arr;
			let last_progress_status = this.state.data[this.state.data.length - 1].progress_status;
			if (last_progress_status[1] !== 'normal' || last_progress_status[0] === 100) {
				setTimeout(() => {
					this.state.has_send_title = false;
					this.valid_title();
				}, 600);
			} else if (!message.match(/\d/)) {
				this.setState({
					current_id: this.state.current_id + 1
				}, () => {
					electron.ipcRenderer.send('search_title_2_main', {
						title: title_arr[this.state.current_id],
						id: this.state.current_id + 1,
					});
				})
			}
		});
	}

	message_handle() {
		if (this.state.has_listen_message) return;
		this.state.has_listen_message = true;
		electron.ipcRenderer.on('search_page_status', (event, message) => {
			let data = [...this.state.data];
			if (message === 'mutil') {
				data[this.state.current_id].search_result = '标题不精确';
				data[this.state.current_id].progress_status = [25, 'exception'];
			} else if (message === 'no_cite') {
				data[this.state.current_id].search_result = '引用量为0';
				data[this.state.current_id].cite_num = 0;
				data[this.state.current_id].progress_status = [100, 'success '];
			} else if (message === 'no_found') {
				data[this.state.current_id].search_result = '没有找到';
				data[this.state.current_id].progress_status = [25, 'exception'];
			} else {
				data[this.state.current_id].search_result = '已截图';
				data[this.state.current_id].progress_status = [25, 'normal'];
			}
			this.update_and_load(data, message);
		})

		electron.ipcRenderer.on('cite_page_status', (event, message) => {
			let data = [...this.state.data];
			if (message === 'no_cite') {
				data[this.state.current_id].cite_num = '0';
				data[this.state.current_id].progress_status = [100, 'success '];
			} else {
				data[this.state.current_id].cite_num = message;
				data[this.state.current_id].progress_status = [50, 'normal'];
			}
			this.update_and_load(data, message);
		})

		electron.ipcRenderer.on('cite_num', (event, message) => {
			let data = [...this.state.data];
			data[this.state.current_id].self_cite_num = message.self_cite_num;
			data[this.state.current_id].other_cite_num = message.other_cite_num;
			console.log(message);
			this.update_and_load(data, '1');
		})

		electron.ipcRenderer.on('print', (event, message) => {
			let data = [...this.state.data];
			if (message === 'cite_page_printed') {
				data[this.state.current_id].cite_page_printed = '已打印';
				data[this.state.current_id].progress_status = [75, 'normal']
				this.update_and_load(data, '1');
			} else if (message === 'detail_page_printed') {
				data[this.state.current_id].detail_page_printed = '已打印';
				data[this.state.current_id].progress_status = [100, 'success ']
				this.update_and_load(data, '');
			} else {
				alert('统计完成');
			}
		})
	}

	valid_title() {
		let title_arr = [];
		for (let data of this.state.data) {
			if (data.cite_num !== '0' || data.cite_num !== '') {
				title_arr.push(data.id + '_search_' + data.title + '.png');
			}
		}
		if (title_arr.length) {
			electron.ipcRenderer.send('valid_title', title_arr);
		}
	}
}

var app = new App();

document.addEventListener('keyup', (e) => {
	if( e.target.tagName.toLowerCase() === 'button' ) {
		let action = e.target.innerHTML;
		if( action === "开始统计" ) {
			app.render();
			app.start();
		} else if( action === "重新启动" ) {
			app.restart();
		}
	}
})