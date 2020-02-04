/*
 * @Author:       old jia
 * @Date:                2018-09-27 00:14:10
 * @Last Modified by:   old jia
 * @Last Modified time: 2020-01-16 12:44:08
 * @Email:               jiaminxin@outlook.com
 */

const { Crawl } = require('./spider.js');
const { print2pdf } = require('./print.js');
const {	app, BrowserWindow, webContents } = require('electron')
const {	Menu, MenuItem, dialog,	ipcMain } = require('electron')
const {	appMenuTemplate } = require('./appmenu.js')
const path = require('path')
const fs = require('fs');

let mainWindow, subWindow, page_type, subWindow_is_show = false;
let year, author;
let crawl = new Crawl();



app.on('ready', function() {
	mainWindow = new BrowserWindow({
		title: '科研成果统计系统',
		width: 1200,
		height: 600,
		show: false,
		webPreferences: {
        	javascript: true,
        	plugins: true,
        	nodeIntegration: false, // 不集成 Nodejs
        	webSecurity: false,
        	preload: path.join(__dirname, 'renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    	}
	})
	mainWindow.maximize()

	mainWindow.loadURL('http://localhost:3000/')
	mainWindow.on('closed', () => {
		app.quit()
	})
	const menu = Menu.buildFromTemplate(appMenuTemplate)
	Menu.setApplicationMenu(menu);

	subWindow = new BrowserWindow({
		width: 1200,
		height: 600,
		show: false,
		webPreferences: {
        	javascript: true,
        	plugins: true,
        	nodeIntegration: false, // 不集成 Nodejs
        	webSecurity: false,
        	preload: path.join(__dirname, 'renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    	}
	})
	crawl.win = subWindow;

	subWindow.loadURL('http://apps.webofknowledge.com');
	page_type = 'root';

	subWindow.webContents.on('dom-ready', (event) => {
		let url = subWindow.webContents.getURL();
		if( url.includes('searchErrorMessage') ) {
			page_type = 'no_found';
			mainWindow.webContents.send('search_page_status', 'no_found');
		} else if( page_type === 'root' ) {
			try {
				crawl.sid = url.match(/SID.*?&/)[0].slice(4, -1);
			} catch(e) {
				dialog.showMessageBox({
   					title  : '错误' , 
   					type  : 'error',
   					message : '请检查是否有登录Web of Science的权限'
 				})
			}
		} else if( page_type === 'search_result' ) {
			crawl.get_search_status();
		} else if( page_type === 'cite' ) {
			crawl.get_cite_status();
		} else if( page_type === 'refine' ) {
			crawl.add_cite_tag();
			print_cite_page();
		} else if( page_type === 'detail' ) {
			print_detail_page();			
		}
	})

	subWindow.on('closed', () => {
		// 通常会把多个 window 对象存放在一个数组里面，
		app.quit()
	})

	ipcMain.on('search_title_2_main', (event, message) => {
		if( !crawl.sid ) return;
		let url = 'http://apps.webofknowledge.com/WOS_GeneralSearch.do?fieldCount=1&action=search&product=WOS&search_mode=GeneralSearch&SID=_sid_&max_field_count=25&max_field_notice=%E6%B3%A8%E6%84%8F%3A+%E6%97%A0%E6%B3%95%E6%B7%BB%E5%8A%A0%E5%8F%A6%E4%B8%80%E5%AD%97%E6%AE%B5%E3%80%82&input_invalid_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E8%AF%B7%E8%BE%93%E5%85%A5%E6%A3%80%E7%B4%A2%E8%AF%8D%E3%80%82&exp_notice=%E6%A3%80%E7%B4%A2%E9%94%99%E8%AF%AF%3A+%E4%B8%93%E5%88%A9%E6%A3%80%E7%B4%A2%E8%AF%8D%E5%8F%AF%E4%BB%A5%E5%9C%A8%E5%A4%9A%E4%B8%AA%E5%AE%B6%E6%97%8F%E4%B8%AD%E6%89%BE%E5%88%B0+%28&input_invalid_notice_limits=+%3Cbr%2F%3E%E6%B3%A8%E6%84%8F%3A+%E6%BB%9A%E5%8A%A8%E6%A1%86%E4%B8%AD%E6%98%BE%E7%A4%BA%E7%9A%84%E5%AD%97%E6%AE%B5%E5%BF%85%E9%A1%BB%E8%87%B3%E5%B0%91%E4%B8%8E%E4%B8%80%E4%B8%AA%E5%85%B6%E4%BB%96%E6%A3%80%E7%B4%A2%E5%AD%97%E6%AE%B5%E7%9B%B8%E7%BB%84%E9%85%8D%E3%80%82&sa_params=WOS%7C%7C7AVrjhmEcJpyJsy2QBT%7Chttp%3A%2F%2Fapps.webofknowledge.com%7C%27&formUpdated=true&value%28input1%29=title&value%28select1%29=TI&value%28hidInput1%29=&limitStatus=collapsed&ss_lemmatization=On&ss_spellchecking=Suggest&SinceLastVisit_UTC=&SinceLastVisit_DATE=&period=Range+Selection&range=ALL&startYear=1985&endYear=2020&editions=SCI&editions=SSCI&editions=AHCI&editions=ISTP&editions=ESCI&editions=CCR&editions=IC&update_back2search_link_param=yes&ssStatus=display%3Anone&ss_showsuggestions=ON&ss_numDefaultGeneralSearchFields=1&ss_query_language=&rs_sort_by=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A';
		url = url.replace('_sid_', crawl.sid)
			     .replace('title', message.title);
		subWindow.loadURL(url);
		crawl.title = message.title;
		crawl.id = message.id;
		page_type = 'search_result';

	});

	ipcMain.on('selection', (event, message) => {
		crawl.year = message.year;
		s = message.author;
		s2 = s.split('-');
		if( s2.length === 3 ) {
			crawl.author = [s.replace(/-/g, ''), s2[0]+s2[1]+s2[2].toLocaleLowerCase(), s2[1]+s2[2]+s2[0], s2[1]+s2[2].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0]+s2[2][0], s2[0]+s2[1][0]+s2[2][0].toLocaleLowerCase(), s2[1][0]+s2[2][0]+s2[0], s2[1][0]+s2[2][0].toLocaleLowerCase()+ s2[0] ];
		} else if( s2.length === 2 ) {
			crawl.author = [s.replace(/-/g, ''), s2[0]+s2[1].toLocaleLowerCase(), s2[1]+s2[0], s2[1].toLocaleLowerCase()+s2[0], s2[0]+s2[1][0], s2[0]+s2[1][0].toLocaleLowerCase(), s2[1][0]+s2[0], s2[1][0].toLocaleLowerCase()+ s2[0] ];
		}
	});

	ipcMain.on('search_page_status', (event, message) => {
		page_type = 'not_cite';
		crawl.qid = message.qid;
		if( message.error[0] === 'd' ) {
			mainWindow.webContents.send('search_page_status', '10');
			page_type = 'cite';
			let base64Data = message.error.replace(/^data:image\/\w+;base64,/, "");
    		let dataBuffer = new Buffer.alloc(100000, base64Data, 'base64'); // 解码图片
    		fs.writeFile('./images/' + `${crawl.id}_search_${crawl.title}.png`, dataBuffer, (error) => {
      			if (error) throw error
      			subWindow.webContents.executeJavaScript(`
						document.querySelector('a.snowplow-times-cited-link').click();
				`)
    		})	
		} else {
			mainWindow.webContents.send('search_page_status', message.error);
		}
	})

	ipcMain.on('cite_page_status', (event, message) => {
		mainWindow.webContents.send('cite_page_status', message);
		page_type = 'not_refine';
		if( message.match(/\d/) ) {
			page_type = 'refine';
			subWindow.webContents.executeJavaScript(`
				document.getElementById('PublicationYear_tr').querySelector('button[alt="精炼"]').click();
			`)
		}
	})

	ipcMain.on('cite_num', (event, message) => {
		mainWindow.webContents.send('cite_num', message);
	})

	ipcMain.on('valid_title', (event, message) => {
		create_html(message);
	})

	ipcMain.on('show_subWindow', (event, message) => {
		if( subWindow_is_show ) {
			subWindow.hide()
		} else {
			subWindow.show();
		}
		subWindow_is_show = !subWindow_is_show;
	});

	ipcMain.on('restart', (event, message) => {
		mainWindow.reload();
		subWindow.loadURL('https://www.baidu.com');
		page_type = 'none';
	})
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

function print_cite_page() {
	page_type = 'detail';
	setTimeout(() => {
		print2pdf(subWindow, `${crawl.id}_cite_${crawl.title}.pdf`, () => {
			mainWindow.webContents.send('print', "cite_page_printed");
			subWindow.loadURL(`http://apps.webofknowledge.com/OutboundService.do?action=go&displayCitedRefs=true&displayTimesCited=true&displayUsageInfo=true&viewType=summary&product=WOS&mark_id=WOS&colName=WOS&search_mode=GeneralSearch&locale=zh_CN&view_name=WOS-summary&sortBy=PY.D%3BLD.D%3BSO.A%3BVL.D%3BPG.A%3BAU.A&mode=outputService&qid=${crawl.qid}&SID=${crawl.sid}&format=formatForPrint&filters=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&selectedIds=1&mark_to=1&mark_from=1&queryNatural=${crawl.title}&count_new_items_marked=0&MaxDataSetLimit=&use_two_ets=false&DataSetsRemaining=&IsAtMaxLimit=&IncitesEntitled=yes&value(record_select_type)=pagerecords&markFrom=1&markTo=1&fields_selection=HIGHLY_CITED+HOT_PAPER+OPEN_ACCESS+PMID+USAGEIND+AUTHORSIDENTIFIERS+ACCESSION_NUM+FUNDING+SUBJECT_CATEGORY+JCR_CATEGORY+LANG+IDS+PAGEC+SABBR+CITREFC+ISSN+PUBINFO+KEYWORDS+CITTIMES+ADDRS+CONFERENCE_SPONSORS+DOCTYPE+ABSTRACT+CONFERENCE_INFO+SOURCE+TITLE+AUTHORS++&&&totalMarked=1`);
		});
	}, 500);
}

function print_detail_page() {
	page_type = 'done';
	setTimeout(() => {
		print2pdf(subWindow, `${crawl.id}_detail_${crawl.title}.pdf`, () => {
			mainWindow.webContents.send('print', "detail_page_printed");
		});
	}, 500);
}

function create_html(img_names) {
	let imgs = '';
	for( let fn of img_names ) {
		imgs += `<div><img src="../images/${fn}"/></div>`;
	}
	let html = `
			<!DOCTYPE html>
			<html lang="en">
  			<head>
    			<meta charset="utf-8" />
    			<style>
					div {
						text-align: center;
						margin: 50px auto;
					}
    			</style>
    			<title>统计汇总</title>
  			</head>
  			<body>
    			${imgs}
  			</body>
			</html>

	`;

	fs.writeFile('./public/统计汇总表.html', html, (error) => {
      	if (error) throw error
      	subWindow.loadURL( path.join(__dirname, '统计汇总表.html')  )
      	setTimeout(() => {
			print2pdf(subWindow, '统计汇总表.pdf', () => {
				mainWindow.webContents.send('print', "title_printed");
			});
		}, 500);
    })	
}