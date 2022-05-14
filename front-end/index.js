var lastest_version = 'v2.5.0';
var check_update_count = 0;

function check_update() {
	if( check_update_count > 5 ) return;
	check_update_count++;
	let release_url = 'https://api.github.com/repos/jiandandaoxingfu/sci-info-collect-system/releases';
	axios.get(release_url).then( (res) => {
		if( res.data[0] ) {
			let tag_name = res.data[0].tag_name;
			if( tag_name !== lastest_version ) {
				if( confirm('有最新版本，是否前往下载？') ) {
					window.location.href = 'https://github.com/jiandandaoxingfu/sci-info-collect-system';
				}
			} else {
				console.log('不需要更新。');
			}
		}
	}).catch( e => {
		console.log( '查询更新失败：' + e );
		setTimeout( () => {
			check_update();
		}, 5000);
	})
}

check_update();