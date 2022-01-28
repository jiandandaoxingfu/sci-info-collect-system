css = `
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
	border: 3px solid blue;
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

#FRMiniCrlTa-snMcrl,
.catg-classification-section,
.funding-info-section,
#snJournalData,
footer {
	display: none;
}

#snCitationData {
	height: 750px;
    overflow: hidden;
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

		let script = document.createElement('script');
		script.innerHTML = `
			function add_mark() {
				count = 0;
				for (let td of document.getElementsByClassName('wos-jcr-overlay-panel ng-star-inserted')[0].getElementsByTagName('TD') ) {
    				for (let div of td.getElementsByTagName('DIV') ) {
        				if (div.innerHTML.toLowerCase().indexOf("mathematics") > -1 ) { 
        					count += 1;
        					div.classList.add("highlight") 
        				}
    				}
				}
				
				let addr = document.querySelector("#address_1").innerText.indexOf("Zhengzhou Univ") > -1

				if (count > 0 && addr) {
					window.print();
				} else {
					alert("第一作者单位不是郑州大学或者杂志学科分类没有数学");
				}
			}
			document.addEventListener('click', e => {
				if (e.target.tagName === "BUTTON") {
					if (e.target.getAttribute('cdxanalyticscategory') === "wos-recordCard_Journal_Info") {
						setTimeout( add_mark, 300);
					}
				} else if (e.target.className === "mat-checkbox-inner-container") {
					setTimeout( () => {
						let other_cite = 0;
						document.querySelector('.app-records-list').querySelectorAll('input').forEach( (input) => {
							other_cite += input.checked + 0;
						})
						document.querySelector('#other-cite').value = other_cite;
					}, 100)
				}
			})
		`
		document.body.appendChild(script);

		if (window.location.href.indexOf("wos/woscc/summary/") > 0) {
			(document.querySelector('.l-columns-item') || document.querySelector('.page-bar') ).innerHTML =`
				<div id="cite-number">
					<span style="color: blue;">绿色框</span>表示他引。
					他引：<input id="other-cite" type="number" />
				</div>
			`
			document.getElementById('other-cite').value = 0;
		} else if (window.location.href.indexOf("full-record") > 0 ) {
			let tips = document.createElement('div');
				tips.innerHTML = `
					<div id='tips'>
						点击期刊详情<br>
						对数学分类进行标注
						===>
					</div>`
				document.body.appendChild(tips);
		}
		clearInterval(interval);
	} 
}, 1000)