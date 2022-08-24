let interval = setInterval(() => {
	if( !document.getElementById('my-style') ) {
		let style = document.createElement('style');
		style.innerHTML = css;
		style.setAttribute('id', 'my-style');
		document.body.appendChild(style);
	}

	if ( window.location.href.includes("wos/woscc/summary/") && !document.getElementById('cite-number') ) {
		let ele = document.querySelector('.app-records-list');
		if ( ele ) {
			let div = document.createElement('div');
			div.innerHTML = `
			<div id="cite-number">
			    <span style="color: red; font: bold;" class="info">注意筛选年份/被引用页面</span>
			    <br>
				<span style="color: red; font: bold;" class="info">勾选选择框来标注他引</span>
			    <br>
			    <span style="color: blue;">黑色</span>勾选框表示他引。
				他引：<input id="other-cite" type="number" value="0" />
			</div>`
			ele.insertBefore(div, ele.firstChild);
		}
	}
}, 1000)

let journal_interval = setInterval(() => {
	if ( window.location.href.includes('full-record') 
		&& document.querySelector('[cdxanalyticscategory="wos-recordCard_Journal_Info"]') 
		&& !document.querySelector('.wos-jcr-overlay-panel.ng-star-inserted') 
	) {
		document.querySelector('[cdxanalyticscategory="wos-recordCard_Journal_Info"]').click();
	}
}, 1000)

function add_mark() {
	let count = 0;
	for (let td of document.querySelector('.wos-jcr-overlay-panel.ng-star-inserted')?.querySelectorAll?.('td') ?? [] ) {
		for (let div of td.querySelectorAll('div')) {
			if (div.innerHTML.toLowerCase().indexOf("math") > -1) {
				count += 1;
				div.classList.add("highlight")
			}
		}
	}

	let addr = document.querySelector("#address_1").innerText.includes("Zhengzhou Univ");

	if (count > 0 && addr) {
		document.getElementById('full-record-info')?.remove?.();
		window.print();
	} else {
		if( document.getElementById('full-record-info') ) return;
		let div = document.createElement('div');
		div.setAttribute('id', 'full-record-info');
		div.style = "color: red; font-size: 25px;";
		div.innerText = "第一作者单位不是郑州大学或者杂志学科分类没有数学";
		let record = document.querySelector('.fullRecord-page');
		record.insertBefore(div, record.firstChild);
	}
}

document.addEventListener('click', e => {
	if (e.target.getAttribute('cdxanalyticscategory') === "wos-recordCard_Journal_Info") {
		setTimeout(add_mark, 1000);
	} else if (e.target.className === "mat-checkbox-inner-container") {
		setInterval(() => {
			let other_cite = 0;
			document.querySelector('.app-records-list').querySelectorAll('input').forEach((input) => {
				other_cite += input.checked + 0;
			})
			document.querySelector('#other-cite').value = other_cite;
		}, 300)
	}
})

const css = `
#tips {
	position: fixed;
	left: 25px;
	top: 390px;
	color: red;
	font-size: 15px;
}
#tips input {
	font-size: 20px; 
	color: red; 
	text-align: center;
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
	border: 10px solid black;
	opacity: 1 !important;
}
.block-text-content, 
#PublicationYear_tr .refine-subitem, 
#FullRTa-fullRecordtitle-0, 
.highlight, 
#SumAuthTa-MainDiv-author-en,
#address_1,
.journal-content-row,
.search-info-title,
.refine-term,
.article-metadata {
	border: 3px solid red;
}

.wos-jcr-overlay-panel.ng-star-inserted {
	position: inherit !important;
}

#FRMiniCrlTa-snMcrl,
.catg-classification-section,
.funding-info-section,
#snJournalData,
footer {
	display: none;
}

.wos-recordCard_Journal_Info {
	color: red;
	border: 2px solid red;
}

#snCitationData {
	height: 750px;
    overflow: hidden;
}

@media print {
	#tips, .info {
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