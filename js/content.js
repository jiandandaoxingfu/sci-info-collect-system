var url = window.location.href;
var paper = new Paper();

function get_parameter() {
	let sid = url.match(/&SID=(.*?)&/);
	let title = url.match(/&title=(.*?)&/);
	let id = url.match(/&id=(.*?)&/);
	let author = url.match(/&author=(.*?)/);
	if( sid ) {
		sid = sid[1];
		message.send('sid', {sid: sid});
		if( url.includes('UA_GeneralSearch_input.do') ) window.close();
	}
	if( !paper.title ) {
		if( title ) paper.title = title[1];
		if( id ) paper.id = id[1];
		if( author ) {
			let s = author[1];
			let s2 = s.split('-');
			if( s2.length === 3 ) {
				paper.author = [s.replace(/-/g, ''), s2[0]+s2[1]+s2[2].toLocaleLowerCase(), s2[1]+s2[2]+s2[0], s2[1]+s2[2].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0]+s2[2][0], s2[0]+s2[1][0]+s2[2][0].toLocaleLowerCase(), s2[1][0]+s2[2][0]+s2[0], s2[1][0]+s2[2][0].toLocaleLowerCase()+ s2[0] ];
			} else if( s2.length === 2 ) {
				paper.author = [s.replace(/-/g, ''), s2[0]+s2[1].toLocaleLowerCase(), s2[1]+s2[0], s2[1].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0], s2[0]+s2[1][0].toLocaleLowerCase(), s2[1][0]+s2[0], s2[1][0].toLocaleLowerCase()+ s2[0] ];
			}
		}
	}
};

get_parameter();

document.addEventListener("DOMContentLoaded", (e) => {
	if( url.match(/Search.do\?.*?search_mode=GeneralSearch/) ) {
		paper.search_page();
	} else if( url.match(/CitingArticles.do\?.*?search_mode=CitingArticles/) ) {
		paper.cite_page();
	} else if( url.match(/Search.do\?.*?search_mode=CitingArticles/) ) {
		paper.cite_refined_page();
	} else if( url.includes('OutboundService.do?') ) {
		paper.detail_page();
	}
})
