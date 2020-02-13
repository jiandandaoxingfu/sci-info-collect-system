class Spider {
	get_sid() {
		console.log('获取sid' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		let sid = window.location.href.match(/&SID=(.*?)&/);
		if( sid ) {
			this.sid = sid[1];
			message.send('sid', {info: true});
		} else {
			message.send('sid', {info: false});
		}
	}

	start() {
		message.on('init-data', init_data => {
			this.init(init_data);
			this.save_spider();
			let n = Math.min(this.threads, this.title_arr.length);
			for(let i=0; i<n; i++) {
				this.crawl(i);
			}
		})
	}

	save_spider() {
		message.send('save-spider', {spider: this});
		console.log('正在保存spider' + new Date().getMinutes() + ':' + new Date().getSeconds() );
	}

	init(data) {
		let n = data.title_arr.length;
		this.is_start = true;
		
		this.qid_arr = [];
		this.refid_arr = [];
		this.title_arr = data.title_arr;
		this.author_arr = data.author_arr;
		this.journal_arr = new Array(n).join(',').split(',');
		
		this.search_datas = new Array(n).join(',').split(',');
		this.cite_refine_datas = new Array(n).join(',').split(',');
		this.detail_tables = new Array(n).join(',').split(',');
		this.journal_tables = new Array(n).join(',').split(',');

		this.search_states = new Array(n).join(',').split(',').map( e => [0, 0, 0, 0, 0] ); // search, cite-refine, detail，journal: -1/0/1/2， error/undo/doing/done; is-done: 0/1，undo/done;
		this.cite_num_arr = new Array(n).join(',').split(',').map( e => [0, 0] );
		
		this.search_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/WOS_GeneralSearch.do?fieldCount=1&action=search&product=WOS&search_mode=GeneralSearch&SID=${this.sid}&max_field_count=25&max_field_notice=%E6%B3%A8%E6%84%8F%3A+%E6%97%A0%E6%B3%95%E6%B7%BB%E5%8A%A0%E5%8F%A6%E4%B8%80%E5%AD%97%E6%AE%B5%E3%80%82&input_invalid_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E8%AF%B7%E8%BE%93%E5%85%A5%E6%A3%80%E7%B4%A2%E8%AF%8D%E3%80%82&exp_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E4%B8%93%E5%88%A9%E6%A3%80%E7%B4%A2%E8%AF%8D%E5%8F%AF%E4%BB%A5%E5%9C%A8%E5%A4%9A%E4%B8%AA%E5%AE%B6%E6%97%8F%E4%B8%AD%E6%89%BE%E5%88%B0+%28&input_invalid_notice_limits=+%3Cbr%2F%3E%E6%B3%A8%E6%84%8F%3A+%E6%BB%9A%E5%8A%A8%E6%A1%86%E4%B8%AD%E6%98%BE%E7%A4%BA%E7%9A%84%E5%AD%97%E6%AE%B5%E5%BF%85%E9%A1%BB%E8%87%B3%E5%B0%91%E4%B8%8E%E4%B8%80%E4%B8%AA%E5%85%B6%E4%BB%96%E6%A3%80%E7%B4%A2%E5%AD%97%E6%AE%B5%E7%9B%B8%E7%BB%84%E9%85%8D%E3%80%82&sa_params=WOS%7C%7C7AVrjhmEcJpyJsy2QBT%7Chttp%3A%2F%2Fapps.webofknowledge.com%7C%27&formUpdated=true&value%28input1%29=_title_&value%28select1%29=TI&value%28hidInput1%29=&limitStatus=collapsed&ss_lemmatization=On&ss_spellchecking=Suggest&SinceLastVisit_UTC=&SinceLastVisit_DATE=&period=Range+Selection&range=ALL&startYear=1985&endYear=2020&editions=SCI&editions=SSCI&editions=AHCI&editions=ISTP&editions=ESCI&editions=CCR&editions=IC&update_back2search_link_param=yes&ssStatus=display%3Anone&ss_showsuggestions=ON&ss_numDefaultGeneralSearchFields=1&ss_query_language=&rs_sort_by=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A`; // sid, title
		this.cite_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com+CitingArticles.do?product=WOS&SID=${this.sid}&search_mode=CitingArticles&parentProduct=WOS&parentQid=_qid_&parentDoc=1&REFID=_refid_&logEventUT=WOS:000340351500004&excludeEventConfig=ExcludeIfFromNonInterProduct&cacheurlFromRightClick=no`; // sid, qid, refid,
		this.detail_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/OutboundService.do?action=go&displayCitedRefs=true&displayTimesCited=true&displayUsageInfo=true&viewType=summary&product=WOS&mark_id=WOS&colName=WOS&search_mode=GeneralSearch&locale=zh_CN&view_name=WOS-summary&sortBy=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A&mode=outputService&qid=_qid_&SID=${this.sid}&format=formatForPrint&filters=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&selectedIds=1&mark_to=1&mark_from=1&queryNatural=_title_&count_new_items_marked=0&MaxDataSetLimit=&use_two_ets=false&DataSetsRemaining=&IsAtMaxLimit=&IncitesEntitled=yes&value(record_select_type)=pagerecords&markFrom=1&markTo=1&fields_selection=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&&&totalMarked=1`; // qid, sid, title
		
		this.threads = data.threads;
		this.interval = null;

		message.on('cite-info', msg => {
			if( msg.info !== 'has-2018-cite' ) {
				this.search_states[msg.id][4] = 1;
				if( msg.info === 'cite-page-error' ) {
					this.search_states[msg.id][1] = -1;
				} else {
					this.search_states[msg.id][1] = 2;
				}
				message.send('single-done', {id: msg.id});
			} else {
				this.search_states[msg.id][1] = 1;
				this.get_detail_data(msg.id);
				this.search_states[msg.id][3] = 1;
				message.send('get-journal-data', {id: msg.id, journal: this.journal_arr[msg.id]});
			}
		})

		message.on('journal-data', msg => {
			console.log(msg.id + 1 + ' : ' + '已保存分区数据' + new Date().getMinutes() + ':' + new Date().getSeconds() );
			if( data !== '' ) {
				this.search_states[msg.id][3] = 2;
				this.journal_tables[msg.id] = msg.data;
			} else {
				this.search_states[msg.id][3] = -1;
			}

			if( !this.search_states[msg.id].includes(1) ) { // 这个标题完成了
				this.search_states[msg.id][4] = 1;
				message.send('single-done', {id: msg.id});
			}
		})

		message.on('cite-refine-info', msg => {
			this.search_states[msg.id][1] = 2;
			this.cite_refine_datas[msg.id] = msg.data;
			this.cite_num_arr[msg.id] = msg.cite_num;
			console.log(msg.id + 1 + ' : ' + '已保存引用数据' + new Date().getMinutes() + ':' + new Date().getSeconds() );
			if( !this.search_states[msg.id].includes(1) ) { // 这个标题完成了
				this.search_states[msg.id][4] = 1;
				message.send('single-done', {id: msg.id});
			}
		})

		message.on('error', msg => { 
			// 一般是引用页面发生错误
			this.search_states[msg.id][1] = -1;
			this.search_states[msg.id][4] = 1;
			message.send('single-done', {id: msg.id});
		});

		message.on('next', msg => {
			this.next();
		})

		this.interval = setInterval(() => {
			if( this.is_start ) {
				message.send('search_states', {search_states: this.search_states, cite_num: this.cite_num_arr});
			}
		}, 3000);

		console.log('已初始化' + new Date().getMinutes() + ':' + new Date().getSeconds() );
	}

	get_search_data(id) {
		console.log(id + 1 + ' : ' + '正在搜索' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		this.search_states[id][0] = 1;
		let search_url = this.search_url.replace('_title_', this.title_arr[id]);
		return axios.get(search_url).then( res => {
			let records = res.data.match(/id="RECORD_\d+"/g);
			let info = '';
			if( records ) {
				if( records.length === 1 ) {
					info = 'success';
					this.search_states[id][0] = 2;
					let data = res.data.replace(/(\r\n|\r|\n)/g, '').match(/<div class="search-results">.*?name="LinksAreAllowedRightClick" value="CitedPatent\.do"/)[0];
					this.journal_arr[id] = data.match(/<value>(.*?)<\/value>/)[1];
					this.search_datas[id] = this.data_format(data);
					this.qid_arr[id] = res.data.match(/qid=(\d+)/)[1];
					if( !res.data.includes('<a class="snowplow-times-cited-link"') ) { // 0引用
						info = 'success & no cite';
						this.search_states[id][1] = 2;
					} else {
						this.refid_arr[id] = res.data.match(/REFID=(\d+)/)[1];   // 此参数应该是参考文献列表查询id，因此0引用，没有此参数。
					}
				} else {
					info = 'not unique';
					this.search_states[id][0] = -1;
				}
			} else {
				info = 'not found';
				this.search_states[id][0] = -1;
			}

			if( info !== 'success' ) {
				this.search_states[id][4] = 1;
				message.send('single-done', {id: id});
			}

			console.log( `${id + 1} :${info}` + new Date().getMinutes() + ':' + new Date().getSeconds() );
		})
	}

	open_cite_page(id) {
		console.log(id + 1 + ' : ' + '发送打开引用窗口' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		let cite_url = this.cite_url.replace('_qid_', this.qid_arr[id])
			.replace('_refid_', this.refid_arr[id]);
		message.send('open-cite-page', {url: cite_url, id: id})
	}

	get_detail_data(id) {
		console.log(id + 1 + ' : ' + '抓取详情页' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		this.search_states[id][2] = 1;
		let detail_url = this.detail_url.replace('_qid_', this.qid_arr[id])
			.replace('_title_', this.title_arr[id]);
		return axios.get(detail_url).then( res => {
			if( true ) { // 判断是否成功。
				this.search_states[id][2] = 2;
				this.detail_tables[id] = this.table_format(res.data);
			} else {
				this.search_states[id][2] = -1;
			}
			if( !this.search_states[id].includes(1) ) { // 这个标题完成了
				message.send('single-done', {id: id});
			}
		})
	}

	data_format(data) {
		let body = document.createElement('div');
		body.innerHTML = data;
		data = body.querySelector('.search-results');
		data.style.padding = '25px';
		for(let e of body.getElementsByClassName("nodisplay") ) { e.parentElement.removeChild(e) }
		[	body.querySelectorAll('*[style="display: none"]'),
			body.querySelectorAll('script'),
			body.querySelectorAll('*[type="hidden"]'),
			body.querySelectorAll('*[style="display: none;"]'),
			body.querySelectorAll('.search-results-checkbox'),
			body.querySelectorAll('.alum'),
			body.querySelectorAll('span.smallV110')
		].filter( e => e.length > 0 )
	 	.forEach( eles => eles.forEach( e => e.parentElement.removeChild(e) ) );

		body.querySelectorAll('.search-results-content').forEach( e => {
		 	[1, 2, 3, 4, 5].forEach( () => {
		 		if( e.children[3])
		 			e.removeChild(e.children[3])
		 	});
		})	

		body.querySelectorAll('.search-results-data-icon').forEach( e => {
			e.previousSibling.innerHTML += '<br><span class="high-cite">高被引</span>';
			e.parentElement.removeChild(e);
		})
		body.querySelectorAll('a.smallV110').forEach( e => e.innerHTML = e.innerText );
		body.querySelectorAll('.search-results-number').forEach( e => e.innerHTML = e.innerText );
		['href', 'url', 'onclick', 'alt', 'title', 'oncontextmenu', 'hasautosubmit', 'name'].forEach( attr => {
			body.querySelectorAll(`*[${attr}]`).forEach( e => e.removeAttribute(attr) );
		})
		return body.innerHTML;
	}

	table_format(data) {
		let body = document.createElement('div');
		body.innerHTML = data;
		data = body.querySelectorAll('table');
		if( data[2] ) {
			body.innerHTML = '';
			body.appendChild(data[2]);
			data[2].style.margin = '50px';
			body.setAttribute('class', 'printWhitePage');
			return body.innerHTML;
		}
	}

	crawl(id) {
		console.log(`${id + 1} : 个开始运行` + new Date().getMinutes() + ':' + new Date().getSeconds() );
		this.get_search_data(id).then( () => {
			if( this.search_states[id][0] == 2 && this.search_states[id][4] == 0 ) {
				this.open_cite_page(id);
			}
		})
	}

	next() {
		let n = this.search_states.length;
		let finished_num = 0;
		for(let i=0; i<n; i++) {
			if( this.search_states[i][0] === 0 ) {
				this.crawl(i);
				return
			} else if( this.search_states[i][4] === 1 ) {
				finished_num += 1;
			}
		}
		
		if( finished_num === n ) {
			this.done();
		}
	}

	done() {
		message.send('done', {search_states: this.search_states, cite_num: this.cite_num_arr});
		window.clearInterval(this.interval);
		let body = document.querySelector('body');
		body.innerHTML = '';
		this.is_start = false;
		this.search_states.forEach( (state, i) => {
			body.innerHTML += `<h2>${i + 1} ： ${this.title_arr[i]}</h2>`;
			if( state[0] === 2 ) {
				body.innerHTML += this.search_datas[i];
				if( state[1] === 2 ) {
					body.innerHTML += `<div class="cite_num_">自引：${this.cite_num_arr[i][1]}，&nbsp;&nbsp;&nbsp; 被引：${this.cite_num_arr[i][0]}</div>`;
				}
				if( state[3] === 2 ) {
					body.innerHTML += this.journal_tables[i];
				} else if( state[3] === -1 ) {
					body.innerHTML += '<div class="error">获取期刊分区出错了。</div>';
				}
				body.innerHTML += '<div style="page-break-after: always;"></div>';
			} else {
				body.innerHTML += '<div class="error">搜索出错了。</div>';
			}
		})

		this.search_states.forEach( (state, i) => {
			if( state[1] === 2 ) {
				let cite_num = this.cite_num_arr[i][0] + this.cite_num_arr[i][1];
				if( cite_num > 0 ) {
					body.innerHTML += `<h3>${i + 1} ： ${this.title_arr[i]}</h3>`;				
					body.innerHTML += `<div class="cite_num_">总引用量：${ cite_num }</div>`;
					body.innerHTML += this.cite_refine_datas[i];
					body.innerHTML += '<div style="page-break-after: always;"></div>';
				}
			} else if( state[1] === -1 ){
				body.innerHTML += '<div class="error">获取引用数据出错了。</div>';
			}
			if( state[2] === 2 ) {
				body.innerHTML += this.detail_tables[i];
				body.innerHTML += '<div style="page-break-after: always;"></div>';
			} else if( state[2] === -1 ) {
				body.innerHTML += '<div class="error">获取详情页数据出错了。</div>';
			}
		})

		body.querySelectorAll('span.label').forEach( e => e.setAttribute('class', '') );
		window.stop();
		console.log('done');
		console.log(this);
		setTimeout(() => {
			alert('已经搜索完成，打印该页面即可。');
		}, 6200);
	}
}

message.send('is-start', {});
message.on('is-start', () => {
	var url = window.location.href;
	var spider = new Spider();
	
	spider.get_sid();
	spider.start();
	
	document.addEventListener('DOMContentLoaded', (e) => {
		document.body.innerHTML = '<br><br><div style="font-size: 40px; width: 100%; text-align: center;">正在运行中，<span style="color: red;">请勿关闭</span>，其它运行中的窗口也不要关闭。<br>任务完成后，数据会显示在该页面，打印或导出为pdf即可。<br></div><br><br><br><br>';
	})
})