class Spider {
	get_sid() {
		let sid = window.location.href.match(/&SID=(.*?)&/);
		if( sid ) {
			window.stop();
			this.sid = sid[1];
			message.send('sid', {info: true});
		} else {
			message.send('sid', {info: false});
		}
	}

	get_title_arr() {
		message.on('title-arr', msg => {
			this.init(msg.title_arr);
			message.send('save-spider', {spider: this});
			this.run();
		})
	}

	init(title_arr) {
		let n = title_arr.length;
		this.qid_arr = [];
		this.refid_arr = [];
		this.title_arr = title_arr;
		this.search_datas = new Array(n).join(',').split(',');
		this.cite_refine_datas = new Array(n).join(',').split(',');
		this.detail_tables = new Array(n).join(',').split(',');
		this.search_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/WOS_GeneralSearch.do?fieldCount=1&action=search&product=WOS&search_mode=GeneralSearch&SID=${this.sid}&max_field_count=25&max_field_notice=%E6%B3%A8%E6%84%8F%3A+%E6%97%A0%E6%B3%95%E6%B7%BB%E5%8A%A0%E5%8F%A6%E4%B8%80%E5%AD%97%E6%AE%B5%E3%80%82&input_invalid_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E8%AF%B7%E8%BE%93%E5%85%A5%E6%A3%80%E7%B4%A2%E8%AF%8D%E3%80%82&exp_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E4%B8%93%E5%88%A9%E6%A3%80%E7%B4%A2%E8%AF%8D%E5%8F%AF%E4%BB%A5%E5%9C%A8%E5%A4%9A%E4%B8%AA%E5%AE%B6%E6%97%8F%E4%B8%AD%E6%89%BE%E5%88%B0+%28&input_invalid_notice_limits=+%3Cbr%2F%3E%E6%B3%A8%E6%84%8F%3A+%E6%BB%9A%E5%8A%A8%E6%A1%86%E4%B8%AD%E6%98%BE%E7%A4%BA%E7%9A%84%E5%AD%97%E6%AE%B5%E5%BF%85%E9%A1%BB%E8%87%B3%E5%B0%91%E4%B8%8E%E4%B8%80%E4%B8%AA%E5%85%B6%E4%BB%96%E6%A3%80%E7%B4%A2%E5%AD%97%E6%AE%B5%E7%9B%B8%E7%BB%84%E9%85%8D%E3%80%82&sa_params=WOS%7C%7C7AVrjhmEcJpyJsy2QBT%7Chttp%3A%2F%2Fapps.webofknowledge.com%7C%27&formUpdated=true&value%28input1%29=_title_&value%28select1%29=TI&value%28hidInput1%29=&limitStatus=collapsed&ss_lemmatization=On&ss_spellchecking=Suggest&SinceLastVisit_UTC=&SinceLastVisit_DATE=&period=Range+Selection&range=ALL&startYear=1985&endYear=2020&editions=SCI&editions=SSCI&editions=AHCI&editions=ISTP&editions=ESCI&editions=CCR&editions=IC&update_back2search_link_param=yes&ssStatus=display%3Anone&ss_showsuggestions=ON&ss_numDefaultGeneralSearchFields=1&ss_query_language=&rs_sort_by=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A`; // sid, title
		this.cite_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com+CitingArticles.do?product=WOS&SID=${this.sid}&search_mode=CitingArticles&parentProduct=WOS&parentQid=_qid_&parentDoc=1&REFID=_refid_&logEventUT=WOS:000340351500004&excludeEventConfig=ExcludeIfFromNonInterProduct&cacheurlFromRightClick=no`; // sid, qid, refid,
		this.detail_url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/OutboundService.do?action=go&displayCitedRefs=true&displayTimesCited=true&displayUsageInfo=true&viewType=summary&product=WOS&mark_id=WOS&colName=WOS&search_mode=GeneralSearch&locale=zh_CN&view_name=WOS-summary&sortBy=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A&mode=outputService&qid=_qid_&SID=${this.sid}&format=formatForPrint&filters=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&selectedIds=1&mark_to=1&mark_from=1&queryNatural=_title_&count_new_items_marked=0&MaxDataSetLimit=&use_two_ets=false&DataSetsRemaining=&IsAtMaxLimit=&IncitesEntitled=yes&value(record_select_type)=pagerecords&markFrom=1&markTo=1&fields_selection=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&&&totalMarked=1`; // qid, sid, title
	}

	get_search_data(id) {
		this.search_url = this.search_url.replace('_title_', this.title_arr[id]);
		return axios.get(this.search_url).then( res => {
			let data = res.data.replace(/(\r\n|\r|\n)/g, '').match(/<div class="search-results">.*?name="LinksAreAllowedRightClick" value="CitedPatent\.do"/)[0]
			this.search_datas[id] = this.data_format(data);
			this.qid_arr[id] = res.data.match(/qid=(\d+)/)[1];
			this.refid_arr[id] = res.data.match(/REFID=(\d+)/)[1];
		})
	}

	open_cite_page(id) {
		this.cite_url = this.cite_url.replace('_qid_', this.qid_arr[id])
			.replace('_refid_', this.refid_arr[id]);
		message.send('open-cite-page', {url: this.cite_url, id: id})
	}

	get_cite_data(data) {
		let has_2018 = document.getElementById('PublicationYear_tr').innerHTML.includes('PublicationYear_2018');
		if( has_2018 ) {
			let inputs = document.getElementById('PublicationYear_tr').getElementsByTagName('input');
			for( let input of inputs ) {
				if( input.value.includes("2018") ) {
					message.send('spider-get-detail-data', {info: ''});
					input.click();
					document.getElementById('PublicationYear_tr').querySelector('button[alt="精炼"]').click();
				}
			}
		} else {
			message.send("no-cite-refine-data", {info: true});
		}
	}

	get_detail_data(id) {
		this.detail_url = this.detail_url.replace('_qid_', this.qid_arr[id])
			.replace('_title_', this.title_arr[id]);
		return axios.get(this.detail_url).then( res => {
			let data = res.data.replace(/(\r\n|\r|\n)/);
			data = this.table_format(data);
			this.detail_datas[id] = data;
		})
	}

	get_cite_refine_data(data) {
		data = data.replace(/(\r\n|\r|\n)/g, '').match(/<div class="search-results">.*?name="LinksAreAllowedRightClick" value="CitedPatent\.do"/)[0]
		data = this.data_format(data);
		message.on('get-id', msg => {
			this.cite_refine_datas[msg.id] = data;
			message.send('cite-refine-done', {info: true});
		})			
	}

	data_format() {

	}

	table_format() {

	}

	run() {
		this.get_search_data(0).then( () => {
			this.open_cite_page(0);
		})

		message.on('get-detail-data', msg => {
			this.get_detail_data(msg.id);
		})
	}
}

var url = window.location.href;
var spider;

message.send('is-start', {info: ''});

message.on('is-start', msg => {
	if( url.includes('UA_GeneralSearch_input.do?') ) {
		spider = new Spider();
		spider.get_sid();
		spider.get_title_arr();
	} else {
		message.send('get-spider', {info: ''});
		message.on('spider', msg => {
			spider = msg.spider;
		})
	}

	document.addEventListener("DOMContentLoaded", (e) => {
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