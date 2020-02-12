class Spider {
	init() {
		message.send('author-arr', {});

		message.on('author-arr', msg => {
			this.get_cite_refine_data();
		})
	}
	get_cite_refine_data() {
		// 由于精炼页面时从引用页面自然进来，因此基本不会出错。
		console.log(msg.author_arr);
		let ele = document.querySelector('.search-results');
		if( ele ) {
			this.data_format(ele);
			let data = this.get_cite_num(msg.author_arr);
			message.send('cite-refine-info', {info: true, data: data});	
		} else {
			message.send('cite-refine-info', {info: false, data: ''});
		}
	}

	data_format(ele) {
		ele.style.padding = '25px';
		let body = document.body;
		body.innerHTML = '';
		body.appendChild(ele);
		for(let e of body.getElementsByClassName("nodisplay") ) { e.parentElement.removeChild(e) }
		[	body.querySelectorAll('*[style="display: none"]'),
			body.querySelectorAll('script'),
			body.querySelectorAll('*[type="hidden"]'),
			body.querySelectorAll('*[style="display: none;"]'),
			body.querySelectorAll('.search-results-checkbox'),
			body.querySelectorAll('.alum'),
			body.querySelectorAll('span.smallV110')
		].filter( e => e.length > 0 )
	 	.forEach( eles => eles.forEach( e => e.parentElement.removeChild(e) ) );

		body.querySelectorAll('.search-results-content').forEach( e => {
		 	[1, 2, 3, 4, 5].forEach( () => {
		 		if( e.children[3])
		 			e.removeChild(e.children[3])
		 	});
		})	

		body.querySelectorAll('.search-results-data-icon').forEach( e => {
			e.previousSibling.innerHTML += '<br><span class="high-cite">高被引</span>';
			e.parentElement.removeChild(e);
		})
		body.querySelectorAll('a.smallV110').forEach( e => e.innerHTML = e.innerText );
		body.querySelectorAll('.search-results-number').forEach( e => e.innerHTML = e.innerText );
		['href', 'url', 'onclick', 'alt', 'title', 'oncontextmenu', 'hasautosubmit', 'name'].forEach( attr => {
			body.querySelectorAll(`*[${attr}]`).forEach( e => e.removeAttribute(attr) );
		})
	}

	get_cite_num(author_arr) {
		let body = document.body;
		let self_cite_num = 0, other_cite_num = 0;
		body.querySelectorAll('.search-results-content').forEach( author_div => {
			let authors = [];
			author_div.children[1].querySelectorAll('a').forEach( a => {
				authors.push( a.innerHTML.replace(/(-|,|\s|\.)/g, '') );
    		})
    		let author_union = new Set([...authors, ...author_arr]);
    		if( author_union.size === (authors.length + author_arr.length) ) {
    			author_div.nextElementSibling.firstElementChild.innerHTML += `<br><span class='cite-num'>被引</span>`;
				other_cite_num += 1;
    		} else {
    			author_div.nextElementSibling.firstElementChild.innerHTML += `<br><span class='cite-num'>自引</span>`;
				self_cite_num += 1;
    		}
		})
		return {data: body.innerHTML, cite_num: [other_cite_num, self_cite_num]};
	}
}

var url = window.location.href;
var spider = new Spider();
spider.init();

document.addEventListener("DOMContentLoaded", (e) => {
	window.stop();
})