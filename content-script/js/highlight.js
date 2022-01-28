css = `
.title, .author, .research-subject, .address { 
	border: 5px solid black;
}

.footer {
	display: none;
}
#tips {
	position: fixed;
	left: 5px;
	top: 45%;
}
#tips input {
	font-size: 30px; 
	color: red; 
	text-align: center;
}
.cite-num, cite_num_ {
	font-size: 25px !important; 
	color: red !important; 
	display: inline-block !important;
	border: 2px solid red;
	text-align: center; 
	margin-bottom: 20px;
}
#cite-number {
	font-size:25px;
	color: red;
}
#cite-number input {
	width: 50px;
	height: 30px;
	font-size: 25px;
}
.search-results-checkbox {
	left: 0px;
	width: 60px;
	height: 30px;
}
.search-results-checkbox input.cite-box {
	opacity: 1;
	width: 25px;
	height: 25px;
	top: 5px;
	left: -20px;
	z-index: 2 !important;
}
.search-results-checkbox span {
	position: relative;
	display: inline-block;
	left: 7px;
	top: -5px;
	color: red;
	font-size: 25px;
}
input[type="checkbox"]:checked + span {
	border: 2px solid blue;
	opacity: 1 !important;
}
.block-text-content, #PublicationYear_tr .refine-subitem {
	border: 3px solid red;
}

@media print {
	#tips {
		display: none;
	}
	input[type="checkbox"] {
		display: none;
	}
	input[type="checkbox"]:not(input[type="checkbox"]:checked) + span {
		opacity: 0;
	}
}
`

interval = setInterval(() => {
	if (document.body) {
		// style
		let style = document.createElement('style');
		style.innerHTML = css;
		document.body.appendChild(style);

		if (window.location.href.indexOf('OutboundService') > 0) {
			let tags =
				[
					["Web of Science 类别", "research-subject"],
					["地址", "address"],
					["标题", "title"],
					["作者", "author"]
				]
			for (let tag of tags) {
				let index = document.body.innerHTML.indexOf(tag[0]);
				index = document.body.innerHTML.slice(0, index).match(/<td/g).length;
				document.body.getElementsByTagName('td')[index - 1].className = tag[1];
				document.body.getElementsByTagName('td')[index].className = tag[1];
			}
		} else if (window.location.href.match(/(Search|summary)\.do.*?search_mode=CitingArticles/)) {
			let script = document.createElement('script');
			script.innerHTML = `
				function checkbox_click(cb) {
					if (cb.checked) {
						document.querySelector('#self-cite').value = parseInt(document.querySelector('#self-cite').value) + 1;
						document.querySelector('#other-cite').value = parseInt(document.querySelector('#other-cite').value) - 1;
					} else {
						document.querySelector('#self-cite').value = parseInt(document.querySelector('#self-cite').value) - 1;
						document.querySelector('#other-cite').value = parseInt(document.querySelector('#other-cite').value) + 1;
					}
				}
				function add_cite_btn() {
					let items = document.body.getElementsByClassName('search-results-checkbox');
					for (let item of items) {
						item.innerHTML = '<input type="checkbox" class="cite-box" onclick="checkbox_click(this)"><span>自引</span>'
					}
				}
			`
			document.body.appendChild(script);

			let tips = document.createElement('div');
			tips.innerHTML = `
				<div id='tips'>
					<input type="button" value="开始标记是否自引" onclick="add_cite_btn()"/>
				</div>`
			document.body.appendChild(tips);

			document.querySelector('.l-columns-item').innerHTML =`
				<div id="cite-number">
					自引：<input id="self-cite" type="number" />
					他引：<input id="other-cite" type="number" />
				</div>
			`
			let other_cite = document.body.innerHTML.match(/PublicationYear_\d+.*?>(.*?)</)[1].split('(')[1].match(/\d+/)[0];
			document.getElementById('other-cite').value = other_cite;
			document.getElementById('self-cite').value = 0;
		}

		clearInterval(interval);
	}
}, 1000)