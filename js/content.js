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
		if( author ) paper.author = author[1];
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
