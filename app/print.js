/*
* @Author:             old jia
* @Email:              jiaminxin@outlook.com
* @Date:               2020-01-11 16:32:20
* @Last Modified by:   Administrator
* @Last Modified time: 2020-01-13 12:30:47
*/

const fs = require('fs')

function print2pdf(win, fn, callback) {
	win.webContents.printToPDF( {}, (error, data) => { 
    	fs.writeFile('./file/' + fn, data, (error) => {
      		if (error) throw error
      		callback();
    	})		
	})
}
exports.print2pdf = print2pdf;