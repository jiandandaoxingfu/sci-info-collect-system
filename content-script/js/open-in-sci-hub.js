let id = document.body.innerText.indexOf('DOI');
if( id === -1 ) {
	id = document.body.innerText.indexOf('doi');
}
if( id > -1 ) {
	let doi = document.body.innerText.slice(id, id + 50).match(/10([\.\/][^\.\/]+)+/g)[0].split(/\n/)[0];
	let div = document.createElement('div');
	div.innerHTML += `<div style="position: fixed; right: 20px; bottom: 20px; height: 60px; width: 60px;background: #5e33bf; border-radius: 50%;">
							<span style="display: inline-block; height: 20px; 
										 width: 40px; color: white;
										 text-align: center;
								  		 font-size: 20px; margin-top: 16px; margin-left: 9px;
								  	     ">
							    <a href="https://sci-hub.ren/${doi}" target="_blank" style="color: white;">下载</a>
						    </span>
					  </div>`
	document.body.appendChild(div);
}