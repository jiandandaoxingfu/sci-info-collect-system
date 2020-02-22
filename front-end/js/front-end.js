class App {
	constructor() {
		this.is_start = false;
		this.lastest_version = 'v2.0.0';
		this.interval = null;
		this.tic = 0;
		this.toc = 0;

		this.cite_tabs_id = [];
		this.after_end_tab_id = 0;
		this.journal_tab_id = 0;
		this.windowId = 0;
		this.spider = null;

		this.title_arr = [];
		this.author_arr = [];
		this.year_arr = [];
		this.threads = 3;
		this.table_header = ['#', '标题', '检索页', '引用页', '引用量', '他引量', '自引量', '详情页', '期刊分区页', '作者顺序', '进度'];
		this.header_en = {'#': 'num', '标题': 'title', '检索页': 'search', '引用页': 'cite-refine', '引用量': 'cite-num', '他引量': 'other-cite-num', 
			'自引量': 'self-cite-num', '详情页': 'detail', '期刊分区页': 'journal', '作者顺序': 'order', '进度': 'process'};
	}

	check_update() {
		let release_url = 'https://api.github.com/repos/jiandandaoxingfu/sci-info-collect-system/releases';
		axios.get(release_url).then( (res) => {
			if( res.data[0] ) {
				let tag_name = res.data[0].tag_name;
				if( tag_name !== this.lastest_version ) {
					if( confirm('有最新版本，是否前往下载？') ) {
						window.location.href = 'https://github.com/jiandandaoxingfu/sci-info-collect-system/releases/tag/' + tag_name;
					}
				} else {
					console.log('不需要更新。');
				}
			}
		}).catch( e => {
			console.log( '查询更新失败：' + e );
			setTimeout( () => {
				this.check_update();
			}, 5000);
		} )
	}

	input_valid_check() {
		let title_arr = document.getElementById('title').value.replace(/(\r\n|\r|\n)/g, ' ').split('&&').map(d => d.replace(/(^\s*)/, ''));
		let author = document.getElementById('author').value;
		let threads = parseInt(document.getElementById('threads').value);
		let year_arr = document.getElementById('year').value.replace(/，/g, ',').replace(/\s/g, '').split(',');
		if (title_arr[0] === "" || !this.name_format(author) || year_arr.filter( year => year.match(/^20\d\d$/) ).length == 0 ) {
			alert('请检查标题， 年份， 作者是否符合要求');
			return false;
		} else {
			this.title_arr = title_arr;
			this.year_arr = year_arr.map( y => parseInt(y) );
			this.threads = threads;
			this.cite_tabs_id = new Array(title_arr.length).join(',').split(',');
			this.create_table();
			return true;
		}
	}

	name_format(s) {
		let s2 = s.split('-');
		for(let s of s2) {
			if( !s.match(/[a-zA-Z]+/) || s.match(/[a-zA-Z]+/)[0] !== s ) {
				return false;
			}
		}
		if( s2.length === 3 ) {
			this.author_arr = [s.replace(/-/g, ''), s2[0]+s2[1]+s2[2].toLocaleLowerCase(), s2[1]+s2[2]+s2[0], s2[1]+s2[2].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0]+s2[2][0], s2[0]+s2[1][0]+s2[2][0].toLocaleLowerCase(), s2[1][0]+s2[2][0]+s2[0], s2[1][0]+s2[2][0].toLocaleLowerCase()+ s2[0] ];
		} else if( s2.length === 2 ) {
			this.author_arr = [s.replace(/-/g, ''), s2[0]+s2[1].toLocaleLowerCase(), s2[1]+s2[0], s2[1].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0], s2[0]+s2[1][0].toLocaleLowerCase(), s2[1][0]+s2[0], s2[1][0].toLocaleLowerCase()+ s2[0] ];
		} else {
			return false;
		}
		this.author_arr = Array.from( new Set(this.author_arr) );
		return true;
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

	update_render() {
		this.spider.search_states.forEach((state, id) => {
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
						document.getElementById('cite-num-' + id).innerHTML = this.spider.cite_num_arr[id][0] + this.spider.cite_num_arr[id][1];
						document.getElementById('other-cite-num-' + id).innerHTML = this.spider.cite_num_arr[id][0];
						document.getElementById('self-cite-num-' + id).innerHTML = this.spider.cite_num_arr[id][1];
					}
				} else {
					if( s === 1 ) {
						document.getElementById(state_key[i] + '-' + id).innerHTML = '<span style="color: blue;">完成</span>';
					}
				}
			})
		})
		if( !this.spider.is_start ) {
			this.done();
		}
	}

	open_tab() {
		this.is_start = true;
		chrome.tabs.create({
			active: false,
			url: 'https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com'
		}, tab => {
			this.after_end_tab_id = tab.id;
			this.windowId = tab.windowId;
		})

		chrome.tabs.create({
			url: 'http://www.fenqubiao.com'
		}, tab => {
			this.journal_tab_id = tab.id;
		})
	}

	start() {
		let spider = new Spider();
		spider.init(this.title_arr, this.author_arr, this.year_arr, this.threads, this.sid, this.after_end_tab_id);
		this.spider = spider;
		spider.start();
		this.interval = setInterval( () => {
			this.update_render();
		}, 4000);
	}

	done() {
		this.is_start = false;
		window.clearInterval(this.interval);
		this.cite_tabs_id = [];
		this.toc = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
		setTimeout(() => {
			chrome.tabs.update(this.after_end_tab_id, {active: true});
		}, 1000);
	}

	restart() {
		chrome.tabs.query({windowId: this.windowId}, (tabs) => {
			for(let tab of tabs) {
				if( tab.id == this.after_end_tab_id ) {
					chrome.tabs.remove(this.after_end_tab_id);
				}
			}
		})		
		window.open(window.location.href, '_self');
	}

	message_handler() {
		message.on('is-start', (msg, tabid) => {
			let is_related_tabid = tabid == this.after_end_tab_id ||
											this.journal_tab_id;
			if(this.is_start && is_related_tabid) {
				message.send(tabid, 'is-start', {info: ''});
			}
		})

		message.on('sid', (msg, tabid) => {
			if( !msg.info ) {
				alert('无法获取web of science权限，请检查是否具有使用其权限。一般而言要使用校园网');
			} else {
				this.sid = msg.sid;
				this.start();
			}
		})
	}
}

var app = new App();
app.check_update();
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
			app.tic = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
			if( app.input_valid_check() ) {
				app.open_tab();
			}
		} else if( action === "重新启动" ) {
			if( app.is_start ) {
				if( confirm('任务未完成，重启后，结果不会保存，是否确定重启？') ) {
					app.restart();
				}
			}
		} else if( action === '打印表格' ) {
			window.print();
		}
	}
})