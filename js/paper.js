class Paper {
	init(msg) {
		this.id = msg.id;
		this.author = msg.author;
		this.author_arr = format_name(msg.author);
		this.title = msg.title;
		this.qid = msg.qid;
		this.sid = msg.sid;
	}

	search_page() {
		window.stop();
		let qid = document.body.innerHTML.match(/qid=(\d+)/) || [0, 0];
		message.send('qid', {qid: qid[1]});
		let len = document.querySelectorAll('div.search-results-item').length;
		let cite_item = document.querySelector('a.snowplow-times-cited-link');
		if( len > 1 ) {
			message.send("search_page_info", { info: 'mutil' });
		} else if( len === 1 && !cite_item ) {
			message.send("search_page_info", { info: 'no_cite' });
		} else if( len === 0 ){
			message.send("search_page_info", { info: 'no_found' });
		} else if( len === 1 && cite_item ){
			let search_item = document.getElementById('RECORD_1');
			let href = document.querySelector('a.snowplow-times-cited-link').getAttribute('href');
			search_item.innerHTML = search_item.innerHTML.replace(/(src|href|url)=".*?"/g, '');
			html2canvas(search_item).then( canvas => {
				this.save_element2image(canvas);
				message.send("search_page_info", { info: 'captured' });
				document.querySelector('a.snowplow-times-cited-link').setAttribute('href', href);
				document.querySelector('a.snowplow-times-cited-link').click();
			});
		}
	}	

	cite_page() {
		window.stop();
		let has_2018 = document.getElementById('PublicationYear_tr').innerHTML.includes('PublicationYear_2018');
		let info = 'no_cite';
		if( has_2018 ) {
			let inputs = document.getElementById('PublicationYear_tr').getElementsByTagName('input');
			for( let input of inputs ) {
				if( input.value.includes("2018") ) {
					info = input.nextElementSibling.innerHTML.match(/\((\d+)\)/)[1];
					let url = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com/OutboundService.do?action=go&displayCitedRefs=true&displayTimesCited=true&displayUsageInfo=true&viewType=summary&product=WOS&mark_id=WOS&colName=WOS&search_mode=GeneralSearch&locale=zh_CN&view_name=WOS-summary&sortBy=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A&mode=outputService&qid=${this.qid}&SID=${this.sid}&format=formatForPrint&filters=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&selectedIds=1&mark_to=1&mark_from=1&queryNatural=${this.title}&count_new_items_marked=0&MaxDataSetLimit=&use_two_ets=false&DataSetsRemaining=&IsAtMaxLimit=&IncitesEntitled=yes&value(record_select_type)=pagerecords&markFrom=1&markTo=1&fields_selection=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&&&totalMarked=1`;
					message.send('open_detail_page', {url: url});
					input.click();
					document.getElementById('PublicationYear_tr').querySelector('button[alt="精炼"]').click();
				}
			}
		}
		message.send("cite_page_info", {info: info});
	}

	cite_refined_page() {
		window.stop();
		let self_cite_num = 0, other_cite_num = 0;
		for( let div of document.querySelectorAll('div.search-results-item') ) {
			let authors = [];
			let as = div.querySelectorAll('a[alt="查找此作者的更多记录"]');
			for( let a of as ) {
				authors.push( a.innerHTML.replace(/(-|,|\s|\.)/g, '') );
    		}
			let author_union = new Set( [...authors, ...this.author_arr] );
			if( author_union.size === (authors.length + this.author_arr.length) ) {
				div.querySelector('div.search-results-data').innerHTML += '<div class="alum" style="color: red; font-size: 18px ">他引</div>';
				other_cite_num += 1;
			} else {
				div.querySelector('div.search-results-data').innerHTML += '<div class="alum" style="color: red; font-size: 18px ">自引</div>';
				self_cite_num += 1;
			}
		}
		message.send("cite_num", {
			self_cite_num: self_cite_num,
			other_cite_num: other_cite_num,
		});
		html2pdf(this.id + '-被引论文列表-' + this.title, "cite_printed");
	}

	detail_page() {
		window.stop();
		html2pdf(this.id + '-详情页-' + this.title, "detail_printed").then(() => {
			message.send('close-window', {msg: ''});	
		});
	}

	save_element2image(canvas) {
    	let MIME_TYPE = "image/png";
    	let imgURL = canvas.toDataURL(MIME_TYPE);
    	let dlLink = document.createElement('a');
    	dlLink.download = this.id + '-截图-' + this.title + '.png';
    	dlLink.href = imgURL;
    	dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
    	document.body.appendChild(dlLink);
    	dlLink.click();
    	document.body.removeChild(dlLink);
	}
}


function format_name(s) {
	let s2 = s.split('-');
	if( s2.length === 3 ) {
		name_arr = [s.replace(/-/g, ''), s2[0]+s2[1]+s2[2].toLocaleLowerCase(), s2[1]+s2[2]+s2[0], s2[1]+s2[2].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0]+s2[2][0], s2[0]+s2[1][0]+s2[2][0].toLocaleLowerCase(), s2[1][0]+s2[2][0]+s2[0], s2[1][0]+s2[2][0].toLocaleLowerCase()+ s2[0] ];
	} else if( s2.length === 2 ) {
		name_arr = [s.replace(/-/g, ''), s2[0]+s2[1].toLocaleLowerCase(), s2[1]+s2[0], s2[1].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0], s2[0]+s2[1][0].toLocaleLowerCase(), s2[1][0]+s2[0], s2[1][0].toLocaleLowerCase()+ s2[0] ];
	}
	return name_arr;
}