class Spider {
	get_sid() {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '获取sid')
		let sid = window.location.href.match(/&SID=(.*?)&/);
		if( sid ) {
			this.sid = sid[1];
			message.send('sid', {info: true});
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '成功获取sid')
		} else {
			message.send('sid', {info: false});
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '无法获取sid')
		}
	}

	get_title_arr() {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '正在监听title arr');
		message.on('title-arr', msg => {
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '已获取title arr');
			this.init(msg);
			this.save_spider();
			this.run(0);
			this.run(1);
			this.run(2);
		})
	}

	save_spider() {
		// 信息传递无法传函数，因此，我们将函数字符化而作为属性
		spider.get_cite_data_ = spider.get_cite_data.toString();
		spider.get_cite_refine_data_ = spider.get_cite_refine_data.toString();
		spider.data_format_ = spider.data_format.toString();
		spider.get_cite_num_ = spider.get_cite_num.toString();
		message.send('save-spider', {spider: this});
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '正在保存spider');
	}

	init(msg) {
		let n = msg.title_arr.length;
		this.qid_arr = [];
		this.refid_arr = [];
		this.title_arr = msg.title_arr;
		this.author_arr = msg.author_arr;
		this.search_datas = new Array(n).join(',').split(',');
		this.cite_refine_datas = new Array(n).join(',').split(',');
		this.detail_tables = new Array(n).join(',').split(',');
		this.search_states = new Array(n).join(',').split(',').map( e => [0, 0, 0] ); // search, cite-refine, detail.　0/1/2: undo/do/done.
		this.cite_num_arr = new Array(n).join(',').split(',').map( e => [0, 0] );
		this.search_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/WOS_GeneralSearch.do?fieldCount=1&action=search&product=WOS&search_mode=GeneralSearch&SID=${this.sid}&max_field_count=25&max_field_notice=%E6%B3%A8%E6%84%8F%3A+%E6%97%A0%E6%B3%95%E6%B7%BB%E5%8A%A0%E5%8F%A6%E4%B8%80%E5%AD%97%E6%AE%B5%E3%80%82&input_invalid_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E8%AF%B7%E8%BE%93%E5%85%A5%E6%A3%80%E7%B4%A2%E8%AF%8D%E3%80%82&exp_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E4%B8%93%E5%88%A9%E6%A3%80%E7%B4%A2%E8%AF%8D%E5%8F%AF%E4%BB%A5%E5%9C%A8%E5%A4%9A%E4%B8%AA%E5%AE%B6%E6%97%8F%E4%B8%AD%E6%89%BE%E5%88%B0+%28&input_invalid_notice_limits=+%3Cbr%2F%3E%E6%B3%A8%E6%84%8F%3A+%E6%BB%9A%E5%8A%A8%E6%A1%86%E4%B8%AD%E6%98%BE%E7%A4%BA%E7%9A%84%E5%AD%97%E6%AE%B5%E5%BF%85%E9%A1%BB%E8%87%B3%E5%B0%91%E4%B8%8E%E4%B8%80%E4%B8%AA%E5%85%B6%E4%BB%96%E6%A3%80%E7%B4%A2%E5%AD%97%E6%AE%B5%E7%9B%B8%E7%BB%84%E9%85%8D%E3%80%82&sa_params=WOS%7C%7C7AVrjhmEcJpyJsy2QBT%7Chttp%3A%2F%2Fapps.webofknowledge.com%7C%27&formUpdated=true&value%28input1%29=_title_&value%28select1%29=TI&value%28hidInput1%29=&limitStatus=collapsed&ss_lemmatization=On&ss_spellchecking=Suggest&SinceLastVisit_UTC=&SinceLastVisit_DATE=&period=Range+Selection&range=ALL&startYear=1985&endYear=2020&editions=SCI&editions=SSCI&editions=AHCI&editions=ISTP&editions=ESCI&editions=CCR&editions=IC&update_back2search_link_param=yes&ssStatus=display%3Anone&ss_showsuggestions=ON&ss_numDefaultGeneralSearchFields=1&ss_query_language=&rs_sort_by=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A`; // sid, title
		this.cite_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com+CitingArticles.do?product=WOS&SID=${this.sid}&search_mode=CitingArticles&parentProduct=WOS&parentQid=_qid_&parentDoc=1&REFID=_refid_&logEventUT=WOS:000340351500004&excludeEventConfig=ExcludeIfFromNonInterProduct&cacheurlFromRightClick=no`; // sid, qid, refid,
		this.detail_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/OutboundService.do?action=go&displayCitedRefs=true&displayTimesCited=true&displayUsageInfo=true&viewType=summary&product=WOS&mark_id=WOS&colName=WOS&search_mode=GeneralSearch&locale=zh_CN&view_name=WOS-summary&sortBy=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A&mode=outputService&qid=_qid_&SID=${this.sid}&format=formatForPrint&filters=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&selectedIds=1&mark_to=1&mark_from=1&queryNatural=_title_&count_new_items_marked=0&MaxDataSetLimit=&use_two_ets=false&DataSetsRemaining=&IsAtMaxLimit=&IncitesEntitled=yes&value(record_select_type)=pagerecords&markFrom=1&markTo=1&fields_selection=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&&&totalMarked=1`; // qid, sid, title

		message.on('get-detail-data', msg => {
			this.get_detail_data(msg.id);
		})

		message.on('get-cite-refine-data', msg => {
			this.cite_refine_datas[msg.id] = msg.data.data;
			this.cite_num_arr[msg.id] = msg.data.cite_num;
			this.search_states[msg.id][1] = 2;
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + ' 已保存refine data');

			if(Math.min(...this.search_states[msg.id]) === 2) { // 这个标题完成了
				message.send('single-done', {id: msg.id});
				this.next();
			}
		})
		
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '已初始化');
	}

	get_search_data(id) {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '正在搜索');
		this.search_states[id][0] = 1;
		this.search_url = this.search_url.replace('_title_', this.title_arr[id]);
		return axios.get(this.search_url).then( res => {
			let data = res.data.replace(/(\r\n|\r|\n)/g, '').match(/<div class="search-results">.*?name="LinksAreAllowedRightClick" value="CitedPatent\.do"/)[0];
			this.search_datas[id] = this.data_format(data);
			this.qid_arr[id] = res.data.match(/qid=(\d+)/)[1];
			this.refid_arr[id] = res.data.match(/REFID=(\d+)/)[1];
			this.search_states[id][0] = 2;
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '完成搜索');
		})
	}

	open_cite_page(id) {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '发送打开引用窗口');
		this.search_states[id][1] = 1;
		this.cite_url = this.cite_url.replace('_qid_', this.qid_arr[id])
			.replace('_refid_', this.refid_arr[id]);
		message.send('open-cite-page', {url: this.cite_url, id: id})
	}

	get_cite_data(data) {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '引用页面处理')
		let has_2018 = document.getElementById('PublicationYear_tr').innerHTML.includes('PublicationYear_2018');
		if( has_2018 ) {
			let inputs = document.getElementById('PublicationYear_tr').getElementsByTagName('input');
			for( let input of inputs ) {
				if( input.value.includes("2018") ) {
					message.send('spider-get-detail-data', {info: ''});
					input.click();
					document.getElementById('PublicationYear_tr').querySelector('button[alt="精炼"]').click();
					console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '精炼')
				}
			}
		} else {
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '无2018引用');
			message.send("no-cite-refine-data", {info: true});
		}
	}

	get_detail_data(id) {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '抓取详情页')
		this.search_states[id][2] = 1;
		this.detail_url = this.detail_url.replace('_qid_', this.qid_arr[id])
			.replace('_title_', this.title_arr[id]);
		return axios.get(this.detail_url).then( res => {
			let data = res.data.replace(/(\r\n|\r|\n)/g, '');
			this.detail_tables[id] = this.table_format(data);
			this.search_states[id][2] = 2;
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '已经保存detail data');

			if(Math.min(...this.search_states[id]) === 2) { // 这个标题完成了
				message.send('single-done', {id: id});
				this.next();
			}
		})
	}

	get_cite_refine_data(data) {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '开始处理精炼结果')
		data = data.replace(/(\r\n|\r|\n)/g, '').match(/<div class="search-results">.*?name="LinksAreAllowedRightClick" value="CitedPatent\.do"/)[0]
		data = this.data_format(data);
		data = this.get_cite_num(data);
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '发送refine data');
		message.send('cite-refine-done', {info: true, data: data});
	}

	data_format(data) {
		console.log('数据正在处理');
		let body = document.body;
		body.innerHTML = data;
		data = body.querySelector('.search-results');
		body.innerHTML = '';
		body.appendChild(data);
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
		console.log('数据已处理');
		return body.innerHTML;
	}

	table_format(data) {
		console.log('正在处理表格');
		let body = document.body;
		body.innerHTML = data;
		data = body.querySelectorAll('table')[2];
		body.innerHTML = '';
		body.appendChild(data);
		data.style.padding = '25px';
		body.setAttribute('class', 'printWhitePage');
		console.log('表格处理完成');
		return body.innerHTML;
	}

	get_cite_num(data) {
		console.log('正在处理引用');
		let body = document.body;
		body.innerHTML = data;
		let self_cite_num = 0, other_cite_num = 0;
		document.body.querySelectorAll('.search-results-content').forEach( author_div => {
			let authors = [];
			author_div.children[1].querySelectorAll('a').forEach( a => {
				authors.push( a.innerHTML.replace(/(-|,|\s|\.)/g, '') );
    		})
    		let author_union = new Set([...authors, ...this.author_arr]);
    		if( author_union.size === (authors.length + this.author_arr.length) ) {
    			author_div.nextElementSibling.firstElementChild.innerHTML += `<br><span class='cite-num'>被引</span>`;
				other_cite_num += 1;
    		} else {
    			author_div.nextElementSibling.firstElementChild.innerHTML += `<br><span class='cite-num'>自引</span>`;
				self_cite_num += 1;
    		}
		})
		console.log('完成引用处理');
		return {data: body.innerHTML, cite_num: [other_cite_num, self_cite_num]};
	}

	run(id) {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + `第${id + 1}个开始运行`);
		this.get_search_data(id).then( () => {
			this.open_cite_page(id);
		})
	}

	next() {
		let n = this.search_states.length;
		let finished_num = 0;
		for(let i=0; i<n; i++) {
			if( Math.max(...this.search_states[i]) === 0 ) {
				this.run(i);
				return
			} else if( Math.min(...this.search_states[i]) === 2 ) {
				finished_num += 1;
			}
		}
		
		if( finished_num === n ) {
			message.send('done', {spider: spider});
			this.done();
		}
	}

	done() {
		let body = document.body;
		body.innerHTML = '';
		for(let i=0; i<this.qid_arr.length; i++) {
			body.innerHTML += this.search_datas[i];
			body.innerHTML += this.cite_refine_datas[i];
			body.innerHTML += this.detail_tables[i];
		}
		[...body.children].forEach( child => {
			let page_break = document.createElement('div');
			page_break.setAttribute('style', 'page-break-after: always;');
			body.insertBefore(page_break, child);
		});
		body.removeChild(body.firstElementChild);
		setTimeout( () => {
			window.print();
		}, 1500);
	}
}

var url = window.location.href;
var spider;

message.send('is-start', {info: ''});

message.on('is-start', msg => {
	console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '接收开始命令')
	if( url.includes('UA_GeneralSearch_input.do?') ) {
		spider = new Spider();
		spider.get_sid();
		spider.get_title_arr();
	} else {
		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '不是spider window');
		message.send('get-spider', {info: ''});
		message.on('spider', msg => {
			spider = msg.spider;
			if(!spider) {
				message.send('sid', {info: false});
			} else {
				console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '已经获取spider');
			}
		})
	}

	document.addEventListener("DOMContentLoaded", (e) => {
		if( url.includes('UA_GeneralSearch_input.do?') ) {
			document.body.innerHTML = '';
			document.head.innerHTML = '';
			return;
		}

		console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + 'dom ready');
		if(!spider) {
			console.log(new Date().getMinutes() + ':' + new Date().getSeconds() + '无法获取spider');
			return;
		}

		spider.get_cite_data = eval(spider.get_cite_data_.replace(/^((\w|_)+)(\(.*?\))/, '$1 = $3 => '));
		spider.get_cite_refine_data = eval(spider.get_cite_refine_data_.replace(/^((\w|_)+)(\(.*?\))/, '$1 = $3 => '));
		spider.data_format = eval(spider.data_format_.replace(/^((\w|_)+)(\(.*?\))/, '$1 = $3 => '));
		spider.get_cite_num = eval(spider.get_cite_num_.replace(/^((\w|_)+)(\(.*?\))/, '$1 = $3 => '));
		//	eval执行后，函数中this指向window。
		window.author_arr = spider.author_arr;

		let data = document.body.innerHTML;
		if( url.match(/CitingArticles.do\?.*?search_mode=CitingArticles/) ) {
			window.stop();
			spider.get_cite_data(data);
		} else if( url.match(/Search.do\?.*?search_mode=CitingArticles/) ) {
			window.stop();
			message.send('cite-refine-get-id', {info: ''});
			spider.get_cite_refine_data(data);
		}
	})
})


console.log(new Date().getMinutes() + ':' + new Date().getSeconds());