class App {
	constructor() {
		this.is_start = false;

		this.cite_tabs_id = [];
		this.spider_tab_id = 0;
		this.journal_tab_id = 0;
		this.windowId = 0;
		this.spider = null;

		this.journal_info_url = `https://vpn2.zzu.edu.cn/Core/,DanaInfo=www.fenqubiao.com+JournalDetail.aspx?y=2019&t=_journal_`;

		this.title_arr = [];
		this.author_arr = '';
		this.year = '';
		this.threads = 3;
		this.table_header = ['#', '标题', '检索页', '引用页', '引用量', '他引量', '自引量', '详情页', '期刊分区页', '作者顺序', '进度'];
		this.header_en = {'#': 'num', '标题': 'title', '检索页': 'search', '引用页': 'cite-refine', '引用量': 'cite-num', '他引量': 'other-cite-num', 
			'自引量': 'self-cite-num', '详情页': 'detail', '期刊分区页': 'journal', '作者顺序': 'order', '进度': 'process'};
	}

	input_valid_check() {
		let title_arr = document.getElementById('title').value.replace(/(\r\n|\r|\n)/g, ' ').split('&&').map(d => d.replace(/(^\s*)/, ''));
		let author = document.getElementById('author').value;
		let threads = parseInt(document.getElementById('threads').value);
		let year = document.getElementById('year').value.replace(/，/g, ',').replace(/\s/g, '').split(',');
		if (title_arr[0] === "" || !this.name_format(author) || year[0] === "") {
			alert('请输入标题， 年份， 作者');
			return false;
		} else {
			this.title_arr = title_arr;
			this.year = year;
			this.threads = threads;
			this.cite_tabs_id = new Array(title_arr.length).join(',').split(',');
			this.create_table();
			return true;
		}
	}

	create_table() {
		let container = document.getElementById('container');
		container.innerHTML = 
			`<table class="table">
  				<thead>
    				<tr>
      					${(() => { 
      						let tr = ''; 
      						this.table_header.forEach( h => {
      							tr += `<th scope="col">${h}</th>`;
      						})
      						return tr;
      					})()}
    				</tr>
  				</thead>
  				<tbody>
  					${(() => {
  						let tbody = '';
  						this.title_arr.forEach( (t, id) => {
  							let tr = '<tr>';
  							this.table_header.forEach( (h, i) => {
  								if( i == 0 ) {
  									tr += `<td id="${this.header_en[h]}-${id}">${id + 1}</td>`;
  								} else if( i == 1 ) {
  									tr += `<td id="${this.header_en[h]}-${id}" title="${t}">${t.slice(0, 30)}... </td>`;
  								} else {
  									tr += `<td id="${this.header_en[h]}-${id}"></td>`;
  								}
  							})
  							tbody += (tr + '</tr>');
  						})
  						return tbody;
  					})()}
  				</tbody>
			</table>`
	}

