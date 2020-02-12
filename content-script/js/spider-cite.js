class Spider {
	get_cite_data() {
		let tr = document.getElementById('PublicationYear_tr');
		if( tr ) {
			let has_2018 = document.querySelector('body').innerHTML.includes('PublicationYear_2018');
			if( has_2018 ) {
				let inputs = document.getElementById('PublicationYear_tr').getElementsByTagName('input');
				for( let input of inputs ) {
					if( input.value.includes("2018") ) {
						message.send('cite-info', {info: 'has-2018-cite'});
						input.click();
						document.getElementById('PublicationYear_tr').querySelector('button[alt="精炼"]').click();
					}
				}
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