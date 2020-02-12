function moveSlider() {
	if( document.querySelector('#nc_1_n1z') ) {
		for(let i=0; i<259; i+=6) {
			setTimeout( () => {document.querySelector('#nc_1_n1z').style.left = `${i}px`}, 100 + i  );
		}
	} else {
		setTimeout( () => {
			moveSlider();
		}, 200)	
	}
}
moveSlider()
