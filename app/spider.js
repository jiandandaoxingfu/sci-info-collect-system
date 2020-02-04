/*
* @Author:             old jia
* @Email:              jiaminxin@outlook.com
* @Date:               2020-01-10 18:08:54
* @Last Modified by:   Administrator
* @Last Modified time: 2020-01-13 18:16:32
*/

const request_headers = {	
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', 
	'Accept-Encoding': 'gzip, deflate', 
	'Accept-Language': 'zh-CN,zh;q=0.9', 
	'Cache-Control': 'max-age=0', 
	'Connection': 'keep-alive', 
	'Content-Type': 'application/x-www-form-urlencoded', 
	'Host': 'apps.webofknowledge.com', 
	'Origin': 'http://apps.webofknowledge.com/', 
	'Upgrade-Insecure-Requests': 1, 
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36 OPR/63.0.3368.107', 
}


class Crawl {
	constructor() { 
		this.qid = '';
		this.authors = [];
		this.win;
	}

	get_search_status() {
		this.win.webContents.executeJavaScript(`
			let m = document.body.innerHTML.match(/qid=(\\d+)/);
			let qid = m === null ? 0 : m[1];
			let len = document.querySelectorAll('div.search-results-item').length;
			let cite_item = document.querySelector('a.snowplow-times-cited-link');
			let error;
			if( len > 1 ) {
				window.electron.ipcRenderer.send("search_page_status", { error: 'mutil', qid: qid });
			} else if( len === 1 && !cite_item ) {
				window.electron.ipcRenderer.send("search_page_status", { error: 'no_cite', qid: qid });
			} else if( len === 0 ){
				window.electron.ipcRenderer.send("search_page_status", { error: 'no_found', qid: qid });
			} else if( len === 1 && cite_item ){
				let search_item = document.getElementById('RECORD_1');
				html2canvas(search_item).then( canvas => {
					window.electron.ipcRenderer.send("search_page_status", { error: canvas.toDataURL("image/png"), qid: qid });
				});

			}
		`)
	}

	get_cite_status() {
		this.win.webContents.executeJavaScript(`
			let has_2018 = document.getElementById('PublicationYear_tr').innerHTML.includes('PublicationYear_2018');
			let error = 'no_cite';
			if( has_2018 ) {
				let inputs = document.getElementById('PublicationYear_tr').getElementsByTagName('input');
				for( let input of inputs ) {
					if( input.value.includes("2018") ) {
						input.click();
						error = input.nextElementSibling.innerHTML.match(/\\((\\d+)\\)/)[1];
					}
				}
			}
			window.electron.ipcRenderer.send("cite_page_status", error);
		`)
	}

	add_cite_tag() {
		this.win.webContents.executeJavaScript(`
			let self_cite_num = 0, other_cite_num = 0;
			for( let div of document.querySelectorAll('div.search-results-item') ) {
				let authors = [];
				let as = div.querySelectorAll('a[alt="查找此作者的更多记录"]');
				for( let a of as ) {
					authors.push( a.innerHTML.replace(/(-|,|\\s|\\.)/g, '') );
    			}
				let author_union = new Set( [...authors, ...${JSON.stringify(this.author)} ] );
				if( author_union.size === (authors.length + ${JSON.stringify(this.author)}.length) ) {
					div.querySelector('div.search-results-data').innerHTML += '<div class="alum" style="color: red; font-size: 18px ">他引</div>';
					other_cite_num += 1;
				} else {
					div.querySelector('div.search-results-data').innerHTML += '<div class="alum" style="color: red; font-size: 18px ">自引</div>';
					self_cite_num += 1;
				}
			}
			window.electron.ipcRenderer.send("cite_num", {
				self_cite_num: self_cite_num,
				other_cite_num: other_cite_num,
			});
		`)
	}


}

exports.Crawl = Crawl;