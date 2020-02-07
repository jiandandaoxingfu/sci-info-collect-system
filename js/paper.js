class Paper {
	init(msg) {
		this.id = msg.id;
		this.author = msg.author;
		this.author_arr = format_name(msg.author);
		this.title = msg.title;
		this.qid = msg.qid;
		this.sid = msg.sid;
		this.refid = msg.refid;
	}

	search_page() {
		window.stop();
		let qid = document.body.innerHTML.match(/qid=(\d+)/);
		let refid = document.body.innerHTML.match(/REFID=(\d+)/);
		if( !qid || !refid ) {
			alert('出错了: 无法获取qid或refid');
			return;
		}
		message.send( 'qid', { qid: qid[1], refid: refid[1] } );
		let len = document.querySelectorAll('div.search-results-item').length;
		let cite_item = document.querySelector('a.snowplow-times-cited-link');
		if( len > 1 ) {
			message.send("search_page_info", { info: 'mutil' });
		} else if( len === 1 && !cite_item ) {
			message.send("search_page_info", { info: 'no_cite' });
		} else if( len === 0 ){
			message.send("search_page_info", { info: 'no_found' });
		} else if( len === 1 && cite_item ){
			this.cite_page();
			this.capture();
		}
	}	

	capture() {
		this.capture_better_search_page();
		console.log(new Date().getSeconds() + '开始截图')
		html2canvas(document.body.firstChild, { scale: 2 }).then( canvas => {
			let MIME_TYPE = "image/png";
    		let imgURL = canvas.toDataURL(MIME_TYPE);
    		let dlLink = document.createElement('a');
    		dlLink.download = this.id + '-截图-' + this.title + '.png';
    		dlLink.href = imgURL;
    		dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
    		document.body.appendChild(dlLink);
    		dlLink.click();
    		document.body.removeChild(dlLink);
			console.log(new Date().getSeconds() + '完成截图')
			message.send("search_page_info", { info: 'captured' });
		});
	}

	get_cite_info() {
		axios.get('https://vpn2.zzu.edu.cn//,DanaInfo=apps.webofknowledge.com+CitingArticles.do', {
			product: 'WOS', 
			SID: this.sid, 
			search_mode: 'CitingArticles',
			parentProduct: 'WOS',
			parentQid: this.qid,
			parentDoc: '1',
			REFID: this.refid,
			logEventUT: 'WOS:000340351500004',
			excludeEventConfig: 'ExcludeIfFromNonInterProduct'
		})
		.then( res => {
			let id = res.data.match(/.*PublicationYear_2018.*? id="(.*?)".*/)
			if( id ) {
				let re = new RegExp(`.*${id[1]}.*?>(.*?)<.*`);
				let data = res.data.match(re)[1];
				message.send("cite_page_info", {info: data.match(/\((\d+)\)/)[1]});
				window.location.href = `https://vpn2.zzu.edu.cn/,DanaInfo=apps.webofknowledge.com+Search.do?product=WOS&SID=${this.sid}&search_mode=CitingArticles&prID=${this.prid}`;
			} else {
				message.send("cite_page_info", {info: 'no_cite'});
			}
		})
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
				div.querySelector('div.search-results-data').innerHTML += '<div style="color: red; font-size: 15px ">他引</div>';
				other_cite_num += 1;
			} else {
				div.querySelector('div.search-results-data').innerHTML += '<div style="color: red; font-size: 15px ">自引</div>';
				self_cite_num += 1;
			}
		}
		message.send("cite_num", {
			self_cite_num: self_cite_num,
			other_cite_num: other_cite_num,
		});
		this.print_better_cite_page();
		html2pdf(this.id + '-被引论文列表-' + this.title, "cite_printed").then( () => {
			console.log(new Date().getSeconds() + '已保存pdf')
		});
	}

	detail_page() {
		window.stop();
		this.print_better_detail_page();
		html2pdf(this.id + '-详情页-' + this.title, "detail_printed").then(() => {
			console.log(new Date().getSeconds() + '已保存pdf')
			message.send('close-window', {msg: ''});	
		});
	}

	capture_better_search_page() {
		let data = document.getElementById('RECORD_1');
		document.body.innerHTML = '';
		document.body.appendChild(data);
		for(let e of data.getElementsByClassName("nodisplay") ) { e.parentElement.removeChild(e) }
		[	data.querySelectorAll('*[style="display: none"]'),
			document.querySelectorAll('script'),
			data.querySelectorAll('*[type="hidden"]'),
			data.querySelectorAll('.search-results-checkbox'),
			data.querySelectorAll('.alum'),
			data.querySelectorAll('.search-results-number')
		].filter( e => e.length > 0 )
	 	.forEach( eles => eles.forEach( e => e.parentElement.removeChild(e) ) );
	 	
		data.querySelectorAll('.search-results-content').forEach( e => {
		 	[1, 2, 3, 4, 5].forEach( () => e.removeChild(e.children[3]) );
		})	
		
		data.querySelectorAll('*[href]').forEach( e => e.removeAttribute('href') );
		data.querySelectorAll('*[url]').forEach( e => e.removeAttribute('url') );
		data.querySelectorAll('*[src]').forEach( e => e.removeAttribute('src') );	
		data.querySelectorAll('div').forEach( e => e.style.backgroundColor = 'white');
	}

	print_better_cite_page() {
		let body = document.body;
		let title = body.querySelector('.block-text');
		body.querySelector('.block-text-content').setAttribute('style', 'padding: 20px')
		let data = document.querySelector('.search-results'); 
		data.style.paddingLeft = '20px';
		body.innerHTML = '<div></div>';
		body.firstChild.appendChild(title);
		body.firstChild.appendChild(data);
		body.querySelector('#naturalLimited').setAttribute('class', 'naturalOff');
		for(let e of body.getElementsByClassName("nodisplay") ) { e.parentElement.removeChild(e) }
		for(let e of body.getElementsByClassName("hidden") ) { e.parentElement.removeChild(e) }
		[	body.querySelectorAll('*[style="display: none"]'),
			document.querySelectorAll('script'),
			body.querySelectorAll('*[type="hidden"]'),
			body.querySelectorAll('.search-results-checkbox'),
			body.querySelectorAll('.alum'),
		].filter( e => e.length > 0 )
	 	.forEach( eles => eles.forEach( e => e.parentElement.removeChild(e) ) );

		body.querySelectorAll('.search-results-content').forEach( e => {
		 	[1, 2, 3, 4, 5].forEach( () => e.removeChild(e.children[3]) );
		})	
	
		body.querySelectorAll('.search-results-number').forEach( e => e.innerHTML = e.innerText );
		body.querySelectorAll('*[href]').forEach( e => e.removeAttribute('href') );
		body.querySelectorAll('*[url]').forEach( e => e.removeAttribute('url') );
		body.querySelectorAll('*[onclick]').forEach( e => e.removeAttribute('onclick') );
		body.querySelectorAll('div').forEach( e => e.style.backgroundColor = 'white');
		body.querySelector('.block-text-content').style.width = '900px';
		body.style.width = '900px';
		document.querySelectorAll('.search-results-content').forEach( e => { e.children[0].style.width = '680px'; e.children[1].style.width = '680px';e.children[2].style.width = '680px' } );

	}

	print_better_detail_page() {
		let body = document.body;
		body.querySelectorAll('*[type="hidden"]').forEach( e => e.parentElement.removeChild(e) );
		let table = document.getElementById('printForm').children[3];
		body.innerHTML = '';
		body.appendChild(table);
		body.style.width = '900px';
		table.width = '900px';
		table.style.padding = '25px';
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


