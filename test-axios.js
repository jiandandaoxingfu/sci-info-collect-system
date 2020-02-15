let axios = require('axios');

function get_data() {
	return axios.get('https://www.baidu.com/').then( res => {
		return res.data;
	})
}

get_data().then( data => console.log(data));