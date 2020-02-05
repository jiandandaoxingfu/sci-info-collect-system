var url = window.location.href;
var paper = new Paper();

function get_sid() {
	let sid = url.match(/&SID=(.*?)&/);
	if( url.includes('UA_GeneralSearch_input.do') && sid ) {
		message.send('sid', {sid: sid[0]});
		window.close();
	} 
};

get_sid();

function get_paras() {
	if( url.includes('UA_GeneralSearch_input.do') ) return;
	message.send('get-paras', {msg: ''});
	message.on('paper-paras', (msg) => {
		console.log('已接收参数');
		paper.id = msg.id;
		paper.title = msg.title;
		paper.author = msg.author;
		paper.sid = msg.sid;
		if( author ) {
			let s = msg.author;
			let s2 = s.split('-');
			if( s2.length === 3 ) {
				paper.author_arr = [s.replace(/-/g, ''), s2[0]+s2[1]+s2[2].toLocaleLowerCase(), s2[1]+s2[2]+s2[0], s2[1]+s2[2].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0]+s2[2][0], s2[0]+s2[1][0]+s2[2][0].toLocaleLowerCase(), s2[1][0]+s2[2][0]+s2[0], s2[1][0]+s2[2][0].toLocaleLowerCase()+ s2[0] ];
			} else if( s2.length === 2 ) {
				paper.author_arr = [s.replace(/-/g, ''), s2[0]+s2[1].toLocaleLowerCase(), s2[1]+s2[0], s2[1].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0], s2[0]+s2[1][0].toLocaleLowerCase(), s2[1][0]+s2[0], s2[1][0].toLocaleLowerCase()+ s2[0] ];
			}
		}
	})	
}

setTimeout(() => {
	get_paras();
}, 3000)

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
