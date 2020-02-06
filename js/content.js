var url = window.location.href;
var paper = new Paper();

function get_sid() {
	let sid = url.match(/&SID=(.*?)&/);
	if( url.includes('UA_GeneralSearch_input.do') && sid ) {
		message.send('sid', {sid: sid[1]});
		window.close();
	} 
};

get_sid();

function get_paras() {
	if( url.includes('UA_GeneralSearch_input.do') ) return;
	message.send('get-paras', {isDetail: url.includes('OutboundService.do?')});
	message.on('paper-paras', (msg) => {
		paper.init(msg);
	})	
}

get_paras();

// document.addEventListener("DOMContentLoaded", (e) => {
// 	if( url.match(/Search.do\?.*?search_mode=GeneralSearch/) ) {
// 		paper.search_page();
// 	} else if( url.match(/CitingArticles.do\?.*?search_mode=CitingArticles/) ) {
// 		paper.cite_page();
// 	} else if( url.match(/Search.do\?.*?search_mode=CitingArticles/) ) {
// 		paper.cite_refined_page();
// 	} else if( url.includes('OutboundService.do?') ) {
// 		paper.detail_page();
// 	}
// })
