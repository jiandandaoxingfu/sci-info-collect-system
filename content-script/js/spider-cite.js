class Spider {
	get_cite_data() {
		let tr = document.getElementById('PublicationYear_tr');
		let input = document.querySelector('input[value="PublicationYear_2018"]');
		if( tr ) {
			if( input ) {
				message.send('cite-info', {info: 'has-2018-cite'});
				input.click();
				tr.querySelector('button[alt="精炼"]').click();
			} else {
				message.send("cite-info", {info: 'no-2018-cite'});
			}
		} else {
			message.send("cite-info", {info: 'cite-page-error'});
		}
	}
}

var spider = new Spider();

document.addEventListener("DOMContentLoaded", (e) => {
	console.log('dom ready');
	window.stop();
	spider.get_cite_data();
})