	name_format(s) {
		let s2 = s.split('-');
		for(let s of s2) {
			if( !s.match(/[a-zA-Z]+/) || s.match(/[a-zA-Z]+/)[0] !== s ) {
				alert('请检查姓名是否符合要求');
				return false;
			}
		}
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

	update_render(data) {
		data.search_states.forEach((state, id) => {
			let state_key = ['search', 'cite-refine', 'detail', 'journal', 'process'];
			state.forEach( (s, i) => {
				if( i !== 1 && i !== 4 ) {
					if( s === 1 || s === -1 ) {
						let info = s == 1 ? '<span style="color: #ffd200;">进行中</span>' : '<span style="color: red">出错</span>';
						document.getElementById(state_key[i] + '-' + id).innerHTML = info;
					} else if( s === 2 ) {
						document.getElementById(state_key[i] + '-' + id).innerHTML = '<span style="color: blue;">完成</span>';
					}
				} else if( i === 1) {
					if( s === 1 || s === -1 ) {
						let info = s == 1 ? '<span style="color: #ffd200;">进行中</span>' : '<span style="color: red">出错</span>';
						document.getElementById('cite-refine-' + id).innerHTML = info;
					} else if( s === 2 ) {
						document.getElementById('cite-refine-' + id).innerHTML = '<span style="color: blue;">完成</span>';
						document.getElementById('cite-num-' + id).innerHTML = data.cite_num[id][0] + data.cite_num[id][1];
						document.getElementById('other-cite-num-' + id).innerHTML = data.cite_num[id][0];
						document.getElementById('self-cite-num-' + id).innerHTML = data.cite_num[id][1];
					}
				} else {
					if( s === 1 ) {
						document.getElementById(state_key[i] + '-' + id).innerHTML = '<span style="color: blue;">完成</span>';
					}
				}
			})
		})
	}

	get_journal_data(msg) { 
		console.log(msg.id + 1 + ' : ' + '正在获取期刊分区数据' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		let journal_info_url = this.journal_info_url.replace('_journal_', msg.journal);
		axios.get(journal_info_url).then( res => {
			if( true ) { // 判断是否成功。
				let data = this.table_format(res.data);
				message.send(this.spider_tab_id, 'journal-data', {id: msg.id, data: data});
			} else {
				message.send(this.spider_tab_id, 'journal-data', {id: msg.id, data: ''});
			}
		})
	}

	table_format(data) {
		let body = document.createElement('div');
		body.innerHTML = data;
		data = body.querySelectorAll('table');
		if( data[2] ) {
			body.innerHTML = '';
			body.appendChild(data[2]);
			data[2].style.padding = '25px';
			body.setAttribute('class', 'printWhitePage');
			return body.innerHTML;
		}
	}

	start() {
		this.is_start = true;
		chrome.tabs.create({
			active: false,
			url: 'https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com'
		}, tab => {
			this.spider_tab_id = tab.id;
			this.windowId = tab.windowId;
		})

		chrome.tabs.create({
			url: 'https://vpn2.zzu.edu.cn/,DanaInfo=www.fenqubiao.com+'
		}, tab => {
			this.journal_tab_id = tab.id;
		})
	}

	done() {
		this.is_start = false;
		this.cite_tabs_id = [];
		setTimeout(() => {
			chrome.tabs.update(this.spider_tab_id, {active: true});
		}, 3000);
	}

	restart() {
		this.cite_tabs_id.forEach( id => {
			if( id  !== '' ) {
				chrome.tabs.remove(id);
			}
		})
		chrome.tabs.query({windowId: this.windowId}, (tabs) => {
			for(let tab of tabs) {
				if( tab.id == this.spider_tab_id ) {
					chrome.tabs.remove(this.spider_tab_id);
				}
			}
		})		
		window.open(window.location.href, '_self');
	}

	message_handler() {
		message.on('is-start', (msg, tabid) => {
			let is_related_tabid = tabid == this.spider_tab_id ||
											this.cite_tabs_id.indexOf(tabid) > -1;
			if(this.is_start && is_related_tabid) {
				message.send(tabid, 'is-start', {info: ''});
			}
		})

		message.on('sid', (msg, tabid) => {
			if( !msg.info ) {
				alert('无法获取web of science权限，请检查是否具有使用其权限。一般而言要使用校园网');
			} else {
				message.send(tabid, 'init-data', {title_arr: this.title_arr, author_arr: this.author_arr, threads: this.threads});
			}
		})

		message.on('search_states', msg => {
			this.update_render(msg);
		})

		message.on('open-cite-page', msg => {
			if( !this.is_start ) return;
			chrome.tabs.create({
				active: false,
				url: msg.url
			}, (tab) => {
				this.cite_tabs_id[msg.id] = tab.id;
			})
		})

		message.on('cite-info', (msg, tabid) => {
			console.log( this.cite_tabs_id.indexOf(tabid) + 1 + ' : ' + msg.info + new Date().getMinutes() + ':' + new Date().getSeconds() );
			message.send(this.spider_tab_id, 'cite-info', {id: this.cite_tabs_id.indexOf(tabid), info: msg.info});
		});

		message.on('get-journal-data', msg => {
			this.get_journal_data(msg);
		});

		message.on('author-arr', (msg, tabid) => {
			message.send(tabid, 'author-arr', {author_arr: this.author_arr});
		});

		message.on('cite-refine-info', (msg, tabid) => {
			message.send(this.spider_tab_id, 'cite-refine-info', {id: this.cite_tabs_id.indexOf(tabid), data: msg.data, info: msg.info});
		});

		message.on('error', (msg, tabid) => {
			if( msg.info === 'server') {
				console.log(this.cite_tabs_id.indexOf(tabid) + 1 + '：' + '服务器出错');
			} else {
				console.log(this.cite_tabs_id.indexOf(tabid) + 1 + '：' + '未知错误：' + msg.url);
			}
			message.send(this.spider_tab_id, 'error', {id: this.cite_tabs_id.indexOf(tabid)});
		});

		message.on('single-done', msg => {
			let tabid = this.cite_tabs_id[msg.id];
			if( tabid !== '' ) chrome.tabs.remove(tabid);
			this.cite_tabs_id[msg.id] = '';
			console.log(`${msg.id + 1}：完成` + new Date().getMinutes() + ':' + new Date().getSeconds() );
			message.send(this.spider_tab_id, 'next', {});
		})

		message.on('done', msg => {
			this.update_render(msg);
			console.log( `完成了` + new Date().getMinutes() + ':' + new Date().getSeconds() );
			this.done();
		})
	}
}

var app = new App();
app.message_handler();
app.create_table();

document.addEventListener('click', (e) => {
	if( e.target.tagName.toLowerCase() === 'button' ) {
		let action = e.target.innerText;
		if( action === "开始统计" ) {
			if( app.is_start ) {
				alert('请重新启动或者等待任务完成');
				return;
			}
			if( app.input_valid_check() ) {
				app.start();
			}
		} else if( action === "重新启动" ) {
			app.restart();
		}
	}
})