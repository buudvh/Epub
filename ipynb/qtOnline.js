//qtOnline.js v3.4//created by Sir
//the ngex corp
//this file have copyright, every commercial copy of this file is prohibited.
var contentcontainer = "maincontent";
var abookchapter,abookhost,abookid;
function printStackTrace() {
	try{
		var e = new Error('dummy');
		var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
		.replace(/^\s+at\s+/gm, '')
		.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
		.split('\n');
		console.log(stack);
	}
	catch(except){
		console.log(except);
	}
}
var tse={
	ws:{},
	connected:false,
	startconnect:false,
	autoexcute:false,
	connecting:false,
	connect:function(){
		//this.ws.readyState=2;
		//this.ws.connected=true;
		//return;
		if(this.startconnect)return;
		//this.connected=true;
		//return;
		this.startconnect=true;
		if(window.endpoint){
			try{
				if(location.protocol !== "https:"){
					this.ws=new WebSocket("ws://sangtacviet.com"+window.endpoint);
					this.connecting=true;
				}
				else{
					this.ws=new WebSocket("wss://sangtacviet.com"+window.endpoint);
					this.connecting=true;
				}
			}catch(errr){
				try {
					this.ws=new WebSocket("wss://sangtacviet.com"+window.endpoint);
					this.connecting=true;
				} catch(e) {
					this.ws={
						send:function(){void(0);}
					}
				}
			}
		}else{
			this.ws.readyState=2;
			this.connected=true;
		}
		this.ws.onopen=function(){
			tse.lastpacket = new Date().getTime();
			//tse.waiting=[];
			tse.connected=true;
			tse.connecting=false;
			if(tse.autoexcute){
				excute(true);
				tse.autoexcute=false;
			}
			while (tse.waiting.length > 0) {
				var ppacket = tse.waiting.pop();
				this.send(ppacket);
			}
			//clearInterval(tse.monitor);
			//tse.monitor=setInterval(function(){
			//	if(new Date().getTime() - tse.lastpacket > 3500){
			//		tse.ws.close();
			//		clearInterval(tse.monitor);
			//	}
			//}, 500);
		}
		this.ws.onmessage=function(mes){
			var id = parseInt(mes.data.substring(0, 8));
			tse.capture[id].down=mes.data.substring(8);
			try{
				tse.capture[id].callback(tse.capture[id].down);
			}
			catch(except){
				if(true||window.debug){
					console.log(except);
					console.log(tse.capture[id].callback.toString());
					console.log(tse.capture[id].up);	
				}
			}
			tse.pending=tse.pending-1;
			if(tse.pending==0){
				tse.onall();
			}
		}
		this.ws.onerror=function(event){
		    tse.connecting=false;
		}
	},
	lastpacket:0,
	monitor:false,
	reconnect:function(){
		if(this.ws.readyState==3){
			this.connected=false;
			this.startconnect=false;
			this.connect();
		}
	},
	pad:function(n, width, z) {
	    z = z || '0';
	    n = n + '';
	    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	},
	messageid:1,
	pending:0,
	waiting:[],
	send:function(type,data,callback){
		if(this.ws.readyState==3){
			this.reconnect();
		}
		if(type=="001"){
			if(data=="|"||data=="")return;
			var mea=phrasetree.getmean(data).split("=");
			if(mea.length>1){
				var pk={};
				pk.down=mea[1];
				pk.callback=callback;
				pk.callback(mea[1]);
				return;
			}else if(!window.endpoint){
				this.formXhr(data,function(d){
					var pk={};
					pk.down=d;
					pk.callback=callback;
					pk.callback(d);
				});
				return;
			}
		}
		if(type=="008"){
			if(data=="|"||data=="")return;
			var mea=phrasetree.getmean(data).split("=");
			if(mea.length>1){
				var pk={};
				pk.down=mea[1];
				pk.callback=callback;
				pk.callback(mea[1]);
				return;
			}else if(!window.endpoint){
				this.formXhrMM(data,function(d){
					var pk={};
					pk.down=d;
					pk.callback=callback;
					pk.callback(d);
				});
				return;
			}
		}
		if(type=="007"){
			if(data=="|"||data=="")return;
			var mea=phrasetree.getmean(data);
			if(mea!=""){
				var pk={};
				pk.down=mea;
				pk.callback=callback;
				try{
					pk.callback(mea);
				}catch(xx){}
				return;
			}
			else if(window.endpoint){
				type="004";
			}else{
				this.formXhr(data,function(d){
					var cmb1 = data.split("|");
					var cmb2 = d.split("|");
					var cmbl = [];
					for(var k=0;k<cmb1.length;k++){
						cmbl.push(convertohanviets(cmb1[k]) + "=" + cmb2[k]);
					}
					var pk={};
					pk.down=cmbl.join("|");
					pk.callback=callback;
					try{
						pk.callback(pk.down);
					}catch(xx){}
				});
				return;
			}
		}
		if(type=="005"){
			if(data=="")return;
			else if(!window.endpoint){
				this.formXhr3(data,function(d){
					if(d.contain("|")){
						d="false";
					}
					var pk={};
					pk.down=d;
					pk.callback=callback;
					try{
						pk.callback(pk.down);
					}catch(xx){}
				});
				return;
			}
		}
		if(type=="002"&&(data=="|"||data=="")){
			var pk={};
			pk.down="=";
			pk.callback=callback;
			pk.callback("=");
			return;
		}
		if(type=="004"){
			var mn=phrasetree.getmean(data);
			if(mn){
				var pk={};
				if(mn[0]=="=")
					pk.down=convertohanviets(data)+mn;
				else{
					pk.down=mn;
				}
				pk.callback=callback;
				try{
					pk.callback(pk.down);
				}catch(xx){}
				return;
			}else if(!window.endpoint){
				this.formXhr3(data,function(d){
					var cmb1 = data.split("-");
					var cmb2 = d.split("|");
					var cmbl = [];
					for(var k=0;k<cmb1.length;k++){
						cmbl.push(convertohanviets(cmb1[k]) + "=" + cmb2[k]);
					}
					var pk={};
					pk.down=cmbl.join("|");
					pk.callback=callback;
					try{
						pk.callback(pk.down);
					}catch(xx){}
					//var pk={};
					//pk.down=convertohanviets(data) + "=" + d;
					//pk.callback=callback;
					//try{
					//	pk.callback(pk.down);
					//}catch(xx){}
				});
				return;
			}
		}
		var pk = {};
		pk.id=this.messageid;
		var pa=this.pad(pk.id,8);
		pk.type=type;
		pk.up=data;
		pk.callback=callback||pk.callback;
		this.capture[pk.id]=pk;
		try {
			if(!this.ws.readyState==WebSocket.OPEN && window.endpoint){
				this.waiting.push(pa+pk.type+data);
			}
			else if(window.endpoint){
				this.ws.send(pa+pk.type+data);
				this.lastpacket = new Date().getTime();
			}else{
			}
		} catch(e) {
			console.log(e);
		}
		this.messageid++;
		this.pending++;
	},
	onall:function(){
	},
	capture:{},
	xhrPending:false,
	xhrPending2:false,
	xhrPending3:false,
	formXhr:function(msg,calb){
		if(this.xhrPending==false){
			var pendingMsg = {};
			pendingMsg.msg = [];
			pendingMsg.pending = [];
			pendingMsg.timer = setTimeout(function(){
				pendingMsg.send();
			}, 1000);
			pendingMsg.send = function(){
				window.tse.xhrPending=false;
				var reference = this;
				ajaxUrl(getDomain("https://comic.sangtacvietcdn.xyz/tsm.php"),"sajax=trans&ngmar=trans&content="+encodeURIComponent(this.msg.join("<split>")),function(down){
					var rspList=down.toLowerCase().split("<split>");
					for(var i=0;i<rspList.length;i++){
						var packet = {
							down: rspList[i].trim(),
							callback : reference.pending[i]
						}
						packet.callback(packet.down);
					}
					//replaceName();
					//meanSelector();
				},"/index.php");
			}
			pendingMsg.add = function(msg,calb){
				this.pending.push(calb);
				this.msg.push(msg);
			}
			this.xhrPending = pendingMsg;
		}
		this.xhrPending.add(msg,calb);
	},
	formXhr2:function(msg,calb){
		if(this.xhrPending2==false){
			var pendingMsg = {};
			pendingMsg.msg = [];
			pendingMsg.pending = [];
			pendingMsg.timer = setTimeout(function(){
				pendingMsg.send();
			}, 1000);
			pendingMsg.send = function(){
				window.tse.xhrPending2=false;
				var reference = this;
				ajax("sajax=worddict&content="+encodeURIComponent(this.msg.join("<split>")),function(down){
					var rspList=down.substring(1).toLowerCase().split("<split>");
					for(var i=0;i<rspList.length;i++){
						var packet = {
							down: rspList[i].trim(),
							callback : reference.pending[i]
						}
						packet.callback(packet.down);
					}
				});
			}
			pendingMsg.add = function(msg,calb){
				this.pending.push(calb);
				this.msg.push(msg);
			}
			this.xhrPending2 = pendingMsg;
		}
		this.xhrPending2.add(msg,calb);
	},
	formXhr3:function(msg,calb){
		if(this.xhrPending3==false){
			var pendingMsg = {};
			pendingMsg.msg = [];
			pendingMsg.pending = [];
			pendingMsg.timer = setTimeout(function(){
				pendingMsg.send();
			}, 350);
			pendingMsg.send = function(){
				window.tse.xhrPending3=false;
				var reference = this;
				ajaxUrl(getDomain("https://comic.sangtacvietcdn.xyz/tmm.php"),"sajax=transmulmean&ngmar=transmulmean&wp=1&content="+encodeURIComponent(this.msg.join("<split>")),function(down){

					var rspList=down.toLowerCase().split("<split>");
					for(var i=0;i<rspList.length;i++){
						var packet = {
							down: rspList[i].trim(),
							callback : reference.pending[i]
						}
						packet.callback(packet.down);
					}
				},"/index.php");
			}
			pendingMsg.add = function(msg,calb){
				this.pending.push(calb);
				this.msg.push(msg);
			}
			this.xhrPending3 = pendingMsg;
		}
		this.xhrPending3.add(msg,calb);
	}
};

var callb=[];
var store = localStorage;
var calfunc={
	func:function(e){},
	excute:function(e){func(e);isrunned=true;},
	isrunned:false
}
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}
function findsel(){
	if(window.isMobile){
		return;
	}
	var sel = getSelectionText();
	if(sel!=""){
		g("fastseltext").value=sel;
		g("fastgentext").value=titleCase(sel);
	}
}
function bigsel(){
	
}
function arrtoobj(arr){
	var obj={};
	for(var i=0;i<arr.length;i++){
		obj[arr[i]]=true;
	}
	obj.indexOf = function(find){
		if(find in this)return 1;
		return -1;
	}
	obj.have=function(find) {
		return find in this;
	}
	return obj;
}
function arrstoobj(arrs){
	var obj={};
	var l;
	for(var c=0;c<arrs.length;c++){
		l=arrs[c].length;
		for(var i=0;i<l;i++){
			obj[arrs[c][i]]=true;
		}
	}
	obj.indexOf = function(find){
		if(find in this)return 1;
		return -1;
	}
	obj.have=function(find) {
		return find in this;
	}
	return obj;
}
function fastAddNS(){
	var left = g("fastseltext");
	var right = g("fastgentext");
	if(left!=""){
		namew.value += "\n"+left.value+"="+right.value;
	}
	saveNS();
}
var runned=false;
function joinfromto(arr,st,en){
	var str="";
	for(var i=st;i<=en;i++){
		str+=arr[i];
	}
	return str;
}
Array.prototype.joinlast = function(last){
	for(var i=0;i<last;i++)this.shift();
	return this.join("=");
};
function flushToView() {
	var tmpct = g(contentcontainer);
	g("tmpcontentview").innerHTML=tmpct.innerHTML//.replace(/<\/?p>/g,"<br>")
		.replace(/ ,/g,",").replace(/<br>/g,"<p>").replace(/<br \/>/g,"</p>")
		.replace(/ \./g,".");//.replace(/ (<i.*?><\/i>),/g,"$1,");
	g("tmpcontentview").id=contentcontainer;
	tmpct.id="tmpcontentdiv";
}
function pushFromView(){
	var tmpct = g("tmpcontentdiv");
	tmpct.innerHTML=g(contentcontainer).innerHTML.replace(/<p>/g,"<br>").replace(/<\/p>/g,"<br />");//.replace(/<br>/g)
	g(contentcontainer).id="tmpcontentview";
	tmpct.id=contentcontainer;
}
function excute(invokeMeanSelector){
	if(g(contentcontainer)==null)return;
	if(typeof(thispage)=="undefined")return;
	if(!defined)return;
	if(getCookie("foreignlang") && getCookie("foreignlang") != "vi"){
		return;
	}
	if(getCookie("transmode") == "chinese"){
		return;
	}
	if(dictionary && dictionary.finished==false){
		dictionary.readTextFile("//sangtacviet.com/wordNoChi.htm?update=1");
		phrasetree.load();
		tse.connect();
		return;
	}
	if(tse.ws.readyState!=1){
		tse.autoexcute=true;
		tse.connect();
	}
	var curl = document.getElementById("hiddenid").innerHTML.split(";");
	var book=curl[0];
	var chapter = curl[1];
	var host = curl[2];
	if(host=="sangtac")return;
	hideNb();
	//if(g("tmpcontentdiv")){
	//	pushFromView();
	//}
	
	if(host!="dich")
	fastNaming();
	prediction.enable=true;
	if(window.endpoint){
		
	}
	var reg;
	if(window.setting!=null&&window.setting.onlyonename){
		reg= store.getItem("qtOnline0");
	}else
	reg = store.getItem(host+book);
	if(reg==null){
		reg = store.getItem(book);
		if(reg!=null){
			store.setItem(host+book,reg);
		}
	}
	if(reg!=null || window.bookHaveDefaultName){
		if(!reg){
			reg = "";
		}
		var rowlist = reg.split("~//~");
		if(window.namew==null){
			window.namew=g("namewd");
		}
		if(namew==null){
			setTimeout(function(){
				excute();
			}, 500);
			return;
		}
		namew.value=rowlist.join("\n");
		// if(!window.setting && window.bookHaveDefaultName){
		// 	setTimeout(function(){
		// 		excute();
		// 	}, 500);
		// 	return;
		// }
		if(window.bookHaveDefaultName && window.setting && !window.setting.disabledefaultname){
			var dfname = window.bookDefaultName.split("\n");
			dfname.forEach(function(e){
				if(e!=""){
					var row = e.split("=");
					if(row.length<2){}
					else{
						if(row[0]!=""){
							if(row[0].charAt(0)=="@"){
								row[0]=row[0].substring(1).split("|");
								if(row[1]!=null)
									row[1]=row[1].split("|");
								replaceByNode(row[0],row[1]);
							}else 
							if(row[0].charAt(0)=="#"){
								dictionary.set(row[0].substring(1),row[1]);
							}else 
							if(row[0].charAt(0)=="$"){

								var sear=row[0].substring(1);
								var rep=row.joinlast(1);
								if(sear.length==1){
									if(convertohanviets(sear)==rep.toLowerCase()){
										return;
									}
								}
								if(true){

									dictionary.set(sear,rep);
									nametree.setmean(sear,"="+rep);
								}else
								replaceOnline(sear,rep);
							}else 
							if(row[0].charAt(0)=="~"){
								meanengine(e.substr(1));
							}
							else{
								toeval2+="replaceByRegex(\""+eE(row[0])+"\",\""+eE(row[1])+"\");";
							}
						}
						
					}

				}
			});
		}
		rowlist.forEach(function(e){
			if(e!=""){
				var row = e.split("=");
				if(row.length<2){
					
				}
				else{
					if(row[0]!=""){
						if(row[0].charAt(0)=="@"){
							row[0]=row[0].substring(1).split("|");
							if(row[1]!=null)
								row[1]=row[1].split("|");
							replaceByNode(row[0],row[1]);
						}else 
						if(row[0].charAt(0)=="#"){
							dictionary.set(row[0].substring(1),row[1]);
						}else 
						if(row[0].charAt(0)=="$"){
							var sear=row[0].substring(1);
							var rep=row.joinlast(1);
							if(sear.length==1){
								if(convertohanviets(sear)==rep.toLowerCase()){
								//	return;
								}
							}
							if(window.setting&&window.setting.allownamev3){
								dictionary.set(sear,rep);
								nametree.setmean(sear,"="+rep);
							}else
							replaceOnline(sear,rep);
						}else 
						if(row[0].charAt(0)=="~"){
							meanengine(e.substr(1));
						}
						else{
							toeval2+="replaceByRegex(\""+eE(row[0])+"\",\""+eE(row[1])+"\");";
						}
					}
					
				}

			}
		});

	}
	replaceVietphrase();
	if(window.setting&& window.setting.allownamev3){
		replaceName();
	}
	needbreak=false;
	//meanstrategy.invoker= !meanstrategy.invoker ? setTimeout(function(){
	//		
	//}, 10) : 0;
	meanengine.usedefault();
	if(!tse.connecting){
		if(invokeMeanSelector==null || invokeMeanSelector!==false){
			window.meanSelectorCheckpoint = 0;
			if(window.lazyProcessor){
				window.lazyProcessor.clear();
			}
			meanSelector();
			setTimeout(function(){
				//replaceName();
			}, 1200);
		}
	}
	
	setTimeout(doeval,100);
	runned=true;
}
function talkDetection(){
	if(q("#"+contentcontainer + " i.talk").length>0){
		return;
	}
	console.time("talkDetection");
	var nodes = q('[id^="exran"]');
	var fullNodes = flatNodes();
	for(var i=0;i<nodes.length;i++){
		var node = nodes[i];
		if(node.textContent.contain("“")){
			(function(nodes,start){
				var end = start;
				var count = 0;
				var max = 30;
				var n = nodes[start+1];
				while(n!=null && count<max){
					if(n.textContent.contain("”")){
						end = start+count+1;
						break;
					}
					count++;
					n = nodes[start+count+1];
				}
				if(end>start){
					for(var i=start;i<=end;i++){
						if(nodes[i].tagName == "I"){
							nodes[i].classList.add("talk");
						}
					}
				}
			})(fullNodes, fullNodes.indexOf(node));
		}
	}
	console.timeEnd("talkDetection");
}
function excuteApp(invokeMeanSelector){
	if(g(contentcontainer)==null)return;
	if(typeof(thispage)=="undefined")return;
	if(!defined)return;
	if(getCookie("foreignlang") && getCookie("foreignlang") != "vi"){
		return;
	}
	if(getCookie("transmode") == "chinese"){
		return;
	}
	if(dictionary.finished==false){
		dictionary.readTextFile("//sangtacviet.com/wordNoChi.htm?update=1");
		phrasetree.load();
		tse.connect();
		return;
	}
	var curl = document.getElementById("hiddenid").innerHTML.split(";");
	var book=curl[0];
	var chapter = curl[1];
	var host = curl[2];
	if(host=="sangtac")return;
	
	if(host!="dich")
	fastNamingApp();
	talkDetection();
	prediction.enable=true;
	var rowlist = namew.value.split("\n").concat(namew.valueglobal.split("\n"));
	
	if(window.bookHaveDefaultName && window.setting && !window.setting.disabledefaultname){
		var dfname = window.bookDefaultName.split("\n");
		dfname.forEach(function(e){
			if(e!=""){
				var row = e.split("=");
				if(row.length<2){}
				else{
					if(row[0]!=""){
						if(row[0].charAt(0)=="@"){
							row[0]=row[0].substring(1).split("|");
							if(row[1]!=null)
								row[1]=row[1].split("|");
							replaceByNode(row[0],row[1]);
						}else 
						if(row[0].charAt(0)=="#"){
							dictionary.set(row[0].substring(1),row[1]);
						}else 
						if(row[0].charAt(0)=="$"){

							var sear=row[0].substring(1);
							var rep=row.joinlast(1);
							if(sear.length==1){
								if(convertohanviets(sear)==rep.toLowerCase()){
									return;
								}
							}
							if(true){

								dictionary.set(sear,rep);
								nametree.setmean(sear,"="+rep);
							}else
							replaceOnline(sear,rep);
						}else 
						if(row[0].charAt(0)=="~"){
							meanengine(e.substr(1));
						}
						else{
							toeval2+="replaceByRegex(\""+eE(row[0])+"\",\""+eE(row[1])+"\");";
						}
					}
					
				}

			}
		});
	}
	rowlist.forEach(function(e){
		if(e!=""){
			var row = e.split("=");
			if(row.length<2){
				
			}
			else{
				if(row[0]!=""){
					if(row[0].charAt(0)=="@"){
						row[0]=row[0].substring(1).split("|");
						if(row[1]!=null)
							row[1]=row[1].split("|");
						replaceByNode(row[0],row[1]);
					}else 
					if(row[0].charAt(0)=="#"){
						dictionary.set(row[0].substring(1),row[1]);
					}else 
					if(row[0].charAt(0)=="$"){
						var sear=row[0].substring(1);
						var rep=row.joinlast(1);
						if(sear.length==1){
							if(convertohanviets(sear)==rep.toLowerCase()){
							//	return;
							}
						}
						if(window.setting&&window.setting.allownamev3){
							dictionary.set(sear,rep);
							nametree.setmean(sear,"="+rep);
						}else
						replaceOnline(sear,rep);
					}else 
					if(row[0].charAt(0)=="~"){
						meanengine(e.substr(1));
					}
					else{
						toeval2+="replaceByRegex(\""+eE(row[0])+"\",\""+eE(row[1])+"\");";
					}
				}
				
			}

		}
	});
	replaceVietphrase();
	if(window.setting&& window.setting.allownamev3){
		replaceName();
	}
	needbreak=false;
	meanengine.usedefault();
	if(!tse.connecting){
		if(invokeMeanSelector==null || invokeMeanSelector!==false){
			window.meanSelectorCheckpoint = 0;
			if(window.lazyProcessor){
				window.lazyProcessor.clear();
			}
			meanSelector();
			setTimeout(function(){
				//replaceName();
			}, 1200);
		}
	}
	
	setTimeout(doeval,100);
	runned=true;
}
function autocheck(){
	if(!runned)excute();
}
function sortname(){
	var nameTextArea = null;
	if(!window.namew){
		window.namew = document.getElementById("namewd");
		if(!window.namew){
			return;
		}
	}
	nameTextArea = window.namew;
	var str=nameTextArea.value.split("\n").sort();
	for(var i=9999;i<str.length;i++){
		if(str[i].charAt(0)=="$"){
			if(str[i+1]!=null&&(str[i+1].substring(0,str[i].split("=")[0].length)==str[i].split("=")[0])){
				if(str[i+1].length=str[i].length+1){
					if(str[i+1].lastChar()!="的"){
						str[i]="";
					}
				}
			}
		}
	}
	for(var i=0;i<str.length;i++){
		if(str[i+1]===str[i]){
			str[i+1]="";
		}
	}
	str=str.sort(function(a,b){if(a.charAt(0)=="#")return -1; else return a.split("=")[0].length - b.split("=")[0].length;});
	var lastans="";
	for(var i=0;i<str.length;i++){
		if(str[i]!=""){
			lastans+=str[i]+"\n";
		}
	}
	nameTextArea.value=lastans;
	saveNS();
}
function ensure(node,id){
	var nodelist=g(contentcontainer).childNodes;
	var exranid=0;
	nodelist.forEach(function(e){
		if(e.nodeType==3){
			if(e.textContent.match(/[^ \.,“\:\?”\!\"\*\)\(\$\^\+\@\%\|\/\=\】」「「」…《》‘’\r\n]/)){
				converttonode(e,id+"r"+exranid);
				exranid++;
			}
		}
		if(e.tagName=="p"){
			ensure(e,id+"r"+id);
		}
	});
}
function flatNodes(){
	if(q("#" + contentcontainer + " p").length>0){
		var result = [];
		var nodelist=g(contentcontainer).childNodes;
		nodelist.forEach(function(e){
			if(e.tagName=="P"){
				var nodelist2=e.childNodes;
				result = result.concat(Array.from(nodelist2));
			}else{
				result.push(e);
			}
		});
		return result;
	}
	var nodelist=g(contentcontainer).childNodes;
	return nodelist;
}
function fastNaming(){
	if(g(contentcontainer)==null)return;
	if(getCookie("transmode") == "tfms"||getCookie("transmode") == "bing"){
		return;
	}
	var nodelist= flatNodes();//g(contentcontainer).childNodes;
	var exranid=0;
	nodelist.forEach(function(e){
		if(e.nodeType==3){
			if(e.textContent===" "){
				e.isspacehidden=true;
				return;
			}
			if(e.textContent.match(/[^ \.,“\:\?”\!\"\*\)\(\$\^\+\@\%\|\/\=\】」「「」…《》‘’\r\n\u200B]/)){
				converttonode(e,"exran"+exranid);
				exranid++;
			}
			e.isexran=true;
		}
		if(e.tagName=="p"){
			ensure(e,exranid);
		}
		if(e.nodeType==8){
			e.remove();
		}
	});
	//var str = document.getElementById(contentcontainer).innerHTML;
	var keyword1 = ["《","「","『","〈","【","［","‘","“"];
	keyword1.forEach(function(e){
	//	var regx = new RegExp("("+e+")","ig");
	//	str = str.replace(regx,"<span class='fastname' style='text-transform:capitalize'>$1");
	});
	var keyword2 = ["】","］","」","』","》","〉","’","”"];
	keyword2.forEach(function(e){
	//	var regx = new RegExp("("+e+")","ig");
	//	str = str.replace(regx,"</span>$1");
		
	}); 
	
	//g(contentcontainer).innerHTML = str;
	q(".fastname").forEach(function(e){
		if(e.innerText.length>60)e.style.textTransform = "";
	});
}
function fastNamingApp(){
	if(g(contentcontainer)==null)return;
	if(getCookie("transmode") == "tfms"||getCookie("transmode") == "bing"){
		return;
	}
	var nodelist= flatNodes();
	var exranid=0;
	nodelist.forEach(function(e){
		if(e.nodeType==3){
			if(e.textContent===" "){
				e.isspacehidden=true;
				return;
			}
			if(e.textContent.match(/[^ \.,\:\?\!\"\*\)\(\$\^\+\@\%\|\/\=\】」「「」…《》‘’\r\n\u200B]/)){
				converttonode(e,"exran"+exranid);
				exranid++;
			}
			e.isexran=true;
		}
		if(e.tagName=="p"){
			ensure(e,exranid);
		}
		if(e.nodeType==8){
			e.remove();
		}
	});
}
function instring(str1,str2){
	for(var i=0;i<str2.length;i++){
		if(str1.indexOf(str2.charAt(i))>=0)return true;
	}
	return false;
}
Element.prototype.containName = function(){
	//return this.textContent.toLowerCase()!=this.textContent;
	return this.isname()||((titleCase(this.textContent)==this.textContent)&&this.textContent.indexOf(" ")>0);
};
Element.prototype.containHan = function(callback,none,nofast){
	var t=this.gT();
	if(instring(t,meanstrategy.ignore)){
		if(this.pE())
		if(!instring(t,meanstrategy.ignore2)||meanstrategy.testcommon([this.pE(),this])<2){
			return;
		}
	}
	if(this.isname())return;
	if(!nofast&&(this.textContent==this.gH()||this.containName())){
		callback();
		return;
	}
	if(t in meanstrategy.database){
		if(meanstrategy.database[t].toLowerCase().indexOf(this.gH())>=0){
			callback(meanstrategy.database[t]);
		}
		return;
	}
	var _self=this;
	var mean=phrasetree.getmean(t);
	if(mean!=""){
		mean=mean.split("=")[1];
		if(mean!=null){
			if(mean.toLowerCase().indexOf(this.gH())>=0){
				callback(mean);
			}else if (none!=null) {
				none();
			}
		}
		
	}else if(this.mean()){
		if(this.mean().toLowerCase().indexOf(this.gH())>=0){
			callback(this.mean());
		}else if (none!=null) {
			none();
		}
	}
	else
	tse.send("001",t,function(){
		meanstrategy.database[this.up]=this.down;
		if(_self.isname())return;
		if(this.down.toLowerCase().indexOf(_self.gH())>=0){ 
			callback(this.down);
		}else if (none!=null) {
			none();
		}
	});
};
Element.prototype.containHan2 = function(nofast){
	var t=this.gT();
	if(instring(t,meanstrategy.ignore)){
		if(this.pE())
		if(!instring(t,meanstrategy.ignore2)||meanstrategy.testcommon([this.pE(),this])<2){
			return false;
		}
	}
	if(this.isname())return false;
	if(!nofast&&(this.textContent==this.gH()||this.containName())){
		return this.textContent;
	}
	var _self=this;
	var mean=phrasetree.getmean(t).trim();
	if(mean!=""){
		mean=mean.split("=")[1];
		if(mean!=null){
			if(mean.toLowerCase().indexOf(this.gH())>=0){
				return mean;
			}
		}
		
	}else if(this.mean()){
		var m = this.mean().trim();
		if(m.length >= 1 && m.toLowerCase().indexOf(this.gH())>=0){
			return this.mean();
		}
	}
	return false;
};
Element.prototype.mean =function(){
	return this.getAttribute("v");
}
Element.prototype.near=function(end){
	if(end){
		var walked=0;
		var nod=this;
		for(var i=0;i<3;i++){
			if(nod.nextSibling!=null){
				walked+=nod.gT().length;
				if(walked>7)return false;
				if(/[\.,]/.test(nod.nextSibling.textContent)){
					return true;
				}
				nod=nod.nextElementSibling;
				if(!nod){
					return true;
				}
				if(nod.tagName=="BR")return true;
			}else return true;
		}
		return false;
	}else {
		var walked=0;
		var nod=this;
		for(var i=0;i<3;i++){
			if(nod.previousSibling!=null){
				walked+=nod.gT().length;
				if(walked>7)return false;
				if(/[\.,]/.test(nod.previousSibling.textContent)){
					return true;
				}
				nod=nod.previousElementSibling;
				if(!nod)return true;
				if(nod.tagName=="BR")return true;
			}else return true;
		}
		return false;
	}
}
Element.prototype.pE = function(){
	return this.previousElementSibling;
};
Element.prototype.nE = function(){
	return this.nextElementSibling;
};
Element.prototype.gT = function(){
	return this.cn||this.getAttribute("t")||"";
};
Element.prototype.gP = function(){
	return this.getAttribute("p")||"";
};
Element.prototype.gH = function(){
	return this.getAttribute("h")||"";
};
Element.prototype.isname = function(){
	return this.getAttribute("isname")==="true";
};
Element.prototype.tomean = function(mean) {
	if(mean==""){
		this.textContent="";
		return;
	}
	//if(this.pE() && this.pE().tagName!="BR"){
	if(!isUppercase(this)){
		//if(this.previousSibling.textContent.indexOf(".")>-1){
		//	this.textContent=mean[0].toUpperCase() + mean.substring(1);
		//}else
		this.textContent=mean;
	}else{
		this.textContent=mean[0].toUpperCase() + mean.substring(1);
	}
};
Element.prototype.getmean = function(callb){
	if(this.gT() in meanstrategy.database){
		callb(meanstrategy.database[this.gT()]);
	}else {
		tse.send("001",this.gT(),function(){
			meanstrategy.database[this.up]=this.down.trim();
			callb(this.down.trim());
		});
	}
};
Element.prototype.isspace = function(right){
	if(right){
		if(this.isRightSpace != undefined){
			return this.isRightSpace;
		}
		var next = this.nextSibling;
		if(!next || next.tagName=="BR" || next.textContent.trim()!==""){
			this.isRightSpace = false;
			return false;
		}else{
			this.isRightSpace = true;
			return true;
		}
	}
	else {
		if(this.isLeftSpace != undefined){
			return this.isLeftSpace;
		}
		var prev = this.previousSibling;
		if(!prev || prev.tagName=="BR" || prev.textContent.trim()!==""){
			this.isLeftSpace = false;
			return false;
		}else{
			this.isLeftSpace = true;
			return true;
		}
	}
///	if(right)return this.nextSibling!=null&&this.nextSibling.textContent===" ";
//	else {
//		return this.previousSibling!=null&&this.previousSibling.textContent===" ";
//	}
	if(right)return this.nextSibling!=null&&(this.nextSibling.textContent===" "||this.nextSibling.isspacehidden);
	else {
		return this.previousSibling!=null&&(this.previousSibling.textContent===" "||this.previousSibling.isspacehidden);
	}
};
String.prototype.splitn=function(n){
	var arr=[];
	var str="";
	var chars=0;
	for(var i=0;i<this.length;i++){
		str+=this.charAt(i);
		chars++;
		if(n==chars){
			arr.push(str);
			str="";
			chars=0;
		}
	}
	if(str!="")arr.push(str);
	return arr;
}
var looper={
	search:function(node,right,max,find,senonly){
		if(right){
			for(var i=0;i<max;i++){
				node=node.nE();
				if(node==null)return false;
				if(senonly&&!node.isspace(false))return false;
				if(node.gT()[0]==find){
					return node;
				}
			}
		}else{
			for(var i=0;i<max;i++){
				node=node.pE();
				if(node==null)return false;
				if(senonly&&!node.isspace(true))return false;
				if(node.gT().lastChar()==find){
					return node;
				}
			}
		}
		return false;
	},
	searchphrase:function(node,right,max,find,senonly){
		if(right){
			for(var i=0;i<max;i++){
				node=node.nE();
				if(node==null)return false;
				if(senonly&&!node.isspace(false))return false;
				if(node.gT().indexOf(find)==0){
					return node;
				}
			}
		}else{
			for(var i=0;i<max;i++){
				node=node.pE();
				if(node==null)return false;
				if(senonly&&!node.isspace(true))return false;
				if(node.gT().endwith(find)){
					return node;
				}
			}
		}
		return false;
	},
	searchphraseex:function(node,right,max,find,senonly){
		if(right){
			for(var i=0;i<max;i++){
				node=node.nE();
				if(node==null)return false;
				if(senonly&&!node.isspace(false))return false;
				for(var j=0;j<find.length;j++)
				if(node.gT().indexOf(find[j])==0){
					return node;
				}
			}
		}else{
			for(var i=0;i<max;i++){
				node=node.pE();
				if(node==null)return false;
				if(senonly&&!node.isspace(true))return false;
				for(var j=0;j<find.length;j++)
				if(node.gT().endwith(find[j])){
					return node;
				}
			}
		}
		return false;
	},
	searchex:function(node,right,max,find,senonly){
		if(right){
			for(var i=0;i<max;i++){
				node=node.nE();
				if(node==null)return false;
				if(senonly&&!node.isspace(false))return false;
				if(find.indexOf(node.gT()[0])>-1){
					return node;
				}
			}
		}else{
			for(var i=0;i<max;i++){
				node=node.pE();
				if(node==null)return false;
				if(senonly&&!node.isspace(true))return false;
				if(find.indexOf(node.gT().lastChar())>-1){
					return node;
				}
			}
		}
		return false;
	}
}
function pIsNewLine(node){
	if(node.pE()){
		return node.pE().tagName=="BR";
	}else return true;
}
function isUppercase(node){
	if(node.push){
		node = node[0];
	}
	if(node.pE()){
		if(node.pE().tagName=="BR"){
			return true;
		}else return /[《:\.“]/.test(node.previousSibling.textContent);
	}else return true;
}
function ucFirst(t){
	if(t.length > 0)
		return t[0].toUpperCase() + t.substring(1);
	return "";
}
function getDefaultMean(node){
	if(!node.getAttribute){
		return node.textContent;
	}
	var m =  node.getAttribute("v");
	if(typeof m !="undefined" && m!=null){
		return m.split("/")[0] || "";
	}else if(m==null){
		console.log(node);
	}
	return node.gH();
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var meanstrategy={
	"collected":"",
	"nodelist":{},
	"highlight":function(node,type){
		try{
		if(setting.highlight===true){
			switch (type) {
				case "f":
					node.style.backgroundColor = '#78aafa';
					break;
				case "m":
					node.style.backgroundColor = '#eeeeee';
					break;
				case "o":
					node.style.backgroundColor = '#38ff38';
					break;
				case "s":
					node.style.backgroundColor = '#8fceab';
					break;
				case "e":
					node.style.backgroundColor = '#d866ff';
					break;
				case "i":
					node.style.backgroundColor = '#80fafd';
					break;
				case "ln":
					node.style.backgroundColor = '#bae7b4';
				default:break;
			}
		}
		}catch(xxx){}
	},
	"countname":function(right,start,max){
		if(!right){
			var pnum = 0;
			var count = 0;
			var curnod = start;
			while (pnum < max && curnod.previousElementSibling != null) {
				pnum++;
				curnod = curnod.previousElementSibling;
				if(curnod.containName()){
					count++;
				}
			}
			return count;
		}else {
			var pnum = 0;
			var count = 0;
			var curnod = start;
			while (pnum < max && curnod.nextElementSibling != null) {
				pnum++;
				curnod = curnod.nextElementSibling;
				if(curnod.containName()){
					count++;
				}
			}
			return count;
		}
	},
	scope:function(node,type){
		if(!setting.scopefilter){
			return;
		}
		var curnod=node.nextSibling;
		var nodlist=[];
		var walked=0;
		var flag=false;
		var tester=this.database.scope.close.charAt(this.database.scope.open.indexOf(type));
		var breaker=/[.;:,?!]/;
		var looped=0;
		while (curnod!=null) {
			looped++;
			if(looped>10)return;
			if(curnod.nodeType==Element.TEXT_NODE){
				continue;
			}
			var cn = curnod.gT ? curnod.gT() : "";
			walked+=cn.length;
			if(walked>6)return;
			nodlist.push(curnod);
			if(curnod.nextSibling!=null){
				if(curnod.nextSibling.textContent.indexOf(tester)>-1){
					flag=1;
					break;
				}
				if(breaker.test(curnod.nextSibling.textContent)){
					return;
				}
			}
			if(!curnod.nE){
				return;
			}
			curnod=curnod.nE();
			if(curnod==null||curnod.tagName=="BR"){
				return;
			}
		}
		if(flag){
			nodlist.forEach( function(e) {
				e.containHan(function(){
					e.textContent=meanstrategy.testsuffix(e.gT(),titleCase(e.gH()));
				});
			});
			if(walked<6){
				if(type!="‘")
				analyzer.update(nodlist.sumChinese(),3);
			}
		}
	},
	worddelay:function(node){
		if(node.previousSibling
			&&node.previousSibling.tagName=='I'
			&&node.previousSibling.gT().length==1
		){
			if(node.nextSibling
				&&node.nextSibling.tagName=='I'
				&&node.nextSibling.gT().charAt(0)==node.previousSibling.gT()
				&&!this.database.pronoun.contain(node.previousSibling.gT())
			){
				var neww=node.nextSibling.innerHTML.split(" ")[0]; //titleCase(node.previousSibling.gH());
				if(node.previousSibling.gT() in this.database.preposition){
					neww=titleCase(this.database.preposition[node.previousSibling.gT()]);
				}
				node.previousSibling.textContent=neww;
				if(node.nextSibling.gT().length==1){
					//node.nextSibling.innerHTML=neww;
				}
				this.highlight(node,"m");
			}
		}
	},
	meancomparer:function(arr1,arr2,allowback){
		for(var i=0;i<arr1.length;i++){
			var tx=arr1[i].split(" ");
			var lastword=tx.pop();
			for (var j = 0; j < arr2.length; j++) {
				if(lastword==arr2[j].split(" ")[0]){
					tx=tx.join(" ").trim() +" "+ arr2[j].trim();
					if(allowback){
						tx=tx.replace("giá","cái này")
						.replace("năng","có thể");
					}
					return {
						code:true,
						new:tx
					};
				}
			}
		}
		return {code:false};
	},
	wordconnector:function(node){
		if(this.connectignore.indexOf(node.gT())>-1)return;
		if(node.isspace(false)){
			try{
				if(node.pE()!=null){
					if(node.pE().isname())return;
					if(node.pE().gT().length>3||node.pE().gT()<2)return;
					node.pE().getmean(function(mean1){
						if(!node.pE()){
							return;
						}
						var phrase=[node.pE(),node].sumChinese("");
						var chi2=phrase.substring(node.pE().gT().length-1);
						meanstrategy.database.getmean(chi2,function(mean2){
							if(mean2=="false")return;
							mean1=mean1.split("/");
							mean2=mean2.split("/");
							var ret={code:false};
							if (/[这能]/.test(node.pE().gT())) {
								ret=meanstrategy.meancomparer([node.pE().gH()],mean2,true);
								if(ret.code){
									node.pE().innerHTML=ret.new;
									node.pE().setAttribute("t", phrase);
									node.pE().cn=phrase;
									node.pE().setAttribute("h", node.pE().gH()+" "+node.gH());
									meanstrategy.highlight(node.pE(),"m");
									node.innerHTML="";
									node.setAttribute("h","");
									node.setAttribute("t","");
									node.cn="";
									node.remove();
								}
							}
							if(!ret.code){
								ret=meanstrategy.meancomparer(mean1,mean2);
								if(ret.code){
									node.pE().innerHTML=ret.new;
									node.pE().setAttribute("t", phrase);
									node.pE().cn=phrase;
									node.pE().setAttribute("h", node.pE().gH()+" "+node.gH());
									meanstrategy.highlight(node.pE(),"m");
									node.innerHTML="";
									node.setAttribute("h","");
									node.setAttribute("t","");
									node.cn="";
									node.remove();
								}
							}
						});
					});
				}
			}catch(e){}
		}
	},
	//inode: @locate
	loctransform:function(node,mean1,mean2){
		return;
		if(node.innerHTML!=""&&!node.innerHTML.contain(mean2))return;
		var nd=looper.searchex(node,false,3,'在从于',true);
		if(nd){
			var nmean = "";
			var mean3 = mean2;
			if(nd.nE().gT()=="这"){
				nmean="này";
				nd.nE().innerHTML="";
			}
			if(nd.nE().gT()=="这个"){
				nmean="này";
				nd.nE().innerHTML="";
				mean2+=" cái";
			}
			if(node.gT().length==1){
				nd.innerHTML+=" "+mean2;
				if(nmean != ""){
					//node.innerHTML=node.innerHTML.replace(mean1,"").replace(mean3,"").replace("này","") + "này";
					node.innerHTML=nmean;
				}else
				node.innerHTML=node.innerHTML.replace(mean1,"").replace(mean2,"");
			}
			else{
				var m=getDefaultMean(nd)+" "+getDefaultMean(node);
				if(pIsNewLine(nd)){
					m = capitalizeFirstLetter(m);
				}
				nd.innerHTML=m;
				this.highlight(nd,"m");
				node.innerHTML=nmean;
			}
			return true;
		}
		return false;
	},
	"一一":function(node){
		if(!node.nE() || (node.nE().tagName=="BR") || !node.isspace(true)){
			node.innerHTML="一一";
		}
	},
	"_L":function(node){
		return;
		if(node.pE()){
			if(/^một/i.test(node.pE().textContent)){
				var r = /^(trong |ngoài |trên |dưới )/i;
				if(r.test(node.textContent)){
					var m = r.exec(node.textContent);
					node.pE().textContent = m[1] + node.pE().textContent.toLowerCase();
					if(isUppercase(node.pE())){
						node.pE().textContent = ucFirst(node.pE().textContent);
					}
					node.textContent = node.textContent.replace(r, "");
					this.highlight(node,"m");
				}
			}
		}
	},
	tokensregex:function(node,least,alter,end){
		if(!setting.tokensregex)return;
		least=least || 2;
		end=end||"的";
		var cnl = node.cn.length;
		var nl = [node];

		for(var i=0;i<5;i++){
			node=node.nE();
			if(!node || !node.isspace(false) || node.cn.contain("的")){
				break;
			}
			nl.push(node);
			cnl+=node.cn.length;
		}
		for(;nl.length>0;){
			if(this.testcommon(nl) >= least){
				if(alter){
					alter(nl);
				}else{
					for(var i=0;i<nl.length;i++){
						nl[i].textContent=titleCase(nl[i].textContent);
					}
					this.addname(3,nl.sumChinese(""),nl.sumHan(),"titleCase");
				}
				return;
			}
			nl.pop();
		}
	},
	"名为":function(node){
		if(node.nE() && node.nE().textContent.length > 0)
		if(node.nE().textContent[0].toLowerCase() == node.nE().textContent[0]){
			//this.tokensregex(node.nE(),1,function(nl){
				//console.log(nl.sumHan());
			//});
			this.tokensregex(node.nE(),1);
		}
	},
	"一个叫":function(node){
		if(node.nE() && node.nE().textContent[0])
		if(node.nE().textContent[0].toLowerCase() == node.nE().textContent[0]){
			//this.tokensregex(node.nE(),1,function(nl){
				//console.log(nl.sumHan());
			//});
			this.tokensregex(node.nE(),1);
		}
	},
	"的话":function(node) {
		if(node.isspace(true)){
			node.tomean("lời nói");
		}else if(node.nextSibling && !(node.nextSibling.textContent.contain(","))){
			node.tomean("lời nói");
		}
	},
	"话":function (node) {
		if(node.pE() && node.pE().gT().lastChar()=="的"){
			if(node.nextSibling && node.nextSibling.textContent.contain(",")){
				node.tomean("mà nói");
			}
		}else if(looper.searchphrase(node,false,10,"如果")){
			node.tomean("mà nói");
		}
	},
	"人":function (node) {
		if(node.pE()){
			if(node.pE().gT().lastChar() =="的"){
				if(node.pE().pE() && node.pE().pE().isname()){
					swapnode(node,node.pE().pE());
					//node.pE().pE().tomean("người của");
				}
			}
		}
	},
	"还给我":function(node) {
		if(!node.isspace(true)){
			node.tomean("trả cho ta");		
		}else
		prediction.parse(node,function(n,p,l,i){
			var confident = 0;
			for(i=i+1;i<l.length;i++){
				if(l[i].tag=="uj"||l[i].tag=="n"){
					confident++;
				}
			}
			if(confident == 0){
				n.tomean("còn cho ta");
			}

		},"还给");
	},
	"下落":function(node) {
		if(node.pE() && node.pE().gT().lastChar() == "的"){
			node.tomean("tung tích");
		}
	},
	"然":function(node){
		if( !node.isspace(false) ){
			node.tomean("nhưng");
		}
	},
	"若":function(node){
		if( !node.isspace(false) ){
			node.tomean("nếu");
		}
	},
	"奈何":function(node){
		if(!node.isspace(false)){
			node.tomean("làm gì");
		}
	},
	"得":function(node){
		prediction.parse(node,function(n,p,d,i){
			if(p=="ud" && !d[i+1] =="v"){
				n.tomean("được");
			}
			//if(d.length > i+1 && d[i+1].indexOf("v") >= 0){
			//	n.tomean("phải");
			//}
		});
	},
	"上":function(node){
		//return;
		this.loctransform(node,"bên trên","trên");
		return;
		if(!node.innerHTML.contain("trên"))return;
		var nd=looper.searchex(node,false,4,'在从于',true);
		if(nd){
			if(node.gT().length==1){
				nd.innerHTML+=" trên";
				node.innerHTML=node.innerHTML.replace("bên trên","").replace("trên","");
			}
			else{
				nd.innerHTML+=" "+node.innerHTML;
				node.innerHTML="";
			}
		}
	},
	"里面":function(node){
		this.loctransform(node,"bên trong","trong");
	},
	"地步":function(node){
		if(!node.isspace(true)){
			var nd=looper.search(node,false,10,'到',false);
			if(nd){
				nd.tomean(getDefaultMean(nd) +" tình cảnh");
				node.innerHTML="";
			}
		}
	},
	"光":function(node){
		if(!node.isspace(false) && looper.searchex(node,true,7,'来过就',false)){
			node.tomean("chỉ");
		}
	},
	"-下":function(node){
		this.loctransform(node,"phía dưới","dưới");
		return;
		if(!node.innerHTML.contain("dưới"))return;
		var nd=looper.searchex(node,false,4,'在从于',true);
		if(nd){
			if(node.gT().length==1){
				nd.innerHTML+=" dưới";
				node.innerHTML=node.innerHTML.replace("phía dưới","").replace("dưới","");
			}
			else{
				nd.innerHTML+=" "+node.innerHTML;
				node.innerHTML="";
			}
		}
	},
	"佷":function(node){
		if(!node.isspace(true) && node.pE() && node.pE().gT().lastChar()=="的"){
			node.tomean("vô cùng");
		}
	},
	"很":function(node){
		if(!node.isspace(true) && node.pE() && node.pE().gT().lastChar()=="的"){
			node.tomean("vô cùng");
		}
	},
	"的佷":function(node){
		if(!node.isspace(true)){
			node.tomean("vô cùng");
		}
	},
	"却是":function(node){
		if(node.isspace(false)){
			node.tomean("lại là");
		}
	},
	"所谓":function(node){
		if(!node.isspace(true)){
			node.tomean("vấn đề gì");
		}
	},
	"情":function(node){
		if(node.pE() && node.isspace(false) && node.pE().gT().lastChar() == "事"){
			node.tomean("");
		}
	},
	"不成":function(node){
		if(node.nextSibling && node.nextSibling.textContent.contain("?")){
			node.tomean("hay sao");
		}
	},
	"里边":function(node){
		this.loctransform(node,"bên trong","trong");
		return;
		if(!node.innerHTML.contain("trong"))return;
		var nd=looper.searchex(node,false,4,'在从于',true);
		if(nd){
			if(node.gT().length==1){
				nd.innerHTML+=" trong";
				node.innerHTML=node.innerHTML.replace("bên trong","").replace("trong","");
			}
			else{
				nd.innerHTML+=" "+node.innerHTML;
				node.innerHTML="";
			}
		}
	},
	"越":function(node){
		if(node.nE()&&this.containnumber(node.nE())){
			node.tomean("vượt");
		}
	},
	"应着":function(node){
		if(!node.isspace(true)){
			node.innerHTML="đáp lời";
		}
	},
	"左右":function(node){
		if(node.pE()&&this.containnumber(node.pE())){
			if(node.pE() && node.pE().pE() && (node.pE().pE().isspace(true) || node.pE().innerHTML[0] ==" ")){
				node.pE().pE().tomean( getDefaultMean(node.pE().pE()) + " trên dưới");
				node.innerHTML="";
			}else{
				if(node.pE().isspace(false)){
					node.pE().tomean("trên dưới "+getDefaultMean(node.pE()));
					node.innerHTML="";
				}else if(node.pE().innerHTML[0]==" "){
					node.pE().tomean(" trên dưới"+getDefaultMean(node.pE()));
					node.innerHTML="";
				}else{
					node.pE().tomean(" trên dưới "+getDefaultMean(node.pE()));
					node.innerHTML="";
				}
			}
		}
	},
	"左右的":function(node){
		this["左右"](node);
	},
	"令":function(node){
		if(!node.isspace(true)){
			node.tomean("lệnh");
			meanstrategy.highlight(node,"m");
		}
		if(node.pE()&&node.pE().tagName=="I"){
			if(node.pE().innerHTML.toLowerCase()==node.pE().gH()){
				node.tomean("lệnh");
				meanstrategy.highlight(node,"m");
			}
		};
	},
	"令为":function(node){
		if(node.pE()&&node.pE().tagName=="I"){
			if(node.pE().innerHTML.toLowerCase()==node.pE().gH()){
				node.tomean("lệnh làm");
				meanstrategy.highlight(node,"m");
			}
		};
	},
	"-让":function(node){
		if(!node.isspace(false)||(node.nE() && node.nE().gT().length>1)){
			node.tomean("để cho");
		}
	},
	"原来":function(node){
		if(!node.isspace(false)){
			node.tomean("thì ra");
			if(node.pE()&&node.pE().tagName=="BR"){
				node.tomean("Thì ra");
			}
			meanstrategy.highlight(node,"m");
		}
	},
	"能为":function(node){
		if(!node.isspace(true)){
			node.tomean("năng lực");
		}
	},
	"等":function(node){
		var thi=looper.search(node,true,7,"时",true);
		if(thi!=null){
		//	node.innerHTML="chờ đến lúc";
		//	thi.innerHTML="";
		//	return;
		}
		if(node.pE()!=null){
			if(/exran/.test(node.pE().id)){
				if(instring(node.pE().innerHTML,this.database.level)){
					node.tomean("đẳng");
					return;
				}
			}else if (this.database.level.contain(node.pE().gT().lastChar())) {
				node.tomean("đẳng");
				return;
			}
		}
		var balance = this.countname(false,node,4) - this.countname(true,node,4);
		if(balance>0){
			node.tomean("mấy người");
		}else if (balance<0 || !node.near(true) || node.near(false)) {
			node.tomean("chờ");
			if(node.near(true)&&!node.near(false)){
				node.tomean("các loại");
			}
		}else{
			node.textContent="các loại";
		}
		meanstrategy.highlight(node,"m");
	},	
	"等等":function(node){
		if(!node.isspace(false)&&!node.isspace(true)){
			if(node.previousSibling && node.previousSibling.textContent.contain("...")){
				node.tomean("vân vân");
			}else
			node.tomean("chờ đã");
			meanstrategy.highlight(node,"m");
		}
	},
	"当":function(node){
		var thi=looper.search(node,true,3,"是",true);
		if(thi && node.isspace(false)){
			node.textContent="coi";
		}
		if(!node.isspace(false) && node.isspace(true)){
			node.tomean("khi");
		//	thi=looper.search(node,true,10,"时",true);
		//	if(thi && !thi.isspace(true)){
		//		node.textContent="Lúc";
		//		thi.textContent=thi.innerHTML.replace("lúc", "");
		//	}
		}
	},
	"也是":function(node){
		if(!node.isspace(false)&&!node.isspace(true)){
			var n = node.nE();
			if(n && n.id && n.id.contain("ex")){
				return;
			}
			node.tomean("cũng đúng");
			meanstrategy.highlight(node,"m");
		}
	},
	"之后":function(node){
		var nd=looper.search(node,false,5,'当');
		if(nd){
			nd.tomean("sau khi");
			node.textContent="";
		}
	},
	"-手中":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().textContent="Trong tay";
				return true;
			}
		}
	},
	"心中":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			node.pE().tomean("trong lòng");
		}
	},
	"身后":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().textContent="Sau lưng";
			}
		}
	},
	"身边":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().textContent="Bên cạnh";
			}
		}
	},
	"的身边":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().textContent="Bên cạnh";
			}
		}
	},
	"-眼中":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().innerHTML="Trong mắt";
			}
		}
	},
	"身上":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().innerHTML="Trên thân";
			}
		}
	},
	"的身上":function(node){
		if(node.pE()&&node.pE().isname()&&node.isspace(false)){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().innerHTML="Trên thân";
			}
		}
	},
	"下方":function(node){
		if(node.pE()&&node.pE().isname()){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().innerHTML="Phía dưới";
			}
		}
	},
	"的手段":function(node){
		return;
		if(node.pE()&&node.pE().isname()){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().innerHTML="Thủ đoạn của";
			}else{
				node.pE().innerHTML="thủ đoạn của";
			}
		}
	},
	"的样子":function(node){
		var nd=looper.search(node,false,2,'副',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.innerHTML="";
		}
	},
	"借口":function(node){
		var nd=looper.search(node,false,5,'着',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.innerHTML="";
		}
	},
	"惯了":function(node){
		var nd=looper.search(node,false,3,'是',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.innerHTML="";
		}
	},
	"样子":function(node){
		var nd=looper.search(node,false,5,'副',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.innerHTML="";
		}
	},
	"对":function(node){
		if(node.nextSibling!=null){
			if(new RegExp(this.database.brk).test(node.nextSibling.textContent)){
				node.tomean("đúng");
				meanstrategy.highlight(node,"m");
			}
		}
	},
	"还":function(node){
		if(!node.isspace(true)){
			node.innerHTML="hoàn";
		}
	},
	"谈何":function(node){
		if(!node.isspace(true)){
			node.tomean("nói chi là");
			meanstrategy.highlight(node,"m");
		}
	},
	"面前":function(node){
		var nd=looper.searchex(node,false,3,'在',true);
		if(nd && !nd.innerHTML.contain("trước mặt")){
			nd.innerHTML+=" trước mặt";
			node.innerHTML="";
		}
	},
	"方面":function(node){
		var nd=looper.search(node,false,3,'在',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.innerHTML="";
		}
	},
	"嘴里":function(node){
		var nd=looper.search(node,false,6,'自',true)
			||looper.search(node,false,6,'从',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.innerHTML="";
		}else
		if(node.pE()&&node.pE().isname()){
			swapnode(node,node.pE());
			if(pIsNewLine(node.pE())){
				node.pE().innerHTML="Trong miệng";
			}
		}
	},
	"总是":function(node){
		if(pIsNewLine(node)){
			node.innerHTML="Nói chung";
		}
	},
	"途中":function(node){
		var nd=looper.search(node,false,6,'在',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.innerHTML="";
		}
	},
	"面":function(node){
		if(!node.innerHTML.contain("mặt"))return;
		var nd=looper.search(node,false,3,'着')||looper.search(node,false,3,'前');
		if(nd){
			if(node.gT().length==1){
				nd.innerHTML+=" mặt";
				nd.innerHTML=nd.innerHTML.replace("mặt mặt","mặt");
				node.innerHTML=node.innerHTML.replace("mặt","");
			}
			else{
				nd.innerHTML+=" "+node.innerHTML;
				node.innerHTML="";
			}
		}
	},
	"-资格":function(node){
		var nd=looper.search(node,false,5,'连',true);
		if(nd){
			nd.innerHTML+=" "+node.innerHTML;
			node.tomean("");
		}
	},
	"都对":function(node){
		if(node.nextSibling!=null){
			if(!(new RegExp(this.database.brk).test(node.nextSibling.textContent))){
				node.tomean("đều đối");
				meanstrategy.highlight(node,"m");
			}
		}
	},
	"才是对":function(node){
		if(node.nextSibling!=null){
			if(new RegExp(this.database.brk).test(node.nextSibling.textContent)){
				node.textContent="mới là đối";
				meanstrategy.highlight(node,"m");
			}
		}
	},
	"也对":function(node){
		if(node.nextSibling!=null){
			if(new RegExp(this.database.brk).test(node.nextSibling.textContent)){
				node.tomean("cũng đúng");
				meanstrategy.highlight(node,"m");
			}
		}
	},
	"开始":function(node){
		while(node.nE() && node.isspace(true)){
			node = node.nE();
			if(node.textContent.contain("bắt đầu")){
				node.textContent = node.textContent.replace("bắt đầu","");
			}
		}
	},
	"起来":function(node){
		if(node.pE() && node.pE().gT() && node.pE().gT().lastChar()=="了"){
			node.textContent="";
		}else
		if(node.pE() && node.pE().innerHTML=="bắt đầu"){
			node.textContent="";
		}else
		if(node.pE() && node.pE().pE() && node.pE().pE().innerHTML=="bắt đầu"){
			node.textContent="";
		}else
		if(node.pE() && node.pE().pE() && node.pE().pE().pE() && node.pE().pE().pE().innerHTML=="bắt đầu"){
			node.textContent="";
		}else
		if(looper.searchphrase(node,false,6,"变得",true)){
			node.textContent="";
		}
	},
	"给我":function(node){
		var nd=looper.search(node,false,4,'借',true)||looper.searchphrase(node,false,4,'借点',true);
		if(nd){
			if(true){
				nd.textContent=node.innerHTML+" "+nd.innerHTML;
				node.tomean("");
				meanstrategy.highlight(nd,"m");
			}
		}
	},
	"可能":function(node){
		if(!node.isspace(true)){
			node.textContent="khả năng";
		}
		if(false && node.pE()&&node.pE().pE()){
			if(node.pE().pE().gT().contain("有") && !node.pE().pE().innerHTML.contain("khả năng")){

				node.pE().pE().innerHTML+=" khả năng";
				node.tomean("");
			}else if (node.pE().pE().pE()&&node.pE().pE().pE().gT().contain("有")
				 && !node.pE().pE().pE().innerHTML.contain("khả năng")) {
				node.pE().pE().pE().innerHTML+=" khả năng";
				node.tomean("");
			}
		}
	},
	"和":function(node){
		if(node.pE()&&node.isspace(false)&&node.pE().gT().contain("的")&&node.pE().gT().length==4){
			var pch=node.pE().gT();
			if(pch.contain("她")
				||pch.contain("其")
				||pch.contain("他")
				||pch.contain("它")
				||pch.contain("自己")
				||pch.contain("你")
				||pch.contain("我"))
			{
				var m=/^(.*? .*?) của (.*?)$/i.exec(node.pE().innerHTML);
				if(m!=null&&node.nE()&&node.nE().gT().length==2){
					node.innerHTML=node.nE().innerHTML+" cùng "+node.pE().innerHTML;
					node.nE().tomean("");
					node.pE().tomean("");
					meanstrategy.highlight(node,"m");
				}
			}
		}
	},
	"不":function(node){
		if(node.pE()&&node.nE()&&node.isspace(true)&&node.isspace(false)){
			if(node.pE().gT()==node.nE().gT()){
				node.textContent="hay không";
			}
		}

	},
	"变得":function(node){
		if(node.nE() && node.nE().textContent.contain("trở nên")){
			node.tomean("");
		}
	},

	"开":function(node){

		if(node.nE() && node.nE().gT()=="着" &&node.nE().nE()){
			var c=node.nE().nE();
			if(c.gT() in this.database.carbrand){
				node.tomean("lái");
				node.nE().tomean("");
				c.tomean(this.database.carbrand[c.gT()]);
				meanstrategy.highlight(node,"m");
			}else{
				var node2=node;
				for(var i=0;i<3;i++){
					node2=node2.nE();
					if(node2==null)return;
					if(!node.isspace(false))return;
					if(instring(node2.gT(),"车机")){
						node.tomean("lái");
						node.nE().tomean("");
						meanstrategy.highlight(node,"m");
						return;
					}
				}
			}
		}else if(node.nE()){
			var c=node.nE();
			if(c.gT() in this.database.carbrand){
				node.tomean("lái");
				c.tomean(this.database.carbrand[c.gT()]);
				meanstrategy.highlight(node,"m");
			}else{
				var node2=node;
				for(var i=0;i<3;i++){
					node2=node2.nE();
					if(node2==null)return;
					if(!node.isspace(false))return;
					if(instring(node2.gT(),"车机")){
						node.tomean("lái");
						meanstrategy.highlight(node,"m");
						return;
					}
				}
			}
		}
		//开着
	},
	"还给":function(node){
		if(node.pE()&&node.pE().containName()){
			node.tomean("trả cho");
		}
	},
	"我就是":function(node){
		if(!node.isspace(true)){
			node.tomean("chính là ta");
		}
	},
	"说着":function(node){
		if(!node.isspace(false)){
			node.tomean("nói xong");
		}
	},
	"对不起":function(node){
		if(node.nextSibling!=null){
			if(new RegExp(this.database.brk).test(node.nextSibling.textContent)){
				node.tomean("thật xin lỗi");
				meanstrategy.highlight(node,"m");
			}
		}
	},
	"numberpow":function(node){
		if(node.gT().length==1){
			node.tomean("lần");
		}else {
			var bt=node.gT().substring(1);
			if(node.nE()){
				bt+=node.nE().gT();
				node.nE().tomean("");
			}
			tse.send("002",bt,function(){
				node.tomean("lần "+this.down.split("=")[1]);
			});
		}
	},
	"faction":function(node,find,replace){
		if(!setting.factionfilter)return;
		if(node.pE() && node.pE().containName()){
			return;
		}
		if(this.countname(false,node,1)){
			if(find!=""){
				node.textContent=node.innerHTML.replace(find,replace);
			}else{
				node.textContent=replace;
			}
			this.highlight(node,"f");
			meanstrategy.recognized[node.id]={
				type:"faction",
				range:[node.pE(),node]
			}
		}else if(node.pE()!=null){
			if(!node.isspace(false))return;
			if(node.pE().gT().length==1){
				node.pE().containHan(function(){
					if(find!=""){
						node.textContent=node.innerHTML.replace(find,replace);
					}else{
						node.textContent=replace;
					}
					node.pE().textContent=titleCase(node.pE().gH());

					meanstrategy.recognized[node.id]={
						type:"faction",
						range:[node.pE(),node]
					}

					if(node.pE().pE()!=null&&node.pE().pE().gT().length==1&&node.pE().isspace(false)){
						node.pE().pE().containHan(function(){
							node.pE().pE().textContent=titleCase(node.pE().pE().gH());
							meanstrategy.collected+=titleCase(node.pE().pE().gH()+" "+node.pE().gH())+" "+node.gH()+"\n";

							meanstrategy.recognized[node.id].range.unshift(node.pE().pE());

						},function(){
							meanstrategy.collected+=titleCase(node.pE().gH())+" "+node.gH()+"\n";
						});
					}else {
						meanstrategy.collected+=titleCase(node.pE().gH())+" "+node.gH()+"\n";
					}
					meanstrategy.highlight(node,"f");
				});
			}else if(node.isspace(false))
			node.pE().containHan(function(){
				if(find!=""){
					node.textContent=node.innerHTML.replace(find,replace);
				}else{
					node.textContent=replace;
				}
				node.pE().textContent=titleCase(node.pE().gH());
				meanstrategy.collected+=titleCase(node.pE().gH())+" "+node.gH()+"\n";

				meanstrategy.recognized[node.id]={
					type:"faction",
					range:[node.pE(),node]
				}

				meanstrategy.highlight(node,"f");
			});
		}
	},
	recognized:{},
	factions:"门派宗城国山宫教楼府镇阁境市村寺省谷峰崖殿".split("")
		.concat(["大陆","联盟","剑派","剑宗"
		,"学院","商会","大学","学宫","圣地","山庄","森林"
		,"一族","山脉","秘境","世家","军团","公会","之地","洞天"
		,"神宗","圣宗","仙宗","天宗","魔宗"
		,"神门","圣门","仙门","天门","魔门","集团","领域","一族","之神","阵营"
		,"大学","山脈","山脉","星系","之体","王国","帝国","神国","主神","神王","灵体","界域"
		,"峡谷","之森","主城"
		]),
	people:function(node,leng){
		if(!setting.peoplefilter)return;
		if(node.pE()!=null){
			if(node.pE().getAttribute("aname")=="2"){
				this.testcommon([node.pE(),node]);
				return;
			}
			if(node.pE().gT().length==1&&this.surns.indexOf(node.pE().gT())>-1)return;
		}
		if(node.isname())return;
		if(this.testignore(node))return;
		if(node.gT()[0] == "万" || node.gT()[0]=="枚"){
			if(node.pE() && this.containnumber(node.pE())){
				return;
			}
		}
		var maxleng=(leng==1)?3:4;
		if(node.gT().length>leng){
			if(node.gT().length>leng+2)return;
			else {
				if(node.nE()!=null&&node.nE().gT().length==1){
					if(node.nextSibling.textContent!=" ")return;
					if(node.nE().gT().length+node.gT().length<=maxleng)
					node.nE().containHan(
						function(down){
							if(!meanstrategy.iscommsurn(node.gT().charAt(0))&&meanstrategy.testcommon([node,node.nE()])<3){

							}else if(meanstrategy.testcommon([node,node.nE()])>1&&(meanstrategy.testcommon([node,node.nE()])>=meanstrategy.testcommon([node]))
								||meanstrategy.testcommon([node,node.nE()])>3){
								node.textContent=titleCase(node.gH());
								node.nE().textContent=titleCase(node.nE().gH());
								meanstrategy.highlight(node,"o");
								node.setAttribute("aname","2");

								analyzer.update([node,node.nE()].sumChinese(),1);

							}else if(meanstrategy.iscommsurn(node.gT().charAt(0))){
								if(node.gH()==node.innerHTML.toLowerCase()){
									if(node.nE().gH()==node.nE().innerHTML.toLowerCase()){
										node.textContent=titleCase(node.gH());
										node.nE().textContent=meanstrategy.testsuffix(node.nE().gT(),titleCase(node.nE().gH()));
										meanstrategy.highlight(node,"o");
										node.setAttribute("aname","2");

										analyzer.update([node,node.nE()].sumChinese(),1);
									}
								}
							}
						}
					);
				}
				if(node.gT().length<=maxleng){
					if(this.testcommon([node])>3&&this.iscommsurn(node.gT().charAt(0))){
						node.containHan(function(down){
							if(down.split("/").length<3){
								node.textContent=meanstrategy.testsuffix(node.gT(),titleCase(node.gH()));
								meanstrategy.highlight(node,"o");

								analyzer.update(node.gT(),1);
							}
						},null,true);
					}
				}
			}
		}else 
		if(node.nE()!=null&&node.nE().gT().length==1){
			if(node.nextSibling.textContent!=" ")return;
			if(node.nE().gT().length+node.gT().length<=maxleng)
			node.nE().containHan(
				function(){
					if(!meanstrategy.iscommsurn(node.gT())&&meanstrategy.testcommon([node,node.nE()])<2){

					}else {

						var na=node.gT()+node.nE().gT();
						if(!(na in meanstrategy.addedname)){
							meanstrategy.addedname[na]=true;
							meanstrategy.addname(na,[node,node.nE()]);
						}

						node.textContent=titleCase(node.gH());
						node.nE().textContent=meanstrategy.testsuffix(node.nE().gT(),titleCase(node.nE().gH()));
						meanstrategy.highlight(node,"o");
						node.setAttribute("aname","2");

						analyzer.update([node,node.nE()].sumChinese(),1);

					}
				},
				function(){
					if(!(node.gT()+node.nE().gT() in meanstrategy.addedname)&&meanstrategy.testcommon([node,node.nE()])>3){
						var na=node.gT()+node.nE().gT();
						meanstrategy.highlight(node,"o");
						meanstrategy.addedname[na]=true;
						needbreak=true;
						namew.value="$"+na+"="+titleCase(node.gH()+" "+node.nE().gH())+"\n"+namew.value;
						saveNS();
						excute();
					}
				}
			);
			if(node.nE().nE()!=null&&node.nE().nE().gT().length==1){
				if(node.nE().nextSibling.textContent!=" ")return;
				if(this.testcommon([node,node.nE(),node.nE().nE()])>2||(this.testcommon([node,node.nE()])<=this.testcommon([node,node.nE(),node.nE().nE()])))
				if(node.nE().nE().gT().length+node.nE().gT().length+node.gT().length<=maxleng)
				node.nE().nE().containHan(
					function(){

						var na=node.gT()+node.nE().gT()+node.nE().nE().gT();
						if(!(na in meanstrategy.addedname)){
							meanstrategy.addedname[na]=true;
							meanstrategy.addname(na,[node,node.nE(),node.nE().nE()]);
						}
						node.nE().setAttribute("aname","2");
						node.nE().nE().textContent=meanstrategy.testsuffix(node.nE().nE().gT(),titleCase(node.nE().nE().gH()));

						analyzer.update([node,node.nE(),node.nE().nE()].sumChinese(),1);
					}
				);
			}
		}else if(node.nE()!=null&&node.nE().gT().length==2){
			if(node.nextSibling.textContent!=" ")return;
			if(node.nE().gT().length+node.gT().length>maxleng)return;
			node.nE().containHan(
				function(){
					if(!meanstrategy.iscommsurn(node.gT())&&meanstrategy.testcommon([node,node.nE()])<2){

					}else {
						var na=node.gT()+node.nE().gT();
						if(!(na in meanstrategy.addedname)){
							meanstrategy.addedname[na]=true;
							meanstrategy.addname(na,[node,node.nE()]);
						}
						node.textContent=titleCase(node.gH());
						node.nE().textContent=meanstrategy.testsuffix(node.nE().gT(),titleCase(node.nE().gH()));
						meanstrategy.highlight(node,"o");
						node.setAttribute("aname","2");

						analyzer.update([node,node.nE()].sumChinese(),1);
					}
				},
				function(){
					if(!(node.gT()+node.nE().gT() in meanstrategy.addedname)&&meanstrategy.testcommon([node,node.nE()])>3){
						meanstrategy.highlight(node,"o");
						var na=node.gT()+node.nE().gT();
						meanstrategy.addedname[na]=true;
						needbreak=true;
						namew.value="$"+na+"="+titleCase(node.gH()+" "+node.nE().gH())+"\n"+namew.value;
						saveNS();
						excute();
					}
				}
			);
		}
	},
	people2:function(node,leng){
	    if(!setting.peoplefilter)return;
	    var extensible= /[的]/;
	    var n2 = node.nE();
	    var t = node.gT();
	    if(n2){
			if(n2.isname())return;
	        var t2 = n2.gT();
	        if(t2.length == 1 && t2.match(extensible)){
	        	n2=null;
	        }else{
	        	var n3 = node.nE().nE();
		        if(n3){
		        	var t3 = n3.gT();
		        	if(t3.length == 1 && t3.match(extensible)){
		        		n3=null;
		        	}
		        }
	        }
	        
	    }
	    var n_1 = node.pE();
	    if(n_1){
	        if(n_1.getAttribute("aname")=="2"){
	            meanstrategy.testcommon([n_1,node]);
	            return;
	        }
	        //if(n_1.gT().length==1&&meanstrategy.surns.indexOf(n_1.gT())>-1)return;
	    }
	    if(node.isname())return;
	    if(meanstrategy.testignore(node))return;
	    if(t[0] == "万" || t[0]=="枚"){
	        if(n_1 && meanstrategy.containnumber(n_1)){
	            return;
	        }
	    }
	    var iscomm = meanstrategy.iscommsurn(t.substring(0,leng));
	    var surncomm = meanstrategy.testcommon([node]);
	    var n1han = node.containHan2(false);
	    if(n2){
	        var n2han = n2.containHan2(false);
	        var n1n2comm = meanstrategy.testcommon([node,n2]);
	    }
	    var maxleng=(leng==1)?3:4;
	    var havedchar = false;
	    if(n2 && t2.length>0 && false){
	    	
	    	if(t2.length + t.length - 1 <= maxleng){
	    		if(n3 && t3.length > 0 && t2.length + t3.length + t.length - 1 <= maxleng){
		    		if(t3.lastChar().match(extensible)||t2.lastChar().match(extensible)){
		    			maxleng++;
		    			havedchar = true;
		    		}
		    	}else{
					if(t2.lastChar().match(extensible)){
		    			maxleng++;
		    			havedchar = true;
		    		}
		    	}
	    	}
	    }
	    var result = [];
	    var setResult = function(arr){
	        if(arr.length > result.length){
	            result = arr;
	        }
	    }
	    if(t.length>leng){
	    	
	        if(t.length>leng+2){
	            if(havedchar){
	                if(t.length>leng+3){
	                    return;
	                }
	            }else return;
	        }
	        else {

	            if(n2 && n2han && t2.length + t.length<=maxleng && node.isspace(true)){
	                if(iscomm || n1n2comm > 2){
	                	if(leng==2){
	                		setResult([node,n2]);
	                	}else
	                    if(convertohanviets(t) == node.textContent.toLowerCase() &&convertohanviets(t2) == n2.textContent.toLowerCase()){
	                        setResult([node,n2]);
	                    }else{
		                    if((n1n2comm>1 && n1n2comm >= surncomm )|| n1n2comm >= 3){
		                        setResult([node,n2]);
		                    }
		                }
	                }else{
	                    if((n1n2comm>1 && n1n2comm >= surncomm )|| n1n2comm >= 3){
	                        setResult([node,n2]);
	                    }
	                }
	            }
	            if(t.length <= maxleng && surncomm > 3 && iscomm && n1han && n1han.split("/").length<3 && !node.gP().contain("v")){
	            	if(!node.gP().match(/.?v.?|ns/))
	                setResult([node]);
	            }
	        }
	    }else if(n2&&t2.length==1 && node.isspace(true) && t2.length+t.length<=maxleng){
	        if(n2han){
	        	if(!iscomm &&  n1n2comm < 2){}else setResult([node,n2]);
	        }else if(n1n2comm > 3){
	            setResult([node,n2]);
	        }
	        if(n2han && n3 && n2.isspace(true) && t3.length + t.length + t2.length <= maxleng){
	            if((this.testcommon2([node,n2,n3])>=surncomm || this.testcommon([node,n2,n3]) >= 3) && n3.containHan2(false)){
	                setResult([node,n2,n3]);
	            }
	        }
	    }else if(n2 && node.isspace(true) && t2.length + t.length<=maxleng){
	        if(n2han){
	            if(iscomm){
	                setResult([node,n2]);
	            }else if(n1n2comm>=2){
	                setResult([node,n2]);
	            }
	        }else if(n1n2comm > 3){
	            setResult([node,n2]);
	        }
	    }
	    if(result.length > 0){
	    	var ignorep = /.?v.?|.?m.?|.?t.?|.?j.?|.?p.?/
	    	if(result[result.length-1].gP().match(ignorep)){
	    		if(result[0].gP().match(ignorep) && this.testcommon2(result) < 4){
	    			return;
	    		}else if(result[result.length-1].textContent!=result[result.length-1].gH()){
	    			return;
	    		}else if(this.testcommon2(result) < 3){
    				return;
    			}
	    	}
	    	var chi = result.sumChinese("");
			console.log(chi);
	        var name = this.testsuffix(chi,titleCase(convertohanviets(chi)).replace(/^Ti /,"Tư ").replace("Chư Cát","Gia Cát"));
	        result[0].textContent = name;
	        analyzer.update(result.sumChinese(),1);
	        var combinedcomm = this.testcommon2(result);

	        if(combinedcomm > this.testcommon(result)){
	            if(result.length==2){
	                var needbreak = this.maincontent.qq('[t="'+result[0].cn+'"]+[t^="'+result[1].cn+'"]');
	            }
	            if(result.length==3){
	                var needbreak = this.maincontent.qq('[t="'+result[0].cn+'"]+[t="'+result[1].cn+'"]+[t^="'+result[2].cn+'"]');
	            }
	            for(var i=0;i<needbreak.length;i++){
	                var nodes = [needbreak[i]];
	                while(nodes.length < result.length){
	                	if(nodes[0].pE()){
	                		nodes.unshift(nodes[0].pE());
	                	}else{break;}
	                }
	                var r = nodes.sumChinese("").substring(chi.length);
	                mergeWord(nodes);
	                if(r.length>0){
	                	(function(){
		                	var ndw = insertWordWaitAsync(nodes[0],r);
		                	tse.send("007",r,function(){
								var meancomb=this.down.split("|")[0].split("=");
								var m1 = getMeanFrom(meancomb);
								console.log(m1);
								ndw.textContent=m1;
								ndw.setAttribute("v")=m1;
							});	
		                })();
	                }
	                
	                nodes[0].textContent = name;
	                nodes[0].cn=chi;
	                nodes[0].setAttribute("t",chi);
	                nodes[0].setAttribute("v",name+"/"+nodes[0].gH());
	                console.log(name);
	                this.highlight(nodes[0],"o");
	            }
	        }else{
	            mergeWord(result);
	            result[0].setAttribute("v",name+"/"+result[0].gH());
	            this.highlight(result[0],"o");
	        }
	        //console.log(result);
	    }
	},
	commsurn:155,
	iscommsurn:function(chi){
		return this.surns.indexOf(chi)<=this.commsurn;
	},
	surns:"血王李張张劉刘陳陈楊杨黃黄趙赵吳吴周徐孫孙馬马朱胡郭何林羅罗鄭郑梁謝谢宋唐許许韓韩馮冯鄧邓曹彭蕭萧田董袁潘蔣蒋蔡楚余杜葉叶程蘇苏魏呂吕丁任沈姚盧卢姜崔鍾钟譚谭陸陆汪范石廖賈贾夏韋韦傅方鄒邹孟熊秦邱江尹薛閻阎段雷侯龍龙史陶黎賀贺顧顾毛郝龔龚邵萬錢嚴严覃武戴莫孔湯汤康易喬乔賴赖文风施洪辛柯莊庄云凌古夜宁瑜魂墨鱼温"
		+"焱寒丁万丘丛东严丰临丹义乌乐乔乙乜习于云亓井亢亦京仇仉介付灵仝代仪仰仲任伊伍伏伯何佘余佟佴依侯保俞俱倪傅储儀儲元充兆党公兰关兴冀冉冒农冠冬冯况冷凌凤凯凰凱刁刑列刘別利别剛劉劳勞募勾包匡区區千华卓单卜卞占卢卫印危卿历厉厍厚原厲双叢古召台史叶司吉向吕启吳吴吾呂员呼咸品哈員唐商啓善喬單喻嘉嚴固国圆國圓坚垣堅堯堵塗增墨士壶壺壽夏夔大太奇奉奎奕奚姚姜姬娄娇婁嬌嬴子孔孙孟季孫宁宇安宋完宏宓宗官定宛宜宣宦宫宮宰容宾宿密寇富寧寻寿封尉尋尚尤尧尹居屈展屠山岐岑岚岩岳崇崔嵇嶽巢左巩巫巴布帅师帥師席常干平年幸幹幽广庄庆庐应庞康庾廉廖廣廬延弓弘张張強强彪彭彰後徐從德志念忻怀思恒恩悅悦惠愛愼慈慕慧慶應懷戈戎成战戚戰戴戶户房所扈扬扶承折拓揚操支改政敖文斯新方於施旭旷昌明易昙昝星晁晉晋晏景智曁曆曠曲曹曾朱权李杜束杨杭東松林枚柏柔查柯柳柴栾桂桑桓梁梅楊楚楼榆榮樂樊樓檀權欒欧欽歐步武殳殴段殷毆毋毕毛水汝江池汤汪汲沃沈沉沐沙沧況法泰洛洪倚浙浦涂涢淩淵渊游湛湯源溫滄滑滕滿漆潘潼澹濮烏焦熊燕爱牛牟牧狄狐獒玉王班琪琳琴璩甄甘甯田由申留畢白百皇益盖盛盧相督瞿石祁祈祖祝祥祿禄福禚禹离秋种秦程種稽穆穌空窦竇章童端竹竺符笪筑筱简管箫節範築簡籍粘粟粤粵糜紀紅索紫終經緱繆红纪终经缪罗羅羊羌義羿翁習翟翰耿聂聞聶肖胡胥腾臧臨興舒艾节芦芮花芳苍苏苑苗苻范茅茹荀荆荊荣莊莘莫華萧萨萬葉葛董蒋蒙蒯蒲蒼蓋蓝蓟蓬蔔蔚蔡蔣蔺蕭蕲薄薊薩藉藍藤藺藿蘆蘇蘭虞融衛衡衣袁裘裴褚襄覃觀观解言計許訾詹談諸謝譚计许诸谈谢谭谯谷豐貝貢貫貴費賀賁賈賓賞賴贝贡贯贲贵费贺贾赏赖赫赵越趙路車軒车轩辛辜農边远连逄逍通連逯遊達遠邊邓邛邢邬邯邰邱邴邵邸邹郁郎郏郑郗郜郝郞郤郦部郭鄂鄒鄔鄢鄧鄭酆酈金鈄鈎鈕銀錢錫鍾鐘鐵钟钦钩钮钱铁银锡锺閆閔閻闕關闫闵闻阎阙阚阮阳阴陈陰陳陶陸陽隆隋隗集雍雙離雪雲零雷霍青靖静靜靳鞏鞠韋韓韦韩韶項須顏顔顧项须顾颜風风養饒馬馮駱騰马骆高鬱魏魚魯鮑鱼鲁鲍鳳鴻鸿鹹鹿麒麥麦麴麻黃黄黎黑默黨齊齐龍龐龔龙龚海流君塔旬剑骅霍芒魔南玄冰木水火土枭",
	surns2:"百里淳于第五東方东方東閣东阁東郭东郭東門东门端木獨孤独孤爾朱尔朱"+
		"公孫公孙公羊公冶季冶公西毌丘穀梁谷梁賀蘭贺兰赫連赫连賀若贺若皇甫"+
		"黄斯呼延兰向令狐陆費陆费甪里閭丘闾丘万俟慕容納蘭纳兰南宮南宫歐陽"+
		"欧阳沙吒上官申屠司馬司马司徒司空司寇太史澹臺澹台拓跋完顏完颜聞人"+
		"闻人巫馬巫马夏侯鮮于鲜于西門西门軒轅轩辕楊子杨子耶律樂正乐正尉遲"+
		"尉迟宇文長孫长孙鍾離钟离諸葛诸葛祝融子車子车左人",
	skill:function(node,lastchar){
		if(!setting.skillfilter)return;
		if(this.skillignore.indexOf(node.gT())>-1)return;
		var maxleng=5;
		if(node.cn && node.cn.lastChar()=="的"){
			maxleng++;
		}
		var cumulated=node.gT().length;
		var acceptrange=2;
		if(node.gT().length<2){
			acceptrange=3;
		}
		node.containHan(function(down0){
			if(node.pE()!=null){//layer 1
				if(!node.isspace(false))return;
				if(cumulated+node.pE().gT().length <= maxleng){
					node.pE().containHan(function(down1){
						//if(meanstrategy.testcommon([node.pE(),node])<3)return;
						if(down1.split("/").length>acceptrange
							&&down1.indexOf(node.pE().gH())!=0
							&&down1.split(node.pE().gH()).length<3)return;
						cumulated+=node.pE().gT().length;
						node.pE().textContent=meanstrategy.skillcasing(node.pE().gH());
						node.textContent=meanstrategy.skillcasing(node.gH());
						meanstrategy.highlight(node,"s");
						if(node.pE().pE()!=null
						 &&node.pE().isspace(false)
						 &&cumulated+node.pE().pE().gT().length <= maxleng)
						 {//layer 2
							node.pE().pE().containHan(function(down2){
								//if(meanstrategy.testcommon([node.pE(),node.pE(),node])<3)return;
								if(down2.split("/").length>acceptrange
									&&down2.indexOf(node.pE().pE().gH())!=0
									&&down2.split(node.pE().pE().gH()).length<3)return;
								cumulated+=node.pE().pE().gT().length;
								node.pE().pE().textContent=meanstrategy.skillcasing(node.pE().pE().gH());
								if(node.pE().pE().pE()!=null){//layer 3
									if(!node.pE().pE().isspace(false))return;
									if(cumulated+node.pE().pE().pE().gT().length <= maxleng){
										//if(meanstrategy.testcommon([node.pE().pE().pE(),node.pE().pE(),node.pE(),node])<3)return;
										node.pE().pE().pE().containHan(function(down3){
											if(down3.split("/").length>acceptrange
												&&down3.indexOf(node.pE().pE().pE().gH())!=0
												&&down3.split(node.pE().pE().pE().gH()).length<3)return;
											node.pE().pE().pE().textContent=meanstrategy.skillcasing(node.pE().pE().pE().gH());
										},null,true);
									}
								}
							},function(){
								if(node.gT().length+node.pE().gT().length<3){
									node.textContent=node.gH();
									node.pE().textContent=node.pE().gH();
								}
							},true);
						}else {
							if(node.gT().length+node.pE().gT().length<3){
								node.textContent=node.gH();
								node.pE().textContent=node.pE().gH();
							}
						}
					},null,true);
				}
			}
		},null,false);
	},
	skill2:function(node,lastchar){
		if(!setting.skillfilter)return;
		if(this.skillignore.indexOf(node.gT())>-1)return;
		var maxleng=5;
		if(node.cn.lastChar()=="的"){
			maxleng++;
		}
		var cumulated=node.gT().length;
		var acceptrange=2;
		if(node.gT().length<2){
			acceptrange=3;
		}
		var ishan = node.containHan2(false);
		if(ishan){
			var p1 = node.pE();
			if(p1 && node.isspace(false) && cumulated+p1.gT().length <= maxleng){
				var down1 = p1.containHan2(true);
				if(down1){
					if(down1.split("/").length>acceptrange && down1.indexOf(p1.gH()) != 0 &&down1.split(p1.gH()).length < 3)return;
					cumulated+=p1.gT().length;
					p1.textContent=meanstrategy.skillcasing(p1.gH());
					node.textContent=meanstrategy.skillcasing(node.gH());
					meanstrategy.highlight(node,"s");
					var p2 = p1.pE();
					if(p1.isspace(false) && p2 && cumulated+p2.gT().length <= maxleng){
						var down2 = p2.containHan2(true);
						if(down2 && down2.split("/").length <= acceptrange && down2.indexOf(p2.gH())==0&&down2.split(p2.gH()).length>=3){
							cumulated+=p2.gT().length;
							p2.textContent=meanstrategy.skillcasing(p2.gH());
							var p3 = p2.pE();
							if(p2.isspace(false) && p3 && cumulated+p2.gT().length <= maxleng){
								var down3 = p3.containHan2(true);
								if(down3 && down3.split("/").length<=acceptrange&&down3.indexOf(p3.gH())==0&&down3.split(p3.gH()).length>=3){
									p3.textContent=meanstrategy.skillcasing(p3.gH());
								}
							}
						}else{
							if(node.gT().length+p1.gT().length<3){
								node.textContent=node.gH();
								p1.textContent=p1.gH();
							}
						}
					}else{
						if(node.gT().length+p1.gT().length<3){
							node.textContent=node.gH();
							p1.textContent=p1.gH();
						}
					}
				}
			}
		}
	},
	skills:"衫罩功经诀典法剑拳掌刀踢脚指步斩决印式丹阵".split("").concat("魔功道经金身神功经的".splitn(2)),
	skillignore:"功法身法无法方式款式方法".splitn(2),
	skillcasing:function(translated){
		if(!!setting.skilluppercase){
			return titleCase(translated);
		}else return translated;
	},
	isitem:function(lc){
		if(this.items_a.indexOf(lc)<0
			&&this.items_s.indexOf(lc)<0
			&&this.items_sp.indexOf(lc)<0
			&&this.items_t.indexOf(lc)<0
			&&this.items_p.indexOf(lc)<0){
			return true;
		}
		return false;
	},
	item:function(node,lastchar){
	    if(!setting.enablesuffix)return;
	    if(this.itemignore.indexOf(node.gT())>-1)return;
	    if(!node || !node.containHan2())return;
	    var nodes=[node];
	    var t=node.gT();
	    var pignore = /m|j|v|s|f|^n?t/;
	    if(node.gP().match(pignore)){
	        return;
	    }
	    if(this.isitem(lastchar) && node.textContent.toLowerCase()!=node.gH()){
	    	return;
	    }
	    while(t.length < 5) {
	        if(node.isspace(false) && nodes[0].pE() && nodes[0].pE().tagName=="I"){
	            var tmpt = nodes[0].pE().gT();
	            for(var wt in meanengine.db.tokenfind){
	                if(meanengine.db.tokenfind[wt].indexOf(tmpt)>-1){
	                    break;
	                }
	            }
	            if(t.length+tmpt.length > 5 || pignore.exec(nodes[0].pE().gP())){
	            	break;
	            }
	            nodes.unshift(nodes[0].pE());
	            t=tmpt + t;
	        }else{
	            break;
	        }
	    }
	    if(t.length < 3){
	        return;
	    }
	    var acceptrange=2;
	    if(node.gT().length<2){
	        acceptrange=3;
	    }
	    function testMean(n){
	        var m = n.mean();
	        if(!m)return false;
	        var f = m.split("/").length > acceptrange && m.split(n.gH()).length < 3;
	        if(f && !ichar3.allIsPopular(n.cn.split(""))){
	            return false;
	        }
	        if(f && meanstrategy.testcommon(nodes) < 3 && m.indexOf(node.gH())!=0){
	            return false;
	        }
	        return true;
	    }
	    for(var i=nodes.length-2;i>=0;i--){
	        var ishan = nodes[i].containHan2();
	        if(!ishan || !testMean(nodes[i])){
	            for(var j=0;j<=i;j++){
	                nodes.shift();
	            }
	            t = nodes.sumChinese("");
	            if(t.length < 3){
	                return;
	            }
	        }
	    }
	    if(nodes.length == 1){
	    	return;
	    }
	    mergeWord(nodes);
	    var name = convertohanviets(t);
	    if(this.isitem(lastchar)){

	    }else
	    if(tokenizeName(t).push){
    		if(this.items_p.indexOf(lastchar)>=0){
    			name = lowerNLastWord(titleCase(name),1);
	    	}else if(this.items_t.indexOf(lastchar)>=0){
	    		name = titleCase(name);
	    	}else if(this.items_a.indexOf(lastchar)>=0){
	    		name = titleCase(name);
	    	}else if(this.items_s.indexOf(lastchar)>=0){
	    		name = this.skillcasing(name);
	    	}else if(this.surns.indexOf(t[0])>=0){
	    		name = titleCase(name);
	    	}else{
	    		name = titleCase(name);
	    	}
    	}
    	nodes[0].textContent = name;
    	meanstrategy.highlight(nodes[0],"i");
	    if(isUppercase(nodes[0])){
	    	nodes[0].textContent = ucFirst(nodes[0].textContent);
	    }
	    nodes[0].setAttribute("v",nodes[0].textContent);
	},
	items:"衫罩功经诀典法剑拳掌刀踢脚指步斩决印式丹阵蛊山靴龙魔马鬼虎蛇狼兽鹰牛熊狮鹤鱼凰蛟鹏象鹿蟒蝎羊麟猿蝶龟虫鲨鸟蛛夭猪猴狗鸡蜂鼠鲸鲲禽蚕龍鹞鳄林天星海凌江宫门宗镇岳河谷庄城渊朝界锋泉池陵狱域庭楼丘领涯珠居台葬溪帮司州区阁崖郡岭岛剑玉金叶文水血火花冰心铁石木华丹刀莲钟炎毒沙书药烟竹图符令雾甲角岩普琴阵树散草衣枪藤佩酒印醉须根果皮刃髓简镜求蜜盾卷昆泥铃顶茶肉壁努箭尺汤剑法刀波震舞步经功掌枪手闪印爪浪戈刃刺劲指盾昆换叠变箭尺风云雷水火魂世卫劫魄王仙圣帝佛侯祖主".split(""),
	itemignore:"",
	items_p:"林天星海凌江宫门宗镇岳河谷庄城渊朝界锋泉池陵狱域庭楼丘领涯珠居台葬溪帮司州山",
	items_s:"剑法刀波震舞步经功掌枪手闪印爪浪戈刃刺劲指盾昆换叠变箭尺衫罩功经诀典法剑拳掌刀踢脚指步斩决印式丹阵",
	items_t:"王仙圣帝佛侯祖主",
	items_sp:"风云雷水火魂世卫劫魄",
	items_a:"蛊龙魔马鬼虎蛇狼兽鹰牛熊狮鹤鱼凰蛟鹏象鹿蟒蝎羊麟猿蝶龟虫鲨鸟蛛夭猪猴狗鸡蜂鼠鲸鲲禽蚕龍鹞鳄",
	entity:function(node,lastchar){
		if(!setting.entityfilter)return;
		if(this.entityignore.indexOf(node.gT())>-1)return;
		var maxleng=5;
		var cumulated=node.gT().length;
		var acceptrange=2;
		if(node.gT().length<2){
			acceptrange=3;
		}
		node.containHan(function(down0){
			if(node.pE()!=null){//layer 1
				if(!node.isspace(false))return;
				if(cumulated+node.pE().gT().length <= maxleng){
					node.pE().containHan(function(down1){
						//if(meanstrategy.testcommon([node.pE(),node])<3)return;
						if(down1.split("/").length>acceptrange
							&&down1.indexOf(node.pE().gH())!=0
							&&down1.split(node.pE().gH()).length<3)return;
						cumulated+=node.pE().gT().length;
						node.pE().textContent=meanstrategy.skillcasing(node.pE().gH());
						node.textContent=meanstrategy.skillcasing(node.gH());
						meanstrategy.highlight(node,"s");
						if(node.pE().pE()!=null
						 &&node.pE().isspace(false)
						 &&cumulated+node.pE().pE().gT().length <= maxleng)
						 {//layer 2
							node.pE().pE().containHan(function(down2){
								//if(meanstrategy.testcommon([node.pE(),node.pE(),node])<3)return;
								if(down2.split("/").length>acceptrange
									&&down2.indexOf(node.pE().pE().gH())!=0
									&&down2.split(node.pE().pE().gH()).length<3)return;
								cumulated+=node.pE().pE().gT().length;
								node.pE().pE().textContent=meanstrategy.skillcasing(node.pE().pE().gH());
								if(node.pE().pE().pE()!=null){//layer 3
									if(!node.pE().pE().isspace(false))return;
									if(cumulated+node.pE().pE().pE().gT().length <= maxleng){
										//if(meanstrategy.testcommon([node.pE().pE().pE(),node.pE().pE(),node.pE(),node])<3)return;
										node.pE().pE().pE().containHan(function(down3){
											if(down3.split("/").length>acceptrange
												&&down3.indexOf(node.pE().pE().pE().gH())!=0
												&&down3.split(node.pE().pE().pE().gH()).length<3)return;
											node.pE().pE().pE().textContent=meanstrategy.skillcasing(node.pE().pE().pE().gH());
										},null,true);
									}
								}
							},function(){
								if(node.gT().length+node.pE().gT().length<3){
									node.textContent=node.gH();
									node.pE().textContent=node.pE().gH();
								}
							},true);
						}else {
							if(node.gT().length+node.pE().gT().length<3){
								node.textContent=node.gH();
								node.pE().textContent=node.pE().gH();
							}
						}
					},null,true);
				}
			}
		},null,false);
	},
	entities:"",
	entityignore:"",
	ignore:"币都于与务位座我门派乃他她它各用找这是个姐的接弃名入磋嘛年进那几器啊这反和自货就级给回阵里到嗎吗出后被又儿可以吧等呢从弟向和加体离在将所有面竟挺对选中您连仍技性族也们为施内成些野为炼郊要然错当",
	connectignore:"和将刚都然",
	ignore2:"于加体离在年将选论然野炼郊然几的",
	havemean:"修炼".splitn(2),
	testignore:function(node){
		if(instring(node.gT(),meanstrategy.ignore)){
			if(!instring(node.gT(),meanstrategy.ignore2)||(node.pE()&&meanstrategy.testcommon([node.pE(),node])<2)){
				return true;
			}
		}
		return false;
	},
	testignorechi:function(chi){
		if(instring(chi,meanstrategy.ignore)){
			return true;
		}
		return false;
	},
	//addname:function(chi,tra){
		//namew.value="$"+chi+"="+this.testsuffix(tra.sumChinese(""),titleCase(tra.sumHan()))+"\n"+namew.value;
		//this.collected+="\n"+this.testsuffix(tra.sumChinese(""),titleCase(tra.sumHan()));
	//},
	suffix:"道家榜某老哥兄候伯父母叔氏总董导局队少".split("").concat("四爷家主大师道友前辈师妹秘书大夫警官小子编剧书记大神校花律师员外上校真人教官仙子仙女婆婆夫人帮主二娘二爷大侠盟主供奉矮子女士阿姨旅长神医叔叔司令主席伯伯同学庄主哥哥镖头少侠大哥女侠导师圣女老板老师长老姑娘少爷将军护卫教习教头公子高手大师大人家人老大老二老三老四老五老六老七老八老九老十先生掌门武者宿主商城师兄侄女宗门管事".splitn(2)),
	testsuffix:function(text,translated){
		for(var i=0;i<text.length;i++){
			if(this.suffix.indexOf(text.substring(i))>-1){
				return lowerNLastWord(translated,text.length-i);
			}
		}
		return translated;
	},
	testcommon:function(nodecomb){
		var len = nodecomb.length;
		var comb = nodecomb.sumChinese();
		if(comb.length > 12){
			return 0;
		}
		nodecomb = nodecomb.map(function(n){
			if(!n.cn){return "";}
			return n.cn.replace(/"/g,"");
		});
		
		if(comb in this.commondata){
			return this.commondata[comb];
		}
		var count = 0;
		if(len==1){
			count = this.maincontent.qq('[t="'+nodecomb[0]+'"]').length;
		}
		if(len==2){
			count = this.maincontent.qq('[t="'+nodecomb[0]+'"]+[t="'+nodecomb[1]+'"]').length;
		}
		if(len==3){
			count = this.maincontent.qq('[t="'+nodecomb[0]+'"]+[t="'+nodecomb[1]+'"]+[t="'+nodecomb[2]+'"]').length;
		}

		this.commondata[comb]=count;
		return count;
	},
	testcommon2:function(nodecomb){
	    var len=nodecomb.length;
	    var count = 0;
	    if(len==2){
	        count = this.maincontent.qq('[t="'+nodecomb[0].cn+'"]+[t^="'+nodecomb[1].cn+'"]').length;
	    }
	    if(len==3){
	        count = this.maincontent.qq('[t="'+nodecomb[0].cn+'"]+[t="'+nodecomb[1].cn+'"]+[t^="'+nodecomb[2].cn+'"]').length;
	    }
	    return count;
	},
	prepositionmover:function(node){
		var cn=node.gT();
		if(node.getAttribute("moved")=="true")return;
		if(this.database.phasemarginr.c(cn.substring(cn.length-2))
			||this.database.phasemarginr.c(cn.substring(cn.length-1))){
			if(instring(cn,meanstrategy.ignore))return;
			if(!node.isspace(false))return;
			var nd=looper.searchex(node,false,3,this.database.phasemarginul,true);
			if(nd){
				nd.innerHTML+=" "+node.innerHTML;
				node.innerHTML="";
				this.highlight(nd,"m");
				node.setAttribute("moved","true");
				return;
			}else if(node.pE()&&node.pE().isname()){
				swapnode(node,node.pE());
				node.setAttribute("moved","true");
				this.highlight(node,"m");
				//casingvp(node.pE(),node.pE().innerHTML);
			}else if(node.pE()&&node.pE().gT().length>1&&
				(node.pE().pE()&&node.pE().pE().tagName=="BR" || !node.pE().pE())){
				swapnode(node,node.pE());
				node.setAttribute("moved","true");
				this.highlight(node,"m");
				//casingvp(node.pE(),node.pE().innerHTML);
			}
		}
	},
	"commondata":{},
	"invoker":false,
	"刀门":function(node){
		this.faction(node,"","Đao môn");
	},
	"addedname":{},
	"上天":function(node){
		node.tomean("thượng thiên");
	},
	"vpdatabase":{},
	"角色":function(node){
		node.tomean("nhân vật");
	},
	"天境":function(node){
		this.faction(node,"","Thiên cảnh");
	},
	"神境":function(node){
		this.faction(node,"","Thần cảnh");
	},
	"圣境":function(node){
		this.faction(node,"","Thánh cảnh");
	},
	"大帝":function(node){
		this.faction(node,"","Đại Đế");
	},
	"道君":function(node){
		this.faction(node,"","Đạo Quân");
	},
	"主宰":function(node){
		this.faction(node,"","Chúa Tể");
	},
	"女帝":function(node){
		this.faction(node,"","Nữ Đế");
	},
	"王朝":function(node){
		this.faction(node,"","Vương Triều");
	},
	"帝朝":function(node){
		this.faction(node,"","Đế Triều");
	},
	"神朝":function(node){
		this.faction(node,"","Thần Triều");
	},
	"天朝":function(node){
		this.faction(node,"","Thiên Triều");
	},
	"玄境":function(node){
		this.faction(node,"","Huyền cảnh");
	},
	"火宗":function(node){
		this.faction(node,"","Hỏa tông");
	},
	testenglish:function(node){
		var currentnode=node;
		if(!node){return; }
		if(this.surns.indexOf(node.gT()[0]) >=0){
			return;
		}
		var walked=0;
		var nodlist=[];
		while (currentnode!=null) {
			walked++;
			if(walked>5)break;
			if(engtse.alliseng(currentnode.gT())){
				nodlist.push(currentnode);
			}else {
				break;
			}
			if(!currentnode.isspace(true))break;
			currentnode=currentnode.nE();
		}
		if(nodlist.length<2)return;
		var chi=nodlist.sumChinese("");
		if(chi.length<3)return;
		if(this.testcommon(nodlist) < 3)return;
		var engname = titleCase(engtse.trans(chi));
		node.textContent=engname;
		node.setAttribute("v", engname);
		for(var i=1;i<nodlist.length;i++){
			node.setAttribute("h",node.gH()+" "+nodlist[i].gH());
			node.setAttribute("t",node.gT()+nodlist[i].gT());
			node.cn=node.gT()+nodlist[i].gT();
			nodlist[i].remove();
		}
		meanstrategy.highlight(node,"e");
	},
	containnumber:function(node){
		if(this.database.numrex.test(node.gT())){
			return true;
		}
		return false;
	},
	containmargin:function(node){

	},
	database:{
		preposition:{
			"这":"này",
			"不":"không"
		},
		phasemarginul:"这于那到在".split(""),
		phasemarginl:"这于他她它乃个是那就到出在将".split(""),
		phasemarginr:"里后中内间前上左右外边".split("").concat("附近".splitn(2)),
		getmean:function(chi,calb){
			if(chi in this){
				calb(this[chi]);
			}else {
				tse.send("005",chi,function(d){
					if(this.down!="false"){
						meanstrategy.database[this.up]=this.down.trim();
					}
					calb(this.down.trim());
				});
			}
		},
		brk:"[,\.“”!\?]",
		scope:{
			open: "[《「『〈【［‘:·]",
			close:"[》」』〉】］’】】]"
		},
		pronoun:"我你您他她它",
		numbers:"一二三四五六七八九十百",
		numrex:/[0-9\.\-\,一二三四五六七八九十百千万两亿几]+/,
		level:"ABCDEFGHIKabcdefghikSs123456789上",
		carbrand:(function(){var names = ("讴歌=ACURA/阿尔法罗密欧=ALFA ROMEOS/阿斯顿马丁=ASTON MARTIN/奥迪=AUDI/宾利=BENTLEY/宝马=BMW/布加迪=BUGATTI/别克=BUICK/比亚迪=BYD/卡迪拉克=CADILLAC/"+
			"雪佛兰=CHEVROLET/克莱斯勒=CHRYSLER/雪铁龙=CITROEN/道奇=DODGE/法拉利=FERRARI/菲亚特=FIAT/福特=FORD/本田=HONDA/悍马=HUMMER/现代=HYUNDAI/英菲尼迪=INFINITI/依维柯=IVECO/"
			+"捷豹=JAGUAR/吉普=JEEP/起亚=KIA/兰博基尼=LAMBORGHINI/蓝旗亚=LANCIA/路虎=LAND ROVER/雷克萨斯=LEXUS/林肯=LINCOLN/劳伦斯=LORINSER/莲花=LOTUS/玛莎拉蒂=MASERATI/"+
			"迈巴赫=MAYBACH/马自达=MAZDA/奔驰=MERCEDES-BENZ/水星=MERCURY/名爵=MORRISGARAGES/三菱=MITSUBISHI/日产=NISSAN/欧宝=OPEL/帕加尼=PAGANI/标致=PEUGEOT/普利茅斯=PLYMOUTH/"+
			"庞蒂亚克=PONTIAC/保时捷=PORSCHE/雷诺=RENAULT/劳斯莱斯=ROLLS ROYCE/罗孚=ROVER/萨博=SAAB/世爵=SPYKER/双龙=SSANGYONG/斯巴鲁=SUBARU/铃木=SUZUKI/丰田=TOYOTA/特斯拉=TESLA/"+
			"沃克斯豪尔=VAUXHALL/文图瑞=VENTURI/大众=VOLKSWAGEN/沃尔沃=VOLVO/电驴=xe đạp điện/毒药=Veneno").split("/");
				var obj={};
				for(var i=0;i<names.length;i++){
					var name=names[i].split("=");
					obj[name[0]]=name[1];
				}
				obj["names"]=("讴歌/阿尔法罗密欧/阿斯顿马丁/奥迪/宾利/宝马/布加迪/别克/比亚迪/卡迪拉克/雪佛兰/克莱斯勒/雪铁龙/道奇/法拉利/菲亚特/福特/本田/"+
					"悍马/现代/英菲尼迪/依维柯/捷豹/吉普/起亚/兰博基尼/蓝旗亚/路虎/雷克萨斯/林肯/劳伦斯/莲花/玛莎拉蒂/迈巴赫/马自达/奔驰/水星/名爵/三菱/日产/"+
					"欧宝/帕加尼/标致/普利茅斯/庞蒂亚克/保时捷/雷诺/劳斯莱斯/罗孚/萨博/世爵/双龙/斯巴鲁/铃木/丰田/特斯拉/沃克斯豪尔/文图瑞/大众/沃尔沃/电驴/毒药").split('/');
				return obj;
			})(),
		english:"丁万丘东丰丹久乌乔云亚亨京什仓代任伊伍休伦伯佐佩保光克兰关兴兹内冈农准凡凯切利加努劳勒匡华南博卡卢厄古吉哈哲唐因图圭坎坦埃基塔塞夏多夫夸奇奈奎奥姆威嫩孔孙宁安宗宰容宽宾富察尊尔尚尤尧尼岑巴布希帕平库庞康延廷弗当彭彻德怀恩惠戈扎托扬拉拜措敦文斯方日旺昂昆昌明春普曹曼曾朗本朱杜杭杰松林果查柳柴根格桑梅森楚欣武比毛永汉沃沙法波泰泽洛津洪派海温滕潘灿热焦特环珀班琴琼瑙瑟瓜瓦甘申留登皮盖真祖福科穆章策米索约纳纽绍维缪罗翁考耶聪肖肯胡舍舒艾芒芬苏若英茨茹莫莱菲萨蒂蒙蓬蔡藏藻西詹让诺谢豪贝贡费贾赖赛赞赫辛达迈迪通道邦里金钦钱门阔阿陶隆雄雷霍青韦顺马高鲁鲍黄默齐龙"
	},
	addname:function(level,base,name,script){
		if(script=="titleCase"){
			name=titleCase(name);
		}
		if(script=="firstWord"){
			name=name[0].toUpperCase() + name.substring(1);
		}
		if(script=="firstTwoWord"){
			var c2 = name.indexOf(" ")+1;
			name=name[0].toUpperCase() + name.substr(1,c2-1)+name[c2].toUpperCase()+name.substring(c2+1);
		}
		if(script=="lowerAll"){
			name=name.toLowerCase();
		}
		if(level==0){
			namew.value+="\n"+base+"="+name;
		}
		if(level==1){
			namew.value+="\n@"+base+"="+name;
		}
		if(level==2||level==3){
			namew.value+="\n$"+base+"="+name;
		}
		saveNS();
	}
};

function meanengine(ln,sub){
	if(meanengine.checkparse(ln)){
		return;
	}
	var baseln = ln;
	if(/>?.*?\+.*?=.*/.test(ln)){
		ln=meanengine.shorthand(ln);
	}
	if(/.*?\{0\}.*?=.*/.test(ln)){
		ln=meanengine.shorthand2(ln);
	}
	var delim = "->";
	ln = ln.split(delim);
	if(ln.length<2 || ln[0].contain("=")){
		delim="=";
		ln=baseln.split("=");
		if(ln.length<2){
			console.log(ln + " không đầy đủ, bỏ qua.");
			return;
		}
		if(!ln[0].contain("{")){
			return meanenginelight(baseln,sub);
		}
	}
	var lefts = ln[0].replace(" ","");
	var stack = [];
	var mstack = [];
	
	var asigner = /@(.+?):(\d+)/.exec(lefts);
	if(asigner){
		lefts = lefts.substr(asigner[0].length);
	}

	var regex ={
		base:/{.*?}(\[.+?\])?/g,
		extend:/{(\d+)(?:\.\.|\~)(\d+)}/,
		exactwidth:/{(\d+)}/,
		havechar:/{\*(.+?)}/,
		haveword:/{\~(.+?)}/,
		lastword:/^{:(.+?)}$/,
		firstword:/^{(.+?):}$/,
		firstandlastword:/^{(.+?):(.+?)}$/,
		mtransform:/{(\d+)->(.*?)}/,
		mremove:/{(\d+_?)X}/,
		mshort:/{(\d+)->@}/,
		mappend:/{(\d+)\+(.+?)}/,
		mreplace:/{(\d+)\-(.+?)}/,
		mrepapp:/{(\d+)\-(.+?)\+(.+?)}/,
		mprepend:/{(.+?)\+(\d+)}/,
		mreppre:/{(.+?)\+(\d+)\-(.+?)}/,
		mrepins:/{(.+?)\+(\d+)\-(.+?)\+(.+?)}/,
		minside:/{(.+?)\+(\d+)\+(.+?)}/,
		mdefault:/{(\d+):}/,
		mfunction:/f\((.*?)\)/,
	};
	var typing={
		"{N}": "name",
		"{PN}": "proname",
		"{P}": "pronoun",
		"{S}": "number",
		"{D}" : "deter",
		"{SD}":"numdeter",
		"{D-}":"deter-",
		"{L}":"locat",
		"{*L}":"lastlocat",
		"{L1}":"locat1",
		"{L2}":"locat2",
		"{T}":"subw",
		"{R}":"relv",
		"{R1}":"relv1",
		"{R2}":"relv2",
		"{R3}":"relv3",
		"{*}":"unlim",
		"{~}":"unlim",
		"{SW}":"stw",
		"{t:F}":"faction",
		"{t:I}":"item",
		"{t:S}":"skill",
		"{VI}":"tviet",
		"{[}":"lbound",
		"{]}":"rbound"
	}
	var m;
	var m2;
	var isEnableAnl = false;
	var bound = {};
	var tkindex = 0;
	do{
		m=regex.base.exec(lefts);
		if(m){
			var mdf = false;
			var token = m[0];
			if(m[1]){
				token= token.substr(0,token.length - m[1].length);
				if(m[1][1] == ':'){
					var m3 = m[1].substr(2,m[1].length-3).toLowerCase();
					mdf = { type: "pos", postype: m3};
				}else{
					var m3 = /^\[(\d+)?(,)?(\d+)?\]$/.exec(m[1]);
					if(m3 == null)m3=[];
					if(m3[1] && m3[2] && m3[3]){
						mdf = { type: "length", min: parseInt(m3[1]), max: parseInt(m3[3])};
					}else if( m3[2] && m3[3]){
						mdf = { type: "length", min: 0, max: parseInt(m3[3])};
					}else if(m3[1] && m3[2]){
						mdf = { type: "length", min: parseInt(m3[1]), max: 99};
					}else if(m3[1]){
						mdf = { type: "length", min: parseInt(m3[1]), max: parseInt(m3[1])};
					}else{
						mdf = { type: "have", text: m[1].substr(1,m[1].length-2)};
					}					
				}
			}
			if(token=="{[}"){
				bound.l = tkindex - 1;
				continue;
			}
			if(token=="{]}"){
				bound.r = tkindex;
				continue;
			}
			tkindex++;
			if(token in typing){
				stack.push({type: typing[token], modifier: mdf});
				continue;
			}
			m2 = regex.extend.exec(token);
			if(m2){
				stack.push({type: "extend", min:parseInt(m2[1]), max:parseInt(m2[2]), modifier: mdf});
				continue;
			}
			m2 = regex.exactwidth.exec(token);
			if(m2){
				stack.push({type: "extend", min:parseInt(m2[1]), max:parseInt(m2[1]), modifier: mdf});
				continue;
			}
			m2 = regex.havechar.exec(token);
			if(m2){
				stack.push({type: "havechar", char: m2[1], modifier: mdf});
				continue;
			}
			m2 = regex.haveword.exec(token);
			if(m2){
				stack.push({type: "haveword", word: m2[1], modifier: mdf});
				continue;
			}
			m2 = regex.lastword.exec(token);
			if(m2){
				stack.push({type: "lastword", word: m2[1], modifier: mdf});
				continue;
			}
			m2 = regex.firstword.exec(token);
			if(m2){
				stack.push({type: "firstword", word: m2[1], modifier: mdf});
				continue;
			}
			m2 = regex.firstandlastword.exec(token);
			if(m2){
				stack.push({type: "firstlast", word1: m2[1], word2: m2[2], modifier: mdf});
				continue;
			}
			stack.push({type:"exact" , word: token.substr(1,token.length-2)});
		}
	}while (m!=null);
	if(lefts[0]=='>'){
		stack[0].isfirst=true;
	}
	if(lefts[lefts.length-1] == '<'){
		stack[stack.length-1].islast=true;
	}
	ln.shift();
	var rights = ln.join(delim);
	do{
		m=regex.base.exec(rights);
		if(m){
			var token = m[0];
			m2 = regex.mshort.exec(token);
			if(m2){
				mstack.push({nodeid:  parseInt(m2[1]) - 1, type: "short"});
				continue;
			}
			m2 = regex.mtransform.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "transform", word: m2[2]});
				continue;
			}
			m2 = regex.mremove.exec(token);
			if(m2){
				if(m2[1].lastChar() == "_"){
					mstack.push({nodeid: parseInt(m2[1]) - 1, type: "removenode"});
				}else{
					mstack.push({nodeid: parseInt(m2[1]) - 1, type: "remove"});
				}
				continue;
			}
			m2 = regex.mappend.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "append", word: m2[2]});
				continue;
			}
			
			m2 = regex.mrepapp.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "repapp", repword: m2[2], word: m2[3]});
				continue;
			}
			m2 = regex.mrepins.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "repins", repword: m2[3], lword: m2[1], rword: m2[4]});
				continue;
			}
			m2 = regex.mreppre.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "reppre", repword: m2[3], word: m2[1]});
				continue;
			}
			m2 = regex.minside.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "inside", lword: m2[1], rword: m2[3]});
				continue;
			}
			m2 = regex.mprepend.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "prepend", word: m2[1]});
				continue;
			}
			m2 = regex.mreplace.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "replace", repword: m2[2]});
				continue;
			}
			m2 = regex.mdefault.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "default"});
				continue;
			}
			mstack.push({nodeid: parseInt(token.substr(1,token.length-2)) - 1, type:"retain"});
		}else{
			m = regex.mfunction.exec(rights);
			if(m){
				mstack.push({function: m[1].trim()});
				break;
			}else{
				if(rights.trim() == "transform" || rights.trim() == "" || rights.trim() == "auto"){
					mstack.push({function: "TFCoreLn"});
					break;
				}
			}
		}
	}while (m!=null);
	if(mstack.length >0 && !mstack[0]["function"])
	if(mstack.length<stack.length){
		for(var i=0;i<stack.length;i++){
			var fl = false;
			for(var j=0;j<mstack.length;j++){
				if(mstack[j].nodeid == i){
					fl=true;
					break;
				}
			}
			if(!fl){
				mstack.push({nodeid:i, type:"remove"});
			}
		}
	}
	var strat = window.meanstrategy;
	if(sub){
		strat = meanengine.db.subpattern;
	}
	if(asigner){
		if(asigner[1] in strat){
			if(!strat[asigner[1]].stack){
				(function(w,dic){
					dic["_def-"+w]=dic[w];
					dic[w]=function(root,subbound){
						for(var i2=0;i2<dic[w].stack.length;i2++){
							if(dic[w].stack[i2](root,subbound)){
								return true;
							}
						}
					}
					dic[w].stack=[
						function(node){
							dic["_def-"+w](node);
						}
					];
				})(asigner[1],strat);
			}
		}else{
			(function(w,dic){
				dic[w]=function(root,subbound){
					for(var i2=0;i2<dic[w].stack.length;i2++){
						if(dic[w].stack[i2](root,subbound)){
							return true;
						}
					}
				}
				dic[w].stack=[];
			})(asigner[1],strat);
		}
		(function(w,startpoint,stk,transformer,base,anl,bound,dic){
			for(var i=0;i<dic[w].stack.length;i++){
				if(dic[w].stack[i].indentity==base){
					return;
				}
			}
			dic[w].stack.push(function(noderoot,subbound){
				if(window.meanengine.matcher(stk[startpoint],noderoot,{})){
					if(window.meanengine.run(noderoot,stk,transformer,startpoint,anl,bound,subbound||bound)){
						console.log('Match ln: '+base);
						return true;
					}
					return false;
				}
				return false;
			});
			dic[w].stack[dic[w].stack.length-1].indentity=base;
		})(asigner[1],parseInt(asigner[2]),stack,mstack,baseln,isEnableAnl,bound,strat);
	}else
	for(var i=0;i<stack.length;i++){
		if(stack[i].type=="exact"){
			if(stack[i].word in strat){
				if(!strat[stack[i].word].stack){
					(function(w,dic){
						dic["_def-"+w]=dic[w];
						dic[w]=function(root,subbound){
							for(var i2=0;i2<dic[w].stack.length;i2++){
								if(dic[w].stack[i2](root,subbound)){
									return true;
								}
							}
						}
						dic[w].stack=[
							function(node){
								dic["_def-"+w](node);
							}
						];
					})(stack[i].word,strat);
				}
			}else{
				(function(w,dic){
					dic[w]=function(root,subbound){
						for(var i2=0;i2<dic[w].stack.length;i2++){
							if(dic[w].stack[i2](root,subbound)){
								return true;
							}
						}
					}
					dic[w].stack=[];
				})(stack[i].word,strat);
			}
			(function(w,startpoint,stk,transformer,base,anl,bound,dic){
				for(var i=0;i<dic[w].stack.length;i++){
					if(dic[w].stack[i].indentity==base){
						return;
					}
				}
				dic[w].stack.push(function(noderoot,subbound){
					if(window.meanengine.run(noderoot,stk,transformer,startpoint,anl,subbound||bound)){
						console.log('Match ln: '+base);
						return true;
					}
					return false;
				});
				dic[w].stack[dic[w].stack.length-1].indentity=base;
			})(stack[i].word,i,stack,mstack,baseln,isEnableAnl,bound,strat);
		}
	}
}
meanengine.parsed={};
function meanenginelight(ln,sub){
	var baseln = ln;
	var delim = "=";
	ln = ln.split(delim);
	if(ln.length<2){
		console.log(ln + " không đầy đủ, bỏ qua.");
		return;
	}
	var lefts = ln[0].trim();
	var stack = [];
	var mstack = [];
	var regex ={
		base:/{.*?}/g,
		extend:/^(\d+)(?:\.\.|\~)(\d+)$/,
		exactwidth:/^(\d+)$/,
		havechar:/^\*(.+?)$/,
		haveword:/^\~(.+?)$/,
		lastword:/^:(.+?)$/,
		firstword:/^(.+?):$/,
		mdefault:/{(\d+):}/,
		mtransform:/{(\d+)->(.*?)}/,
		mremove:/{(\d+_?)X}/,
		mshort:/{(\d+)->@}/,
		mappend:/{(\d+)\+(.+?)}/,
		mreplace:/{(\d+)\-(.+?)}/,
		mrepapp:/{(\d+)\-(.+?)\+(.+?)}/,
		mprepend:/{(.+?)\+(\d+)}/,
		mreppre:/{(.+?)\+(\d+)\-(.+?)}/,
		mrepins:/{(.+?)\+(\d+)\-(.+?)\+(.+?)}/,
		minside:/{(.+?)\+(\d+)\+(.+?)}/,
		mfunction:/f\((.*?)\)/,
	};
	var typing={
		"N": "name",
		"PN": "proname",
		"P": "pronoun",
		"S": "number",
		"D" : "deter",
		"D-":"deter-",
		"SD":"numdeter",
		"L":"locat",
		"*L":"lastlocat",
		"L1":"locat1",
		"L2":"locat2",
		"T":"subw",
		"R":"relv",
		"R1":"relv1",
		"R2":"relv2",
		"R3":"relv3",
		"*":"unlim",
		"~":"unlim",
		"SW":"stw",
		"t:F":"faction",
		"t:I":"item",
		"t:S":"skill",
		"VI":"tviet",
		"HV":"hviet",
		"[":"lbound",
		"]":"rbound"
	}
	var m;
	var m2;
	lefts= lefts.split(" ");
	var tkindex = 0;
	var bound = {};
	for(var i=0;i<lefts.length;i++){
		m=lefts[i];
		if(m==""){
			continue;
		}
		if(m){
			var token = m;
			if(token=="["){
				bound.l = tkindex - 1;
				continue;
			}
			if(token=="]"){
				bound.r = tkindex;
				continue;
			}
			tkindex++;
			if(token in typing){
				stack.push({type: typing[token]});
				continue;
			}
			m2 = regex.extend.exec(token);
			if(m2){
				stack.push({type: "extend", min:parseInt(m2[1]), max:parseInt(m2[2])});
				continue;
			}
			m2 = regex.exactwidth.exec(token);
			if(m2){
				stack.push({type: "extend", min:parseInt(m2[1]), max:parseInt(m2[1])});
				continue;
			}
			m2 = regex.havechar.exec(token);
			if(m2){
				stack.push({type: "havechar", char: m2[1]});
				continue;
			}
			m2 = regex.haveword.exec(token);
			if(m2){
				stack.push({type: "haveword", word: m2[1]});
				continue;
			}
			m2 = regex.lastword.exec(token);
			if(m2){
				stack.push({type: "lastword", word: m2[1]});
				continue;
			}
			m2 = regex.firstword.exec(token);
			if(m2){
				stack.push({type: "firstword", word: m2[1]});
				continue;
			}
			if(m!=">" && m!="<")
			stack.push({type:"exact" , word: token});
		}		
	}

	if(lefts[0]=='>'){
		stack[0].isfirst=true;
	}
	if(lefts[lefts.length-1] == '<'){
		stack[stack.length-1].islast=true;
	}
	//console.log(stack);
	ln.shift();
	var rights = ln.join(delim);
	//console.log(rights);
	do{
		m=regex.base.exec(rights);
		if(m){
			var token = m[0];
			m2 = regex.mshort.exec(token);
			if(m2){
				mstack.push({nodeid:  parseInt(m2[1]) - 1, type: "short"});
				continue;
			}
			m2 = regex.mtransform.exec(token);
			//console.log(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "transform", word: m2[2]});
				continue;
			}
			m2 = regex.mremove.exec(token);
			if(m2){
				if(m2[1].lastChar() == "_"){
					mstack.push({nodeid: parseInt(m2[1]) - 1, type: "removenode"});
				}else{
					mstack.push({nodeid: parseInt(m2[1]) - 1, type: "remove"});
				}
				continue;
			}
			m2 = regex.mappend.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "append", word: m2[2]});
				continue;
			}
			
			m2 = regex.mrepapp.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "repapp", repword: m2[2], word: m2[3]});
				continue;
			}
			m2 = regex.mrepins.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "repins", repword: m2[3], lword: m2[1], rword: m2[4]});
				continue;
			}
			m2 = regex.mreppre.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "reppre", repword: m2[3], word: m2[1]});
				continue;
			}
			m2 = regex.minside.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "inside", lword: m2[1], rword: m2[3]});
				continue;
			}
			m2 = regex.mprepend.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[2]) - 1, type: "prepend", word: m2[1]});
				continue;
			}
			m2 = regex.mreplace.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "replace", repword: m2[2]});
				continue;
			}
			m2 = regex.mdefault.exec(token);
			if(m2){
				mstack.push({nodeid: parseInt(m2[1]) - 1, type: "default"});
				continue;
			}
			mstack.push({nodeid: parseInt(token.substr(1,token.length-2)) - 1, type:"retain"});
		}else{
			m = regex.mfunction.exec(rights);
			if(m){
				mstack.push({function: m[1].trim()});
				break;
			}else{
				if(rights.trim() == "transform" || rights.trim() == "" || rights.trim() == "auto"){
					mstack.push({function: "TFCoreLn"});
					break;
				}
			}
		}
	}while (m!=null);
	if(mstack.length >0 && !mstack[0]["function"])
	if(mstack.length<stack.length){
		for(var i=0;i<stack.length;i++){
			var fl = false;
			for(var j=0;j<mstack.length;j++){
				if(mstack[j].nodeid == i){
					fl=true;
					break;
				}
			}
			if(!fl){
				mstack.push({nodeid:i, type:"remove"});
			}
		}
	}
	var strat = window.meanstrategy;
	if(sub){
		strat = meanengine.db.subpattern;
	}
	for(var i=0;i<stack.length;i++){
		if(stack[i].type=="exact" && stack[i].word!="的"){
			if(stack[i].word in strat){
				if(!strat[stack[i].word].stack){
					(function(w,dic){
						dic["_def-"+w]=dic[w];
						dic[w]=function(root,subbound){
							for(var i2=0;i2<dic[w].stack.length;i2++){
								if(dic[w].stack[i2](root,subbound)){
									break;
								}
							}
						}
						dic[w].stack=[
							function(node){
								dic["_def-"+w](node);
							}
						];
					})(stack[i].word,strat);
				}
			}else{
				(function(w,dic){
					dic[w]=function(root,subbound){
						for(var i2=0;i2<dic[w].stack.length;i2++){
							if(dic[w].stack[i2](root,subbound)){
								break;
							}
						}
					}
					dic[w].stack=[];
				})(stack[i].word,strat);
			}
			(function(w,startpoint,stk,transformer,base,bound,dic){
				for(var i=0;i<dic[w].stack.length;i++){
					if(dic[w].stack[i].indentity==base){
						return;
					}
				}
				dic[w].stack.push(function(noderoot,subbound){
					return window.meanengine.run(noderoot,stk,transformer,startpoint,false,subbound||bound);
				});
				dic[w].stack[dic[w].stack.length-1].indentity=base;
			})(stack[i].word,i,stack,mstack,baseln,bound,strat);
		}
	}
}
meanengine.shorthand=function(ln){
	return ln.replace(/^(>)?(.*?)\+(.*?)=(.*)/,"$1{$2}{*}{$3}->{1->$4}{2}{3}");
}
meanengine.shorthand2=function(ln){
	return ln.replace(/^\{0\}(.+?)=\{0\}(.+)/,"{1..2}{$1}->{1}{2->$2}").
		   replace(/^(.+?)\{0\}(.+?)=\{0\}(.+)/,"{$1}{1..2}{$2}->{1X}{2}{3->$3}").
		   replace(/^(.+?)\{0\}=\{0\}(.+)/,"{$1}{1..2}->{2}{1->$2}").

		   replace(/^\{0\}(.+?)=(.+?)\{0\}$/,"{1..2}{$1}->{2->$2}{1}").
		   replace(/^(.+?)\{0\}(.+?)=(.+?)\{0\}$/,"{$1}{1..2}{$2}->{1->$3}{2}{3X}").
		   replace(/^(.+?)\{0\}=(.+?)\{0\}$/,"{$1}{1..2}->{1->$2}{2}").

		   replace(/^\{0\}(.+?)=(.+?)\{0\}(.+)/,"{1..2}{$1}->{$2+1}{2->$3}").
		   replace(/^(.+?)\{0\}(.+?)=(.+?)\{0\}(.+)/,"{$1}{1..2}{$2}->{1->$3}{2}{3->$4}").
		   replace(/^(.+?)\{0\}=(.+?)\{0\}(.+)/,"{$1}{1..2}->{1->$2}{2+$3}").
		   replace(" *","");
}
meanengine.lbound = function(node,chk){
	if(!chk){
		return node.isspace(false);
	}else{
		return node.pE().id != chk.l;
	}
}
meanengine.rbound = function(node,chk){
	if(!chk){
		return node.isspace(true);
	}else{
		return node.nE().id != chk.r;
	}
}
meanengine.islbound = function(node,chk){
	if(chk){
		return node.id == chk.l;
	}
}
meanengine.isrbound = function(node,chk){
	if(chk){
		return node.id == chk.r;
	}
}
meanengine.subrun=function(root,bound){
	var node = root;
	var cn,lc;
	var dic = meanengine.db.subpattern;
	while(node.id != bound.r){
		cn=node.gT();
		lc=cn.lastChar();
		if(cn in dic){
			dic[cn](node,bound);
		}
		else if(meanengine.db.tokenfind.locat.indexOf(lc)>=0){
			dic['_L'](node,bound);
		}
		else if(lc=='的'){
			dic['_的'](node,bound);
		}
		node = node.nE();
	}
}
meanengine.run=function(root,stack,transform,start,anl,bound){
	if(anl){
		prediction.parse(root,function(){
			meanengine.run(root,stack,transform,start);
		});
	}
	var subbound = false;
	if(!bound.r){
		bound = false;
	}else{
		if(!isNaN(bound.r)){
			subbound = {
				l:bound.l,
				r:bound.r
			};
			bound = false;
		}
	}
	var flag=false;
	var cr = start;
	var nodepointer=root;
	var nodel = [root];

	if(stack[cr].isfirst){
		if(nodepointer.isspace(false)){
			return false;
		}
	}
	if(stack[cr].islast){
		if(nodepointer.isspace(true)){
			return false;
		}
	}
	if(start>0){
		for(;cr>=0;cr--){
			if(stack[cr].isfirst){
				if(this.lbound(nodepointer,bound)){
				//if(nodepointer.isspace(false)){
					return false;
				}
			}
			if(stack[cr].islast){
				if(this.rbound(nodepointer,bound)){
				//if(nodepointer.isspace(true)){
					return false;
				}
			}
			if(cr>0 && (stack[cr-1].type=="extend"||stack[cr-1].type=="unlim")){
				if(cr-1 > 0){
					var rs = meanengine.finder(stack[cr-2],stack[cr-1],false,nodepointer);
					if(rs==false){
						return false;
					}
					nodel.unshift(rs.ins);
					nodel.unshift(rs.found);
					nodepointer=rs.found;
					cr--;
				}else if(stack[cr-1].isfirst){
					var rs = meanengine.findend(stack[cr-1],false,nodepointer);
					if(rs==false){
						return false;
					}
					nodel.unshift(rs);
					nodepointer=rs[0];
				}else{
					var rs = meanengine.findmax(stack[cr-1],false,nodepointer);
					if(rs==false){
						return false;
					}
					nodel.unshift(rs);
					nodepointer=rs[0];
				}
			}else{
				if(cr>0){
					var passer = {};
					if(nodepointer.pE() && nodepointer.isspace(false) && meanengine.matcher(stack[cr-1],nodepointer.pE(),passer)){
						nodel.unshift(passer.grp || nodepointer.pE());
						nodepointer=nodepointer.pE();
					}else{
						return false;
					}
				}
			}
		}
	}
	cr=start;
	nodepointer=root;
	var stmaxidx = stack.length-1;
	if(start<stack.length-1){
		
		for(;cr<=stmaxidx;cr++){
			if(stack[cr].isfirst){
				if(this.lbound(nodepointer,bound)){
				//if(nodepointer.isspace(false)){
					return false;
				}
			}
			if(stack[cr].islast){
				if(this.rbound(nodepointer,bound)){
				//if(nodepointer.isspace(true)){
					return false;
				}
			}
			if(cr<stmaxidx && (stack[cr+1].type=="extend"||stack[cr+1].type=="unlim")){
				if(stack[cr+1].islast){
					var rs = meanengine.findend(stack[cr+1],true,nodepointer);
					if(rs==false){
						return false;
					}
					nodel.push(rs);
					nodepointer=rs[rs.length-1];
				}else if(cr+1 < stmaxidx){
					var rs = meanengine.finder(stack[cr+2],stack[cr+1],true,nodepointer);
					if(rs==false){
						return false;
					}
					nodel.push(rs.ins);
					nodel.push(rs.found);
					nodepointer=rs.found;
					cr++;
				}else{
					var rs = meanengine.findmax(stack[cr+1],true,nodepointer);
					if(rs==false){
						return false;
					}
					nodel.push(rs);
					nodepointer=rs[rs.length-1];
				}
			}else{
				if(cr<stmaxidx){
					var passer = {};
					if(nodepointer.nE() && nodepointer.isspace(true) && meanengine.matcher(stack[cr+1],nodepointer.nE(),passer)){
						nodel.push(passer.grp || nodepointer.nE());
						nodepointer=nodepointer.nE();
					}else{
						return false;
					}
				}
			}
		}
	}
	var mct = g(contentcontainer);
	for(var i=0;i<nodel.length;i++){
		if(nodel[i].length==1){
			nodel[i]=nodel[i][0];
			meanstrategy.highlight(nodel[i],"ln");
			continue;
		}
		if(nodel[i].length===0){
			nodel[i] = document.createElement("i");
			//mct.insertBefore(nodel[i], nodel[i+1]);
			nodel[i].id="emp"+i;
		}
		if(nodel[i].push){
			for(var j=0;j<nodel[i].length;j++){
				meanstrategy.highlight(nodel[i][j],"ln");
			}
		}else{
			meanstrategy.highlight(nodel[i],"ln");
		}
	}
	//console.log(nodel)
	var performtrans=[];
	
	if(false && subbound){
		var nroot = nodel[subbound.l + 1];
		if(nroot.push){
			nroot = nroot[0];
		}
		var bl = nodel[subbound.l];
		var br = nodel[subbound.r];
		subbound.l = bl.id || bl[bl.length-1].id;
		subbound.r = br.id || br[0].id;
		meanengine.subrun(nroot,subbound);
	}
	if(transform[0] && transform[0]["function"]){
		return window[transform[0]["function"]](nodel);
	}
	meanengine.transform(nodel,transform,performtrans);
	meanengine.swapper2(nodel,performtrans);

	return true;
}
meanengine.transform=function(nodel,transform,performtrans){
	
	var removedword=[];
	for(var i=0;i<transform.length;i++){
		var nodeid = transform[i].nodeid;
		if(!nodel[nodeid]){
			console.log("Unexpected nodeId "+nodeid);
			return;
		}
		if(nodel[nodeid].length>0){
			var b=nodel[nodeid];
			if(transform[i].type=="default"){
				for(var j=0;j<b.length;j++){
					b[j].textContent=getDefaultMean(b[j]);
				}
			}else
			if(transform[i].type=="remove"){
				for(var j=0;j<b.length;j++){
					b[j].textContent="";
				}
			}else
			if(transform[i].type=="transform"){
				if(transform[i].word[0]=="&"){
					b[0].textContent=getDefaultMean(nodel[parseInt(transform[i].word.substring(1)) - 1]);
				}else
				b[0].textContent=transform[i].word;
				for(var j=1;j<b.length;j++){
					b[j].textContent="";
				}
			}else
			if(transform[i].type=="append"){
				b[b.length-1].textContent = getDefaultMean(b[b.length-1]) + " "+transform[i].word;
			}else
			if(transform[i].type=="prepend"){
				b[0].textContent =transform[i].word + " " + getDefaultMean(b[0]);
			}else
			if(transform[i].type=="replace"){
				var rp = transform[i].repword.split("/");
				rp[0] = new RegExp(rp[0], "g");
				for(var j=0;j<b.length;j++){
					if(rp.length>1){
						b[j].textContent=getDefaultMean(b[j]).replace(rp[0],rp[1]);
					}else{
						b[j].textContent=getDefaultMean(b[j]).replace(rp[0],"");
					}
				}
			}
		}else{
			if(transform[i].type=="removenode"){
				nodel[nodeid].textContent="";
				nodel[nodeid].cn="";
				nodel[nodeid].setAttribute("t", "");
			}else
			if(transform[i].type=="default"){
				if(i==0 && isUppercase(nodel[0])){
					nodel[nodeid].textContent=ucFirst(getDefaultMean(nodel[nodeid]));
				}else
				nodel[nodeid].textContent=getDefaultMean(nodel[nodeid]);
			}else
			if(transform[i].type=="retain"){
				if(i==0 && isUppercase(nodel[0])){
					nodel[nodeid].textContent=ucFirst(nodel[nodeid].textContent);
				}
				//nodel[nodeid].textContent=getDefaultMean(nodel[nodeid]);
			}else
			if(transform[i].type=="remove"){
				nodel[nodeid].textContent="";
				//nodel[nodeid].cn = "";
				//nodel[nodeid].setAttribute("t", "");
			}else
			if(transform[i].type=="transform"){
				if(transform[i].word[0]=="&"){
					transform[i].word=getDefaultMean(nodel[parseInt(transform[i].word.substring(1)) - 1]);
				}else
				if(i==0 && isUppercase(nodel[0])){
					//nodel[nodeid].textContent=ucFirst(getDefaultMean(nodel[nodeid]));
					nodel[nodeid].textContent=ucFirst(transform[i].word);
				}else
				nodel[nodeid].textContent=transform[i].word;
			}else
			if(transform[i].type=="short"){
				nodel[nodeid].textContent=meanengine.getshortform(nodel[nodeid].gT());
			}else
			if(transform[i].type=="append"){
				transform[i].word = transform[i].word.replace(/\&(\d)/g, function(a,b){return removedword[parseInt(b)-1]});
				if(i==0 && isUppercase(nodel[0])){
					nodel[nodeid].textContent=ucFirst(getDefaultMean(nodel[nodeid]) + " "+transform[i].word);
				}else
				nodel[nodeid].textContent = getDefaultMean(nodel[nodeid]) + " "+transform[i].word;
			}else
			if(transform[i].type=="prepend"){
				if(i==0 && isUppercase(nodel[0])){
					nodel[nodeid].textContent=ucFirst(transform[i].word + " " + getDefaultMean(nodel[nodeid]));
				}else
				nodel[nodeid].textContent =transform[i].word + " " + getDefaultMean(nodel[nodeid]);
			}else
			if(transform[i].type=="replace"){
				var rp = transform[i].repword.split("/");
				rp[0] = new RegExp(rp[0], "g");
				var oldtext = getDefaultMean(nodel[nodeid]);
				if(rp.length>1){
					nodel[nodeid].textContent=oldtext.replace(rp[0],rp[1]);
					//removedword.push(oldtext.replace(nodel[nodeid].textContent,""));
				}else{
					nodel[nodeid].textContent=oldtext.replace(rp[0],"");
					removedword.push(oldtext.replace(nodel[nodeid].textContent,""));
				}
			}else
			if(transform[i].type=="reppre"){
				var rp = transform[i].repword.split("/");
				rp[0] = new RegExp(rp[0], "g");
				var lw=getDefaultMean(nodel[nodeid]);
				if(rp.length>1){
					lw=transform[i].word+" "+lw.replace(rp[0],rp[1]);
				}else{
					lw=transform[i].word+" "+lw.replace(rp[0],"");
				}
				nodel[nodeid].textContent =lw;
			}else
			if(transform[i].type=="repapp"){
				var rp = transform[i].repword.split("/");
				rp[0] = new RegExp(rp[0], "g");
				var lw=getDefaultMean(nodel[nodeid]);
				if(rp.length>1){
					lw=lw.replace(rp[0],rp[1])+" "+transform[i].word;
				}else{
					lw=lw.replace(rp[0],"")+" "+transform[i].word;
				}
				nodel[nodeid].textContent =lw;
			}else
			if(transform[i].type=="repins"){
				var rp = transform[i].repword.split("/");
				rp[0] = new RegExp(rp[0], "g");
				var lw=getDefaultMean(nodel[nodeid]);
				if(rp.length>1){
					lw=transform[i].lword+" "+lw.replace(rp[0],rp[1])+" "+transform[i].rword;
				}else{
					lw=transform[i].lword+" "+lw.replace(rp[0],"")+" "+transform[i].rword;
				}
				nodel[nodeid].textContent =lw;
			}else
			if(transform[i].type=="inside"){
				var lw=getDefaultMean(nodel[nodeid]);
					lw=transform[i].lword+" "+lw+" "+transform[i].rword;
				nodel[nodeid].textContent =lw;
			}
		}
		
		performtrans.push(nodel[transform[i].nodeid]);
	}
}
meanengine.checkparse=function(source){
	if(source in this.parsed){
		return true;
	}else{
		this.parsed[source]=true;
		return false;
	}
}
meanengine.db={};
meanengine.db.subpattern={
	"_L":function(node){},
	"_的":function(node){}
};
meanengine.db.default=[
	"为何 PN={1->vì sao}{2}",
	"> 面板 <={1->bảng thuộc tính}",
	//"> 之前={1->trước đó}",
	"> {可}{SW}={1->nhưng}{2}",
	"> {可}{1}[:v]={1->có thể}{2}",
	"> 可 <={1->có thể}",
	"> 可={1->nhưng}",
	"{连} {1}[:v] {S}={1->liên tục}{2}{3}",
	"{被} {PN} {给} {1}[:v]={1}{2}{3->}{4}",
	"{连} {1}[:n]={1->ngay cả}{2}",
	"怎么 个 1~4 法 <={3}{4->như thế nào}",
	"带着 * 目的 来={1}{3}{2}{4->mà tới}",
	"带着 * 目的={1}{3}{2}",
	"回 1~5 *信={1->trả lời tin của}{2}",
	//"*在 * 时={1-tại/trong lúc}{2}",
	"受 1~10 影响={1+ảnh hưởng của}{2}",
	"*像 * 一样 简单={1-giống/đơn giản giống}{2}",
	"*像 * 一样={1}{2}",
	"*待 * 态度={thái độ+1}{2}",
	"*持 * 热情={1}{3}{2}",
	"刷新 * 记录={1->phá kỷ lục}{2}",
	"除了 * *外 <={1}{2}{3-ngoài|bên ngoài|ở ngoài}",
	"如 * 般={1->giống như}{2}",
	":像是 1~10 一般={1}{2}",
	":像 1~10 一般={1}{2}",
	"如 1~10 一般={1->giống như}{2}",
	"跟 1~10 一样={1->giống như}{2}",
	"回复 1~6 消息={1->trả lời tin của}{2}",

	"没有回复 1~6 消息={1->không có trả lời tin của}{2}",
	//"在 <={1->ở đây}",
	"*让 1~2 给 1 <={1-để cho|nhường|nhượng|để|làm cho/bị}{2}{4}",
	"练习 1~6 过程中={trong quá trình+1}{2}",
	//"通过 1~5 的 1 *来={1}{4}{3}{2}{5->để}",
	"可行 <={1->có thể thực hiện}",
	"> 过后={1->sau đó}",
	"> 吆喝 <={1->oh}",
	"@_L:1{SD}[1,1]{*L}[^trong]={trong+1}{2-trong}",
	"@_L:1{SD}[1,1]{*L}[^bên trong]={trong+1}{2-bên trong}",
	"@_L:1{SD}[1,1]{*L}[^trên]={trên+1}{2-trên}",
	"@_L:1{SD}[1,1]{*L}[^bên trên]={trên+1}{2-bên trên}",
	"是以 1~3 打造的={1->là dùng}{2}{3->mà chế tạo ra}",
	"出自 1~10 *口={1+miệng của}{2}",
	"不会是 N 的 对手={1+đối thủ của}{2}",
	"是 N 的 对手={1->là đối thủ của}{2}",
	"正在 0~2 *着={1->đang}{2}{3}",
	"正在 1~20 中 <={1->đang}{2}",
	"> 在 t:F 时 <={1->lúc ở}{2}",
	"> 在 1~20 时 <={1->lúc}{2}",
	"> 在 1~20 时候 <={1->lúc}{2}",
	"> 等 1~20 时候 <={1->chờ đến lúc}{2}",
	"> 等 1~20 时 <={1->chờ đến lúc}{2}",
	"> 在 1~20 之后 <={1->sau khi}{2}",
	"> 却在 1~20 时 <={1->nhưng khi}{2}",
	"> 却在 1~20 时候 <={1->nhưng khi}{2}",
	"> 看向 1~20 时 <={1->khi nhìn về}{2}",
	"> 在没有 1~20 之前 <={1->khi chưa có}{2}",
	"> 每次 1~20 的时候 <={1->mỗi khi}{2}",
	"{在} {1}[:v] {1~20} {的时候}<={1->khi}{2}{3}",
	"{在} {1}[:v] {1~20} {:的} {时候}<={1->khi}{2}{3}{4}",
	"*当 1~20 时候 <={1}{2}",
	"*当 1~20 的时候 <={1}{2}",
	":是 ~ 后 ~ :的 1 <={1}{6}{5}{4}{3}{2}",
	"就连 ~ *也={1->ngay cả}{2}{3}",
	"那些 0~2 :们={1->những}{2}{3-các|nhóm+kia}",
	"地 <={1->địa}",
	"不对付 <={1->không hợp nhau}",
	"置 1~5 于 不顾 <={1->không đặt}{2}{3->trong lòng}",
	"S 以下={1}{2->trở xuống}",
	"S 以上={1}{2->trở lên}",
	"以上 S={1->dùng hơn}{2}",
	"> 以上={1->phía trên}",
	"让 PN <={1->nhường}{2}",
	"让 1={1->để cho}{2}",
	"一个 能 1~10 *的 1 <={1}{5}{2}{3:}{4}",
	"唯一一个 能 1~10 *的 1 <={một cái+5+duy nhất}{có thể+3}",
	"一个 能够 1~10 *的 1 <={một cái+5}{có thể+3}",
	"唯一一个 能够 1~10 *的 1 <={một cái+5+duy nhất}{có thể+3}",
	"从 1~2 深处={1->từ sâu trong}{2}",
	"向 1~2 深处={1->hướng sâu trong}{2}",
	"*以 1~3 之势={1->lấy thế}{2}",
	"问道 <={1->hỏi}",
	"如同 1~5 一般={1}{2}",
	"似乎 ~ 一般={1}{2}",
	"有种 1~6 *的 感觉={1->có loại cảm giác}{2}{3}",
	"N 自己的选择={1}{2->tự lựa chọn}",
	"有 1~3 ~实力={1+thực lực}{2}{3-thực lực|của}",
	"> 一般={1->bình thường}",
	"> 这 不 <={1->không}{2->phải sao}",
	"跟 1~3 似的 <={1->như}{2}",
	"*是 0~3 没 跑了 <={1}{2}{4->không sai được}",
	"到 1~3 来过={1->từng đến}{2}",
	//"是不是 1~9 一会 就:={1->có phải}{2+hay không}{3}{4}",
	//"是不是 1~9 就:={1->có phải}{2+hay không}{3}",
	":有 1~10 可能={1+khả năng}{2}",
	//"是不是 1~9 <={1->có phải}{2+hay không}",
	//"一个 ~ *中={1->trong một cái}{2}{3-bên trong|ở trong|trong}",
	"便闻 到 *一 1~99 的 味道={1-nghe/ngửi}{2}{3+mùi vị}{4}",
	"便闻 *一 1~99 的 味道={1-nghe/ngửi}{2+mùi vị}{3}",
	":到 1~3 的 面前={1+trước mặt}{2}",
	":在 1~3 的 头顶={1->ở trên đỉnh đầu}{2}",
	":在 1~3 的 头上={1->ở trên đầu}{2}",
	"> 总 ~ *数={1->tổng}{2}{3}",
	"> 总 ~ S={1->tổng}{2}{3}",
	"> 总 ~ *了={1->cuối cùng}{2}{3}",
	"> 总 ~ PN={1->luôn}{2}{3}",
	//"被 1~6 的 1 <={4}{1}{2}{3X}",
	"t:F 四大 ~之一={2->một trong tứ đại}{3-một trong}{ở+1}",
	"t:F 三大 ~之一={2->một trong tam đại}{3-một trong}{ở+1}",
	"t:F 五大 ~之一={2->một trong ngũ đại}{3-một trong}{ở+1}",
	"t:F 六大 ~之一={2->một trong lục đại}{3-một trong}{ở+1}",
	"t:F 七大 ~之一={2->một trong thất đại}{3-một trong}{ở+1}",
	"t:F 八大 ~之一={2->một trong bát đại}{3-một trong}{ở+1}",
	"t:F 九大 ~之一={2->một trong cửu đại}{3-một trong}{ở+1}",
	"t:F 十大 ~之一={2->một trong thập đại}{3-một trong}{ở+1}",

	"t:F 四大 1~5 之一={2->một trong tứ đại}{3-một trong}{4-một trong}{ở+1}",
	"t:F 三大 1~5 之一={2->một trong tam đại}{3-một trong}{4-một trong}{ở+1}",
	"t:F 五大 1~5 之一={2->một trong ngũ đại}{3-một trong}{4-một trong}{ở+1}",
	"t:F 六大 1~5 之一={2->một trong lục đại}{3-một trong}{4-một trong}{ở+1}",
	"t:F 七大 1~5 之一={2->một trong thất đại}{3-một trong}{4-một trong}{ở+1}",
	"t:F 八大 1~5 之一={2->một trong bát đại}{3-một trong}{4-một trong}{ở+1}",
	"t:F 九大 1~5 之一={2->một trong cửu đại}{3-một trong}{4-một trong}{ở+1}",
	"t:F 十大 1~5 之一={2->một trong thập đại}{3-một trong}{4-một trong}{ở+1}",

	"四大 ~ ~之一={1->một trong tứ đại}{2-một trong}{3-một trong}",
	"三大 ~ ~之一={1->một trong tam đại}{2-một trong}{3-một trong}",
	"五大 ~ ~之一={1->một trong ngũ đại}{2-một trong}{3-một trong}",
	"六大 ~ ~之一={1->một trong lục đại}{2-một trong}{3-một trong}",
	"七大 ~ ~之一={1->một trong thất đại}{2-một trong}{3-một trong}",
	"八大 ~ ~之一={1->một trong bát đại}{2-một trong}{3-một trong}",
	"九大 ~ ~之一={1->một trong cửu đại}{2-một trong}{3-một trong}",
	"十大 ~ ~之一={1->một trong thập đại}{2-một trong}{3-một trong}",
	
	"一次 ~ *的 机会={1->một cơ hội}{2}{3}",
	"二次 ~ *的 机会={1->hai cơ hội}{2}{3}",
	"三次 ~ *的 机会={1->ba cơ hội}{2}{3}",
	"四次 ~ *的 机会={1->bốn cơ hội}{2}{3}",
	"五次 ~ *的 机会={1->năm cơ hội}{2}{3}",
	"六次 ~ *的 机会={1->sáu cơ hội}{2}{3}",
	"七次 ~ *的 机会={1->bảy cơ hội}{2}{3}",
	"八次 ~ *的 机会={1->tám cơ hội}{2}{3}",
	"九次 ~ *的 机会={1->chín cơ hội}{2}{3}",
	"十次 ~ *的 机会={1->mười cơ hội}{2}{3}",
	"往 1~3 来={1->tới}{2}",
	"往 1~3 来了={1->tới}{2}",
	"往 1~3 *来={1->hướng tới}{2}{3-tới}",
	"一 1 就={1->vừa}{2}{3}",
	"在进入 1~3 之前={trước+1}{2}",
	":在 [ :这 1~8 ] 上={1+trên}{3+này}",
	":在 [ 1~5 ] 上={1+trên}{2}",
	":在 [ :这 1~8 ] 中={1+trong}{3+này}",
	":在 1~5 中的 1~5 中={1+trong}{4}{5}{3}{2}",
	":在 [ 1~5 ] 中={1+trong}{2}{3X}",
	"SD [ 1~2 ] 中={trong+1}{2}",

	":在 [ 1~5 ] 之中={1+trong}{2}{3->}",
	":从 [ :这 1~8 ] 中={1+trong}{3+này}",

	":从 [ 1~5 ] 中={1+trong}{2}",
	":进 [ 1~5 ] 中={1+trong}{2}",
	":到 [ 1~5 ] 中={1+trong}{2}",
	":到了 [ 1~5 ] 中={1+trong}{2}",
	":入 [ 1~5 ] 中={1+trong}{2}",
	":入了 [ 1~5 ] 中={1+trong}{2}",
	":入 [ 1~5 ] 之中={1+trong}{2}",

	":到 [ 1~5 ] 上={1+trên}{2}",
	":到了 [ 1~5 ] 上={1+trên}{2}",

	":是 [ 1~5 ] 里={1+trong}{2}",
	":在 [ 1~5 ] 里={1+trong}{2}",
	//	"N 上={2->trên}{1}",
	"t:F 上={2->trên}{1}",
	"t:F 中={2->trong}{1}",
	"t:F 内={2->trong}{1}",
	"t:F 里={2->trong}{1}",
	"t:F 之中={2->bên trong}{1}",
	"t:F 之上={2->phía trên}{1}",
	"PN 在 t:F 的 地位={địa vị của+1}{2}{3}",
	"PN 在 N 的 地位={địa vị của+1}{2}{3}",
	"这 1~3 ] 上={1->trên}{2}{3->này}",
	//"这 0~3 上={trên+1-này}{2-này}{3->này}",
	"这 1~3 ] 中={trong+1}{2}{3->này}",
	//"这 0~3 中={trong+1-này}{2-này}{3->này}",
	"在 1~3 眼中={1->ở trong mắt}{2}",
	"PN 眼中={2}{1}",
	"在 成为 1~8 之前={1->trước khi}{2}{3}",
	"> 内 个 <={1->cái}{2->kia}",
	"足足 1~3 多={1+hơn}{2}",
	"仿佛在 1~3 一般={1->giống như đang}{2}",
	"在 1~5 带领下={1->dưới sự dẫn đầu của}{2}",
	"个头 ~ *低高腰肩={1->chiều cao}{2}{3}",
	"挡 1~3 *的 路={1->cản đường}{2}{3}",
	"也 <={1->a}",
	"> 中 S={1->trúng}{2}",
	"这花 S={1->lần này tốn}{2}",
	"不止 <={1->không ngừng}",
	"这么 1 <={1X}{2+như vậy}",
	"那么高 的 1 <={1-> }{2-> }{3+cao như vậy}",
	"那样 的 1 <={1X}{2X}{3+như thế}",
	"这样 的 1 <={1X}{2X}{3+như vậy}",
	"如此 1 <={1X}{2+như thế}",
	"这般 1 <={1X}{2+như vậy}",

	//"这么 1 <={1+như vậy}",
	//	"将 那:={1->đem}{2}",
	//	"将 这:={1->đem}{2}",
	///	"将 此:={1->đem}{2}",
	//	"将 下 <{1->sẽ}{2->xuống}",
	//	"将 1 <={1->sẽ}{2}",
	"有着 1 一般 *的 1 <={1->có}{5+giống như}{2}",
	"有着 1 一般 *的={1->có giống như}{2}{3X}{4}",
	"进入 1~3 前={1->trước khi vào}{2}",
	"得很 <={1->vô cùng}",
	"中了 ~ *的 算计={1->đã trúng kế của}{2}{3}",
	"距离 S={1->cách}{2}",
	"距离 t:F={1->cách}{2}",
	"受到 ~ ~尊敬={1->được}{2}{3}",
	"S 出头={2->hơn}{1:}",
	"S 刚出头={2->vừa mới hơn}{1:}",
	"敢杀 ~ 的 人={người+1}{2}",
	"被 [ 1~5 ] 所={1}{2}",
	"PN 所={1}",
	"S 个人={1}{2->người}",
	"*听 ~ 的话 <={1}{2}{3->lời nói}",
	"来也 <={1->tới đây}",
	"然也 <={1->đúng vậy}",
	"走下去 <={1->tiếp tục đi}",
	"抱着 将他 1 目的={1->mang theo mục đích}{3}{2->hắn}",
	"抱着 1~8 目的={1->mang theo mục đích là}{2}",
	"比 1~2 要 1~2 多:={1X}{3X}{4+hơn}{2}{5->nhiều}",
	//"一边 1 着={1->vừa đang}{2}",
	"*每 ~ 都将={1}{2}{3->đều sẽ}",
	"S 要 1~5 了 <={1}{2->là sẽ}{3}{4->rồi}",
	//"要 1~5 了 <={1->sắp}{2}{3->rồi}",
	//"S 要 :了 <={1}{2->là sẽ}{3+rồi}",
	//"要 :了 <={1->sắp}{2-rồi+rồi}",
	//"> 1 了 <={1-rồi}{2->rồi}",
	//"> PN 1 了 <={1}{2-rồi}{3->rồi}",
	"> PN 道 <={1}{2->nói}",
	"PN :和 1~3 分手后={2->sau khi}{1+chia tay}{3}",
	":和 1~3 分手后={1->sau khi chia tay}{2}",
	":在 1~4 手中={1+trong tay}{2}",
	"PN 手中={2}{1}",
	"进入: 1~5 状态={1+trạng thái}{2}",
	//"> 1 的 人={người+1}{2X}{3X}",
	"把 1~3 变成了={1->đã biến}{2}{3->thành}",
	"足有 S 之多={1->có hơn}{2}",
	"足有 S S 之多={1->có hơn}{2}{3}",
	"PN 在 1~8 做 的 事:={6->chuyện}{1}{4}{2->ở}{3}{5X}",
	"{S}[năm]{里}={trong+1}{2->}",
	"S 两={1}{2->lạng}",
	"> 这样 PN={1->như vậy}{2}",
	":中 分别 有={1}{2->có chia}{3->thành}",
	"仿佛 1~5 一般={1->giống như là}{2}{3->}",
	//"再来 S={1->lại thêm}{2}",,,
	//MG
	"这些 1~2 L={3+những}{2}{1->này}",
	"这个 t:F L={3}{2}{1->này}",
	"这 t:F L={3}{2}{1->này}",
	"那些 1~2 实:={1->những}{2+kia}{3}",
	"这个 1~2 是:={1->cái}{2+này}{3}",
	"PN 的 这个 1~2 的 1 <={6+của}{4}{3->này của}{1:}",
	//ST
	"在没有 其他 ~ 情况 下={1->trong tình huống không có}{3+khác}",
	"在没有 ~ 情况 下={1->trong tình huống không có}{2}",
	"在 ~ 情况 下={1->dưới tình huống}{2}",
	"看了 PN 一眼={1->liếc}{2}{3->một cái}",
	"> 就在 1~10 之间 <={1->ngay lúc}{2}",
	//SS
	"和 1~3 不一样={1->không giống với}{2}",
	//LR
	"在 我 这={3->ở ta cái này}",
	"在 那={1->ở}{2->đó}",
	"那 儿={1->chỗ}{2->đó}",
	"这 儿={1->chỗ}{2->này}",

	"{PN}[2,] {体内}={trong cơ thể của+1}{2X}",
	"{PN}[2,] {R1} {体内}={trong cơ thể của+1}{2X}{3X}",
	"{PN}[2,] {身体}={cơ thể của+1}{2X}",
	"{PN}[2,] {R1} {身体}={cơ thể của+1}{2X}{3X}",
	"{PN}[2,] {注意力}={sự chú ý của+1}{2X}",
	"{PN}[2,] {R1} {注意力}={sự chú ý của+1}{2X}",
	"{被} {1}[:v,vn] {0~3} {:的} {PN}={4}{1}{2}{3}",
	":是 之前={1}{2->lúc trước}",
	//"{:着}[2,] {一个} {1}[:n]<={có+2}{3}{đang+1}",
	//"{:着}[2,] {一个} {~} {:的} {1}<={có+2}{5}{3}{4}{đang+1}",
	//"@_的:3{:着}[2,] {SD} {~} {:的} {1}<={có+2}{5}{3}{4}{đang+1}",
	//"@_的:3{:着}[2,] {SD} {~} {:的} {1}[:a,n] {1}[:n]={có+2}{6}{5}{3}{4}{đang+1}",
	//":着 一个={có đang+1}{2}",
	"要回来 <={1->sẽ trở về}",
	"{好} {1}[:v]={1->dễ}{2}",
	"{好} {1}[:i,a]={1->thật}{2}",
	"{PN} {好}<={1}{2->tốt}",
	"{1}[:uj,v,i,a] {得}={1}{2->đến}",
	"{这么多} {1}[:n]={1->nhiều}{2+như vậy}",
	"{这么多} {R1} {1}[:n]={1->nhiều}{2}{3+như vậy}",
	"P 如此 1 的 1 <={5}{3}{như+1}",
	"P 如此 :的 1 <={4}{3}{như+1}",
	"> 上 <={1->lên}",
	"还给 1 <={1->trả cho}{2}",
	"还给 1 R<={1->trả cho}{2}",
	"还给我 <={1->trả cho ta}",
	"还给我 R <={1->trả cho ta}",
	"{1}[:v,vg,a]{下去}={1}{2->tiếp}",
	"{1}[^đang]{着}={1}",
	"{1}[2,]{儿}={1}",
	"{1}[:v]{住}={1}{2->nổi}",
	//"@_的:0>{:的}{N}={2}{1:}",
	//">{1}[:3,]{的}{N}={3}{1:}{2}",
	//"@_的:2>{1}[:v]{1~2}{:的}{N}={4}{1:}{2}{3}",
	//">{1}[:v]{1~2}{的}{N}<={4}{1}{2}{3}",
	//">{1}[:n,s]{1}[:v,r]{0~2}{的}{N}={5}{1}{2}{3}{4}",
	"再 1 点={1}{2}{3->thêm chút}",
	"朝 <={1->triều}",
	"冲 <={1->xông}",
	"{这} {1}[^trong|bên trong|trên]={1->}{2+này}",
	"{PN} {0~2} {给} {PN} {1}[:v]={1}{2}{5}{3}{4}",
	"{:是} {PN} {1}[:v,vp] {PN} {的} {1}[:n,np,v,vp]<={1}{6+để}{2}{3}{5}{4}",
	
	//
	"{1}[:v,vp] {起来}={1}",
	"{:到} {PN} {1}[:s]=>{1}{3}{2}",
	//"{PN} {心} {中}={2->trong lòng}{1}",
	//"@_的:1>{PN} {*L} {1}[:n,np]<={3}{2}{1}",
	//
	//"@_的:1>{PN} {1} {*L} {1}[:n,np]<={3}{2}{1}",
	//"@_的:1>{1}[n,np] {*L} {1}[:n,np]<={3}{2}{1}",
	"{PN} {所在} {的} {1~2}[:n,np,ns]<={4+nơi}{1}{2->đang ở}",
	"{PN} {所在} {的} {1~2}[:n,np,ns] {*L}={5}{4+nơi}{1}{2->đang ở}",
	"S 天后={1}{2}",
	"天后={1->Thiên hậu}",
	//"@_L:2{:在}{PN}{*L}[:n,np]={1}{3-này+của}{2}",
	//"@_L:3{:在}{PN}{的}{*L}[:n,np]={1}{4-này+của}{2}{3}",
	//"@_L:2{:在}{PN}{*L}={1}{3-này}{2}",
	//"@_L:3{:在}{PN}{的}{*L}={1}{4-này}{2}{3}",
	"{当:}[khi] {*} {时}={1}{2}",
	//"@_的:1{PN}{1}[:a]{1}[:n,np,ns,m]<={3}{2+của}{1}",
	"{这种} {*L}[trong]={1->trong loại}{2+này}",
	"{这种} {*L}[trên]={1->trên loại}{2+này}",
	"{这种} {*L}[dưới]={1->dưới loại}{2+này}",
	"{这种} {*L}[giữa]={1->giữa loại}{2+này}",
	"{那种} {*L}[trong]={1->trong loại}{2+kia}",
	"{那种} {*L}[trên]={1->trên loại}{2+kia}",
	"{那种} {*L}[dưới]={1->dưới loại}{2+kia}",
	"{那种} {*L}[giữa]={1->giữa loại}{2+kia}",
	"{朝着} {1~2} {问道}={1}{2}{3->hỏi}",
	"在 ~ 过程中 <={1->trong quá trình}{2}",
	"@_的:0{如:} {1}[:n]={2}{1}",
	"@_的:2{SW} {这:} {*L} {1}[:n]<={1}{4}{3}{2}",
	"@_的:2{PN} {这:} {*L} {1}[:n]<={1}{4}{3}{2}",
	"@_的:1>{这:} {*L} {1}[:n]<={1}{4}{3}{2}",
	//"{和} {PN} {:的} {时候}={4}{1}{2}{3}",
	//"{SW} {PN} {SW} {PN} {1}[:v] {的} {1}[:n]<={1}{7}{2}{3}{4}{5}",
	//"{被} {1}[:n,np] {1}[:v,vp] {:的} {1}<={5}{1}{2}{3}{4}",
	//"~{被} {1}[:n,np] {:的}[:v,vp] {1}<={4}{1}{2}{3}",
	//"@_L:2{SW} {PN} {*L}={1}{3}{2}",
	"*L 面={1}",
	//":到 1~2 的时候={1}{3}{2}",
	//":到 1~2 时候={1}{3}{2}",
	"正准备 ~ 时候={3->khi}{1}{2}",
	//"@_L:1{SD}[một]{*L}[^trong|trên|dưới|ngoài|gần|xa]={1+&2}",
	"非 ~ 不可={1->không thể}{3->không}{2}",
	"抢 在 ~ 之前={1->giành trước}{2X}{3}{4X}",
];
meanengine.db.defaultwoln=[
	"{PN} {1}[:v,vp] {PN} {的} {1}[:n,np,v,vp]<={1}{2}{5}{4}{3}",
];
meanengine.db.defaultwln=[
	"@_的:1>{PN} {:的} {1~3}<=f(TFCoreLn)",
	"@_的:2>{PN} {1~5} {:的} {1~3}<=f(TFCoreLn)",
	"@_的:1>{PN} {*L} {1}[:n,np]<=f(TFCoreLn)",
	"有 ~ :的 ~ 在=f(TFCoreLn)",
];
meanengine.db.sdefault=[
	"刚刚 ~ :的 1={4}{1:}{2}{3}",
	"> PN 1 2~10 L 时={5}{1:}{2}{4}{3}",
	"> PN 3~10 时={3}{1:}{2}",
	"{将} {1} {1}[:v]={1X}{3-(đến|vào|tới|qua|lên|xuống|về).*}{2+&1}",
	"{把}[tới] {1} {1}<={1X}{3-tới}{2+tới}",
	"{把}[đến] {1} {1}<={1X}{3-đến}{2+đến}",
	"{把}[lên] {1} {1}<={1X}{3-lên}{2+lên}",
	"{把}[xuống] {1} {1}<={1X}{3-xuống}{2+xuống}",
	"{把}[qua] {1} {1}<={1X}{3-qua}{2+qua}",
	"朝着 1 1 <={3-tới|hướng|về+về}{1X}{2}",
	"朝 1 1 <={3-tới|hướng|về+về}{1X}{2}",
	"什么 1 <={1X}{2+gì}",
	"{什么} {1}[:n] {1}[:n]={1X}{2}{3+gì}",
	"{对} {PN} {的} {1}[:n,d]={4}{3}{1}{2}",
	"{对} {PN} {1}[:v] {的} {1}[:n,d]={5}{4}{3}{1}{2}",
	"{1}[:a]{的}{1}[:n,a]<={2:}{3}{1:}",
	"{1}[:a]{的}{1}[:n,a] {1}[:d,v,ad,p,u]={2:}{3}{1:}",
	//">{1}{PN}{的}{1}{SW}={1}{4+của}{2:}{5}{3_X}",
	">{PN}{的}{1}<={3+của}{1:}{2_X}",
	">{1}[:c,a]{PN}{的}{1}<={1}{4+của}{2:}{3_X}",
	">{PN}{的}{1}[:n]{1}[:v,d,ad,p,u]={3+của}{1:}{4}",
	">{PN}{的}{1}{被:}={3+của}{1}{4:}{2_X}",
	"{PN}{的}{1}{*和}{PN}{的}{1}={3+của}{1}{4->và}{7+của}{5}",
	"{成为} {PN} {的} {1} <={1}{4}{2}{3}",
	"{成为} {1} {的} {1} <={4}{1}{2}{3}",
	"{:是} {PN} {的} {1} <={1}{4+của}{2}{3_X}",
	"{是} {PN} {:的}[1,3] {1} <={1}{4+của}{2}{3}",
	"{是} {PN} {:的}[4,] {1} <={1}{4}{2}{3}",
	"{是} {:的} {1} <={1}{3}{2}",
	"{:是} {PN} {PN} {的} {1} <={1}{5+của}{4_X}{3}{2}",
	"{PN} {1}{的} {1}[:v]={1}{2}{3->mà}{4}",
	"{PN} {1}[:v]{的} {1}[:n] {1}[:n]<={5}{4}{1}{2}",
	
	"{PN} {1}[:v]{的} {1}[:n]<={4}{1}{2}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n] {1}[:n]<={5}{4}{2}{1}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n]<={4}{2}{1}",
	"{PN} {1}[:v]{的} {1}[:n] {1}[:n] {SW}={5}{4}{1}{2}{6}",
	"{PN} {1}[:v]{的} {1}[:n] {SW}={4}{1}{2}{5}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n] {1}[:n] {SW}={5}{4}{2}{1}{6}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n] {SW}={4}{2}{1}{5}",
	"{PN} {的} {1}[^trong|ngoài|trên|dưới]={3+của}{1}",
	"{PN} {的} {1} {1}[^trong|ngoài|trên|dưới]={4}{3+của}{1}",
	//">{PN} {1}{的} {1}<={4}{2+của}{1}",
	//">{PN} {1}[:v]{的} {1} {SW}={4}{1}{2}{5}",
	//">{PN} {1}{的} {1} {SW}={4}{2+của}{1}{5}",

	"@_的:1>{PN} {:的}[:v] {1}[này]<={3-này}{1}{2+này}",
	"@_的:1>{PN} {:的}[:v] {1}[:v]<={1}{2}{3}",
	"@_的:1>{PN} {:的}[:v] {1}[:n]<={3}{1}{2}",
	"@_的:1>{PN} {:的}[3,] {1}[:c]<={1}{2}{3}",
	"@_的:1>{PN} {:的}[3,] {1}[:v]<={1}{3}{2}",
	"@_的:1>{PN} {:的}[3,] {1}<={3}{2+của}{1}",
	"@_的:1>{PN} {:的}[:v] {1}[này] {SW}={3-này}{1}{2+này}{4}",
	"@_的:1>{PN} {:的}[:v] {1}[:n] {SW}={3}{1}{2}{4}",
	"@_的:1>{PN} {:的}[3,] {1}[:n] {SW}={3}{2+của}{1}{4}",
	"@_的:1>{PN} {:的}[3,] {1}[:n]<={3}{2+của}{1}",
	"@_的:1>{PN} {:的}[3,] {1}[:n] {SW}={3}{2+của}{1}{4}",


	//"{:是} {1} {PN} {PN} {的} {1} <={1}{2}{6+của}{5_X}{3}{4}",

	//"{:是} {1} {PN} {的} {1} <={1}{2}{5+của}{4_X}{3}",
	//"{:是} {1} {t:F} {的} {1} <={1}{2}{5+của}{4_X}{3}",
	//"{PN} {在} {~} {1}[:v] {~}<={1}{4}{5}{2}{3}",
	///"{PN} {在} {t:F} {~}<={1}{4}{2}{3}",

		"{:这} {PN} {的} {1} <={4}{2}{3_X}{1->này}",
	"{这} {PN} {:的} {1} <={4}{2}{3_X}{1->này}",
	"{这} {:的} {1} <={3}{2}{1->này}",
	"{:这} {PN} {PN} {的} {1} <={5}{4_X}{3}{2}{1->này}",
	//"{:这} {1} {PN} {PN} {的} {1} <={2}{6}{5_X}{3}{4}{1->này}",

	"{:这} {1} {PN} {的} {1} <={1}{2}{5}{4_X}{3}",
	"{:这} {1} {t:F} {的} {1} <={1}{2}{5}{4_X}{3}",



	"{被:在} {0~1} {L} {的} {1} <={5}{1}{2}{3}{4_X}",
	"{被:} {~} {:在} {~} {L} {的} {1} <={7}{1}{2}{3}{4}{5}{6}",


		//"{这}{SD}{1~2}[:n]{的}{1}[:n]={2}{5}{3}{1->này}{4}",
		//"{这}{SD}{1~2}[:a]{的}{1}[:n]={2}{5}{3}{1->này}{4}",
		//"{这}{SD}{1~2}{的}{VI}={2}{5}{3}{1->này}{4}",
	//"{这}{SD}{1~2}{的}{1}<={2}{5}{3}{1->này}{4}",
	//"{这}{SD}{:的}{VI}={2}{4}{3}{1->này}",
	//"{这}{SD}{:的}{1}<={2}{4}{3}{1->này}",

		"{这}{SD}{1~2}{的}{VI}={5}{2}{3}{1->này}{4}",
	"{这}{SD}{1~2}{的}{1}<={5}{2}{3}{1->này}{4}",
	"{这}{SD}{:的}{VI}={4}{2}{3}{1->này}",
	"{这}{SD}{:的}{1}<={4}{2}{3}{1->này}",

		"{那}{SD}{1~2}{的}{VI}={2}{5}{3}{1->kia}{4}",
	"{那}{SD}{1~2}{的}{1}<={2}{5}{3}{1->kia}{4}",
	"{那}{SD}{:的}{VI}={2}{4}{3}{1->kia}",
	"{那}{SD}{:的}{1}<={2}{4}{3}{1->kia}",

	"{SD}{1~2}{的}{VI}={1}{4}{2}{3}",
	"{SD}{1~2}{的}{1}<={1}{4}{2}{3}",
	"{SD}{:的}{VI}={1}{3}{2}",
	"{SD}{:的}{1}<={1}{3}{2}",

	//	"@_的:2{SD}{1~2}{:的}{VI}={1}{4}{2}{3}",
	//	"@_的:2{SD}{1~2}{:的}{1}<={1}{4}{2}{3}",
	//	"@_的:1{SD}{:的}{VI}={1}{3}{2}",
	//	"@_的:1{SD}{:的}{1}<={1}{3}{2}",

		"{这}{D}{1~2}{的}{VI}={2}{5}{3}{1->này}{4}",
	"{这}{D}{1~2}{的}{1}<={2}{5}{3}{1->này}{4}",
	"{这}{D}{:的}{VI}={2}{4}{3}{1->này}",
	"{这}{D}{:的}{1}<={2}{4}{3}{1->này}",

		"{那}{D}{1~2}{的}{VI}={2}{5}{3}{1->kia}{4}",
	"{那}{D}{1~2}{的}{1}<={2}{5}{3}{1->kia}{4}",
	"{那}{D}{:的}{VI}={2}{4}{3}{1->kia}",
	"{那}{D}{:的}{1}<={2}{4}{3}{1->kia}",

		"{D-}[1]{1~2}{的}{VI}={4}{2}{3}{1-cái}",
	"{D-}[1]{1~2}{的}{1}<={4}{2}{3}{1-cái}",
	"{D-}[1]{:的}{VI}={3}{2}{1-cái}",
	"{D-}[1]{:的}{1}<={3}{2}{1-cái}",

		"{D}{1~2}{的}{VI}={1}{4}{2}{3}",
	"{D}{1~2}{的}{1}<={1}{4}{2}{3}",
	"{D}{:的}{VI}={1}{3}{2}",
	"{D}{:的}{1}<={1}{3}{2}",


	//		"{这}{S}{D}{1~2}{的}{VI}={2}{3}{6}{4}{1->này}{5}",
	//	"{这}{S}{D}{1~2}{的}{1}<={2}{3}{6}{4}{1->này}{5}",
	//	"{这}{S}{D}{:的}{VI}={2}{3}{5}{4}{1->này}",
	//	"{这}{S}{D}{:的}{1}<={2}{3}{5}{4}{1->này}",

			"{这}{S}{D}{1~2}{的}{VI}={6}{2}{3}{4}{1->này}{5}",
	"{这}{S}{D}{1~2}{的}{1}<={6}{2}{3}{4}{1->này}{5}",
	"{这}{S}{D}{:的}{VI}={5}{2}{3}{4}{1->này}",
	"{这}{S}{D}{:的}{1}<={5}{2}{3}{4}{1->này}",

		"{那}{S}{D}{1~2}{的}{VI}={2}{3}{6}{4}{1->kia}{5}",
	"{那}{S}{D}{1~2}{的}{1}<={2}{3}{6}{4}{1->kia}{5}",
	"{那}{S}{D}{:的}{VI}={2}{3}{5}{4}{1->kia}",
	"{那}{S}{D}{:的}{1}<={2}{3}{5}{4}{1->kia}",

		"{S}{D}{1~2}{的}{VI}={1}{2}{5}{3}{4}",
	"{S}{D}{1~2}{的}{1}<={1}{2}{5}{3}{4}",
	"{S}{D}{:的}{VI}={1}{2}{4}{3}",
	"{S}{D}{:的}{1}<={1}{2}{4}{3}",

			"{PN}{这}{1~2}{的}{VI}={5}{3}{2->này của}{1:}{4}",
	"{PN}{这}{1~2}{的}{1}<={5}{3}{2->này của}{1:}",
	"{PN}{这}{:的}{VI}={4}{3}{2->này của}{1:}",
	"{PN}{这}{:的}{1}<={4}{3}{2->này của}{1:}",

	"{这}{1~2}{的}{VI}={4}{2}{1->này}{3}",
	"{这}{1~2}{的}{1}<={4}{2}{1->này}{3}",
	"{这}{:的}{VI}={3}{2}{1->này}",
	"{这}{:的}{1}<={3}{2}{1->này}",


			"{PN}{那}{1~2}{的}{VI}={5}{3}{2->kia của}{1:}{4}",
	"{PN}{那}{1~2}{的}{1}<={5}{3}{2->kia của}{1:}",
	"{PN}{那}{:的}{VI}={4}{3}{2->kia của}{1:}",
	"{PN}{那}{:的}{1}<={4}{3}{2->kia của}{1:}",

		"{那}{1~2}{的}{VI}={4}{2}{1->kia}{3}",
	"{那}{1~2}{的}{1}<={4}{2}{1->kia}{3}",
	"{那}{:的}{VI}={3}{2}{1->kia}",
	"{那}{:的}{1}<={3}{2}{1->kia}",



	"在 1~3 L1={1}{3-phía|bên}{2}",

	"{这}{SD}{VI}={2}{3}{1->này}",
	"{这}{SD}{1}<={2}{3}{1->này}",
	"{那}{SD}{VI}={2}{3}{1->kia}",
	"{那}{SD}{1}<={2}{3}{1->kia}",

	"{这}{S}{D}{VI}={2}{3}{4}{1->này}",
	"{这}{S}{D}{1}<={2}{3}{4}{1->này}",
	"{那}{S}{D}{VI}={2}{3}{4}{1->kia}",
	"{那}{S}{D}{1}<={2}{3}{4}{1->kia}",

	"{这}{D}{VI}={2}{3}{1->này}",
	"{这}{D}{1}<={2}{3}{1->này}",
	"{那}{D}{VI}={2}{3}{1->kia}",
	"{那}{D}{1}<={2}{3}{1->kia}",

	"有 D ~ :的 1 <={1}{2}{5}{3}{4}",
	"有 SD ~ :的 1 <={1}{2}{5}{3}{4}",
	"有 ~ :的 1 <={1}{4}{2}{3}",
	"有 ~ :的 1 SW={1}{4}{2}{3}{5}",
	"为什么 ~ :的 1 SW={1->tại sao}{4}{2:}{3:}{5:}",
	"什么 ~ :的 1 SW={1X}{4}{2}{3+gì}{5}",
	">{1}[trong|trước|ngoài|trên|dưới|cạnh]{的}{1}{SW}={3}{1}{4}",
	"{*L}[3,]{的}{1}{SW}={3}{1}{4}",
	"{SW}{1~3}{L}{的}{1~2}{SW}={1}{5}{3}{2}{6}",
	//SS
	"比 1~2 好的={1->tốt hơn}{2}",
	"比 1~2 好的 1 可以={4}{1->tốt hơn}{2}{3X}{5}",
	"比 1~2 好的 1 <={4}{1->tốt hơn}{2}",
	"比 1~2 还好 1 <={1->còn dễ}{4+hơn}{2}",
	"比 这: 还 1={1->còn}{4+hơn}{2}",
	"比 这 1 还 1={1->còn}{5+hơn}{3}{2->này}",
	"比 1~2 :了 不少={1X}{3+hơn}{2}{4->không ít}",
	"比 {PN} 1 了={3+hơn}{2}",
	"SD 1~5 一般的 1={1}{4}{2}",
	"D 1~5 一般的 1={1}{4}{2}",
	//FV

	"@_的:0{这:的}[4,10]{*L}[trong|trước|ngoài|trên|dưới|cạnh]{1}={2:}{1:}",
	"@_的:0{那:的}[kia|đó]{1}<={2+của}{1}",
	"@_的:0>{:的}[trong|trước|ngoài|trên|dưới|cạnh]{1}{SW}={2}{1}{3}",
	//"@_的:0{再:的}[4,5]{1}<={2:}{1:}",
	//"@_的:0{再:的}[4,5]{1}{VI}={2:}{1:}{3}",
	//MV
	"将 PN 1 <={3}{2}{1_X}",
	"{这}{PN}{L}={3}{2}{1->này}",
	"{那}{PN}{L}={3}{2}{1->kia}",
	"{这}{PN}={2}{1->này}",
	"{那}{PN}={2}{1->kia}",
	"那 1~3 L={3}{2}{1->kia}",
	//"那 1~3 SW={2}{1->kia}{3}",
	"这 1~3 L={3}{2}{1->này}",
	"{这} {1}[:n] {SW}={2}{1->này}{3}",
	"{这} {1}[:n] {1}[:n] {SW}={2}{1->này}{3}",
	"{这} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->này}",
	"{这} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->này}",
	"{这} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->này}",
	"{这} {1}[:i,a] {1}[:n]={3}{2}{1->này}",
	"{这} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->này}",
	"{这} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->này}",
	"{这} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->này}",
	"{这} {1}[:i,a] {的} {1}[:n]={4}{2}{1->này}",
		"{这个} {1}[:n] {SW}={2}{1->này}{3}",
		"{这个} {1}[:n] {1}[:n] {SW}={2}{1->này}{3}",
		"{这个} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->này}",
		"{这个} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->này}",
		"{这个} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {1}[:n]={3}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {1}[:n]={4}{2}{1->này}",
		"{这} {1}[:n] {SW}={2}{1->này}{3}",
	"{那} {1}[:n] {1}[:n] {SW}={2}{1->kia}{3}",
	"{那} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->kia}",
	"{那} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->kia}",
	"{那} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {1}[:n]={3}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {1}[:n]={4}{2}{1->kia}",
		"{那个} {1}[:n] {SW}={2}{1->kia}{3}",
		"{那个} {1}[:n] {1}[:n] {SW}={2}{1->kia}{3}",
		"{那个} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->kia}",
		"{那个} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->kia}",
		"{那个} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {1}[:n]={3}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {1}[:n]={4}{2}{1->kia}"
];
meanengine.db.cdefault=[
	"> {1} {~} {:的} {1}[:n,np,vp,v,m,ns]<={4}{1}{2}{3}",
	"@_的:0{这:的}[4,10]{*L}[trong|trước|ngoài|trên|dưới|cạnh]{1}={2:}{1:}",
	"@_的:0{那:的}[kia|đó]{1}<={2+của}{1}",
	"@_的:0>{:的}[trong|trước|ngoài|trên|dưới|cạnh]{1}{SW}={2}{1}{3}",
	//"@_的:0{再:的}[4,5]{1}<={2:}{1:}",
	//"@_的:0{再:的}[4,5]{1}{VI}={2:}{1:}{3}",
	//MV
	"将 PN 1 <={3}{2}{1_X}",
	"{这}{PN}{L}={3}{2}{1->này}",
	"{那}{PN}{L}={3}{2}{1->kia}",
	"{这}{PN}={2}{1->này}",
	"{那}{PN}={2}{1->kia}",
	"那 1~3 L={3}{2}{1->kia}",
	//"那 1~3 SW={2}{1->kia}{3}",
	"这 1~3 L={3}{2}{1->này}",
	"{这} {1}[:n] {SW}={2}{1->này}{3}",
	"{这} {1}[:n] {1}[:n] {SW}={2}{1->này}{3}",
	"{这} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->này}",
	"{这} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->này}",
	"{这} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->này}",
	"{这} {1}[:i,a] {1}[:n]={3}{2}{1->này}",
	"{这} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->này}",
	"{这} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->này}",
	"{这} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->này}",
	"{这} {1}[:i,a] {的} {1}[:n]={4}{2}{1->này}",
		"{这个} {1}[:n] {SW}={2}{1->này}{3}",
		"{这个} {1}[:n] {1}[:n] {SW}={2}{1->này}{3}",
		"{这个} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->này}",
		"{这个} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->này}",
		"{这个} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {1}[:n]={3}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->này}",
		"{这个} {1}[:i,a] {的} {1}[:n]={4}{2}{1->này}",
		"{这} {1}[:n] {SW}={2}{1->này}{3}",
	"{那} {1}[:n] {1}[:n] {SW}={2}{1->kia}{3}",
	"{那} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->kia}",
	"{那} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->kia}",
	"{那} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {1}[:n]={3}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->kia}",
	"{那} {1}[:i,a] {的} {1}[:n]={4}{2}{1->kia}",
		"{那个} {1}[:n] {SW}={2}{1->kia}{3}",
		"{那个} {1}[:n] {1}[:n] {SW}={2}{1->kia}{3}",
		"{那个} {1}[:i,a] {VI}[:n] {1}[:n]={4}{3}{2}{1->kia}",
		"{那个} {1}[:i,a] {1}[:n] {VI}[:n]={4}{3}{2}{1->kia}",
		"{那个} {1}[:i,a] {1}[:n] {1}[:n]={3}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {1}[:n]={3}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {VI}[:n] {1}[:n]={5}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {1}[:n] {VI}[:n]={5}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {1}[:n] {1}[:n]={5}{4}{2}{1->kia}",
		"{那个} {1}[:i,a] {的} {1}[:n]={4}{2}{1->kia}",
		"{PN} {1}{的} {1}[:v]={1}{2}{3->mà}{4}",
	"{PN} {1}[:v]{的} {1}[:n] {1}[:n]<={5}{4}{1}{2}",
	"{PN} {1}[:v]{的} {1}[:n]<={4}{1}{2}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n] {1}[:n]<={5}{4}{2}{1}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n]<={4}{2}{1}",
	"{PN} {1}[:v]{的} {1}[:n] {1}[:n] {SW}={5}{4}{1}{2}{6}",
	"{PN} {1}[:v]{的} {1}[:n] {SW}={4}{1}{2}{5}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n] {1}[:n] {SW}={5}{4}{2}{1}{6}",
	"{PN} {1}[:n,a,i,m]{的} {1}[:n] {SW}={4}{2}{1}{5}",
	"{PN} {的} {1}[^trong|ngoài|trên|dưới]={3+của}{1}",
	"{PN} {的} {1} {1}[^trong|ngoài|trên|dưới]={4}{3+của}{1}",
	//">{PN} {1}{的} {1}<={4}{2+của}{1}",
	//">{PN} {1}[:v]{的} {1} {SW}={4}{1}{2}{5}",
	//">{PN} {1}{的} {1} {SW}={4}{2+của}{1}{5}",

	"@_的:1>{PN} {:的}[:v] {1}[này]<={3-này}{1}{2+này}",
	"@_的:1>{PN} {:的}[:v] {1}[:v]<={1}{2}{3}",
	"@_的:1>{PN} {:的}[:v] {1}[:n]<={3}{1}{2}",
	"@_的:1>{PN} {:的}[3,] {1}[:c]<={1}{2}{3}",
	"@_的:1>{PN} {:的}[3,] {1}[:v]<={1}{3}{2}",
	"@_的:1>{PN} {:的}[3,] {1}<={3}{2+của}{1}",
	"@_的:1>{PN} {:的}[:v] {1}[này] {SW}={3-này}{1}{2+này}{4}",
	"@_的:1>{PN} {:的}[:v] {1}[:n] {SW}={3}{1}{2}{4}",
	"@_的:1>{PN} {:的}[3,] {1}[:n] {SW}={3}{2+của}{1}{4}",
	"@_的:1>{PN} {:的}[3,] {1}[:n]<={3}{2+của}{1}",
	"@_的:1>{PN} {:的}[3,] {1}[:n] {SW}={3}{2+của}{1}{4}",


	//"{:是} {1} {PN} {PN} {的} {1} <={1}{2}{6+của}{5_X}{3}{4}",

	//"{:是} {1} {PN} {的} {1} <={1}{2}{5+của}{4_X}{3}",
	//"{:是} {1} {t:F} {的} {1} <={1}{2}{5+của}{4_X}{3}",
	//"{PN} {在} {~} {1}[:v] {~}<={1}{4}{5}{2}{3}",
	///"{PN} {在} {t:F} {~}<={1}{4}{2}{3}",

		"{:这} {PN} {的} {1} <={4}{2}{3_X}{1->này}",
	"{这} {PN} {:的} {1} <={4}{2}{3_X}{1->này}",
	"{这} {:的} {1} <={3}{2}{1->này}",
	"{:这} {PN} {PN} {的} {1} <={5}{4_X}{3}{2}{1->này}",
	//"{:这} {1} {PN} {PN} {的} {1} <={2}{6}{5_X}{3}{4}{1->này}",

	"{:这} {1} {PN} {的} {1} <={1}{2}{5}{4_X}{3}",
	"{:这} {1} {t:F} {的} {1} <={1}{2}{5}{4_X}{3}",



	"{被:在} {0~1} {L} {的} {1} <={5}{1}{2}{3}{4_X}",
	"{被:} {~} {:在} {~} {L} {的} {1} <={7}{1}{2}{3}{4}{5}{6}",


		//"{这}{SD}{1~2}[:n]{的}{1}[:n]={2}{5}{3}{1->này}{4}",
		//"{这}{SD}{1~2}[:a]{的}{1}[:n]={2}{5}{3}{1->này}{4}",
		//"{这}{SD}{1~2}{的}{VI}={2}{5}{3}{1->này}{4}",
	//"{这}{SD}{1~2}{的}{1}<={2}{5}{3}{1->này}{4}",
	//"{这}{SD}{:的}{VI}={2}{4}{3}{1->này}",
	//"{这}{SD}{:的}{1}<={2}{4}{3}{1->này}",

		"{这}{SD}{1~2}{的}{VI}={5}{2}{3}{1->này}{4}",
	"{这}{SD}{1~2}{的}{1}<={5}{2}{3}{1->này}{4}",
	"{这}{SD}{:的}{VI}={4}{2}{3}{1->này}",
	"{这}{SD}{:的}{1}<={4}{2}{3}{1->này}",

		"{那}{SD}{1~2}{的}{VI}={2}{5}{3}{1->kia}{4}",
	"{那}{SD}{1~2}{的}{1}<={2}{5}{3}{1->kia}{4}",
	"{那}{SD}{:的}{VI}={2}{4}{3}{1->kia}",
	"{那}{SD}{:的}{1}<={2}{4}{3}{1->kia}",

	"{SD}{1~2}{的}{VI}={1}{4}{2}{3}",
	"{SD}{1~2}{的}{1}<={1}{4}{2}{3}",
	"{SD}{:的}{VI}={1}{3}{2}",
	"{SD}{:的}{1}<={1}{3}{2}",

	//	"@_的:2{SD}{1~2}{:的}{VI}={1}{4}{2}{3}",
	//	"@_的:2{SD}{1~2}{:的}{1}<={1}{4}{2}{3}",
	//	"@_的:1{SD}{:的}{VI}={1}{3}{2}",
	//	"@_的:1{SD}{:的}{1}<={1}{3}{2}",

		"{这}{D}{1~2}{的}{VI}={2}{5}{3}{1->này}{4}",
	"{这}{D}{1~2}{的}{1}<={2}{5}{3}{1->này}{4}",
	"{这}{D}{:的}{VI}={2}{4}{3}{1->này}",
	"{这}{D}{:的}{1}<={2}{4}{3}{1->này}",

		"{那}{D}{1~2}{的}{VI}={2}{5}{3}{1->kia}{4}",
	"{那}{D}{1~2}{的}{1}<={2}{5}{3}{1->kia}{4}",
	"{那}{D}{:的}{VI}={2}{4}{3}{1->kia}",
	"{那}{D}{:的}{1}<={2}{4}{3}{1->kia}",

		"{D-}[1]{1~2}{的}{VI}={4}{2}{3}{1-cái}",
	"{D-}[1]{1~2}{的}{1}<={4}{2}{3}{1-cái}",
	"{D-}[1]{:的}{VI}={3}{2}{1-cái}",
	"{D-}[1]{:的}{1}<={3}{2}{1-cái}",

		"{D}{1~2}{的}{VI}={1}{4}{2}{3}",
	"{D}{1~2}{的}{1}<={1}{4}{2}{3}",
	"{D}{:的}{VI}={1}{3}{2}",
	"{D}{:的}{1}<={1}{3}{2}",


	//		"{这}{S}{D}{1~2}{的}{VI}={2}{3}{6}{4}{1->này}{5}",
	//	"{这}{S}{D}{1~2}{的}{1}<={2}{3}{6}{4}{1->này}{5}",
	//	"{这}{S}{D}{:的}{VI}={2}{3}{5}{4}{1->này}",
	//	"{这}{S}{D}{:的}{1}<={2}{3}{5}{4}{1->này}",

			"{这}{S}{D}{1~2}{的}{VI}={6}{2}{3}{4}{1->này}{5}",
	"{这}{S}{D}{1~2}{的}{1}<={6}{2}{3}{4}{1->này}{5}",
	"{这}{S}{D}{:的}{VI}={5}{2}{3}{4}{1->này}",
	"{这}{S}{D}{:的}{1}<={5}{2}{3}{4}{1->này}",

		"{那}{S}{D}{1~2}{的}{VI}={2}{3}{6}{4}{1->kia}{5}",
	"{那}{S}{D}{1~2}{的}{1}<={2}{3}{6}{4}{1->kia}{5}",
	"{那}{S}{D}{:的}{VI}={2}{3}{5}{4}{1->kia}",
	"{那}{S}{D}{:的}{1}<={2}{3}{5}{4}{1->kia}",

		"{S}{D}{1~2}{的}{VI}={1}{2}{5}{3}{4}",
	"{S}{D}{1~2}{的}{1}<={1}{2}{5}{3}{4}",
	"{S}{D}{:的}{VI}={1}{2}{4}{3}",
	"{S}{D}{:的}{1}<={1}{2}{4}{3}",

			"{PN}{这}{1~2}{的}{VI}={5}{3}{2->này của}{1:}{4}",
	"{PN}{这}{1~2}{的}{1}<={5}{3}{2->này của}{1:}",
	"{PN}{这}{:的}{VI}={4}{3}{2->này của}{1:}",
	"{PN}{这}{:的}{1}<={4}{3}{2->này của}{1:}",

	"{这}{1~2}{的}{VI}={4}{2}{1->này}{3}",
	"{这}{1~2}{的}{1}<={4}{2}{1->này}{3}",
	"{这}{:的}{VI}={3}{2}{1->này}",
	"{这}{:的}{1}<={3}{2}{1->này}",


			"{PN}{那}{1~2}{的}{VI}={5}{3}{2->kia của}{1:}{4}",
	"{PN}{那}{1~2}{的}{1}<={5}{3}{2->kia của}{1:}",
	"{PN}{那}{:的}{VI}={4}{3}{2->kia của}{1:}",
	"{PN}{那}{:的}{1}<={4}{3}{2->kia của}{1:}",

		"{那}{1~2}{的}{VI}={4}{2}{1->kia}{3}",
	"{那}{1~2}{的}{1}<={4}{2}{1->kia}{3}",
	"{那}{:的}{VI}={3}{2}{1->kia}",
	"{那}{:的}{1}<={3}{2}{1->kia}",
	">{PN}{的}{1}<={3+của}{1:}{2_X}",
	">{1}[:c,a]{PN}{的}{1}<={1}{4+của}{2:}{3_X}",
	">{PN}{的}{1}[:n]{1}[:v,d,ad,p,u]={3+của}{1:}{4}",
	">{PN}{的}{1}{被:}={3+của}{1}{4:}{2_X}",
	"{PN}{的}{1}{*和}{PN}{的}{1}={3+của}{1}{4->và}{7+của}{5}",
];
meanengine.db.tokenfind={
	"deter":arrtoobj(["这","这个","那","那个","把","般","班","瓣","磅","帮","包","辈","杯","本","笔","柄","此","这些","那些","些"
		,"拨","部","餐","册","层","场","场","成","尺","重","出","处","串","幢","簇","撮","打"
		,"袋","代","担","档","道","滴","点","顶","栋","堵","度","端","段","对","堆","队","顿"
		,"吨","朵","发","番","方","分","份","封","峰","付","幅","副","服","杆","个","根","公"
		,"尺","公","分","公","斤","公","里","公","顷","公","升","股","挂","管","行","盒","户"
		,"壶","伙","记","级","剂","架","家","加","仑","件","间","绞","角","届","截","节","斤"
		,"茎","局","具","句","居","卷","圈","卡","客","棵","颗","克","孔","口","块","捆","类"
		,"里","粒","辆","两","列","立","方","英","尺","立","方","米","领","缕","轮","摞","毛"
		,"枚","门","米","面","秒","名","亩","幕","排","派","盘","泡","喷","盆","匹","批","片"
		,"篇","撇","瓶","平","方","公","里","期","起","爿","千","克","瓦","顷","曲","圈"
		,"群","工","扇","勺","身","升","手","首","束","双","丝","艘","所","台","摊","滩"
		,"趟","堂","套","天","条","挑","贴","挺","筒","桶","通","头","团","坨","丸","碗","位"
		,"尾","味","窝","席","线","箱","项","些","牙","眼","样","页","英","亩","员","元","则"
		,"盏","丈","章","张","阵","支","枝","只","种","轴","株","幢","桩","桌","宗","组","尊","座","声"]),
	"deter-":["这","这个","那","那个","此","这些","那些"],
	"locat":["里","后","中","内","间","前","上","下","左","右","外","边"
			,"之中","之内","之间","之前","之上","之下","之外"
			,"里面","内面","上面","下面"],
	"locat1":["上","下","之上","之下"],
	"locat2":["里","中","内","间","外","之中","之内","之间","之外"],
	"subw":["到","在","从","自","由","于"],
	"relv":["的","得","了"],
	"relv1":["的"],
	"relv2":["得"],
	"relv3":["了"],
	"cc":["而又","与","跟","和"],
	"stwd":arrtoobj([
		"应","还","才","在","可","为","就","已","要","是","也","到","居","被","到","从"
		]),
	"pronoun":arrtoobj(["人","他自己","我","你","您","他","她","它","大家","大人","它们","她们","他们","你们","我们","丈夫","亲家公","亲家母","伯伯"
		,"伯母","伯父","侄女","侄子","儿子","兄弟","公公","叔叔","表妹","表姐","表弟","阿姨"
		,"叔父","后妈","哥哥","堂兄","堂哥","堂妹","堂姐","堂弟","外公","外婆","外孙","外孙女","外甥"
		,"外甥女","太太","太姥姥","太姥爷","太爷","女儿","女婿","奶奶","妈妈","妹","妹夫","妹妹","妻子"
		,"姐","姐夫","姐妹","姐姐","姑夫","姑妈","姑姑","姑父","姨侄","姨侄女","姨夫","姨妈","姨父","姪女"
		,"姪子","婆婆","婶婶","媳妇","嫂嫂","孙女","孙子","岳母","岳父","弟","弟媳","弟弟","母亲","父亲"
		,"爷爷","爸爸","独生女","独生子","继母","继父","老公","老婆","舅侄","舅侄女","舅妈","舅舅","表哥"
		,"万岁","万岁爷","下官","不佞","不才","不肖","不谷","主教","予一人","人家","仁兄","仁公"
		,"仙姑","令兄","令千金","令堂","令尊","令爱","令郎","令阃","修士","儿臣","先帝","先生","先贤","公子"
		,"冰翁","前辈","医生","千岁","卑下","卑职","博士","卿","台端","同志","哀家","圣上","圣驾","在下","大人"
		,"大夫","天子","太后","夫人","夫君","女士","奴婢","奴家","奴才","妾","妾身","姑娘","娘娘","婢","婢女"
		,"孤","孤王","孺人","官人","寒舍","寡","寡人","尊上","尊亲","尊公","尊堂","尊夫人","尊驾"
		,"小人","小儿","小吏","小女","小女子","小姐","小生","居士","属下","师傅","师父","府上","愚","执士"
		,"拙夫","拙荆","教宗","敝人","显妣","显考","晚学","晚生","晚辈","朕","末官","末将","本人","本官","本宫"
		,"本将军","本帅","本府","本王","殿下","母后","民女","法师","爵士","父君","父帝","父王","父皇","牧师"
		,"犬子","皇帝","相公","祖妣","祖考","神父","窃","经理","老夫","老师","老拙","老朽","老汉","老粗","老衲"
		,"老身","臣","臣妾","节下","草民","贤乔梓","贤伉俪","贤侄","贤妻","贤家","贤弟","贤昆仲","贤昆玉","贤郎"
		,"贫僧","贫尼","贫道","贱内","贱妾","贱息","贵丈夫","贵公司","贵国","贵夫人","贵姓","贵子女","贵子弟"
		,"贵宝号","贵家长","贵庚","贵府","道长","郎君","鄙人","阁下","陛下","高堂","麾下"])
}
meanengine.matcher=function(find,node,passed){
	if(find.modifier){
		if(!meanengine.modifier(node,find.modifier)){
			return false;
		}
	}
	if(find.type=="extend"){
		if(find.isfirst){
			return !node.isspace(false);
		}
		if(find.islast){
			return !node.isspace(true);
		}
		return true;
	}
	if(find.type=="exact"){
		return node.gT()==find.word;
	}
	if(find.type in meanengine.db.tokenfind){
		return meanengine.db.tokenfind[find.type].indexOf(node.gT()) >= 0;
	}
	if(find.type=="lastlocat"){
		var t = node.gT();
		if(t.lastChar()=="的" && t.length > 1){
			return meanengine.db.tokenfind.locat.indexOf(t[t.length-2]) >= 0;
		}else
		return meanengine.db.tokenfind.locat.indexOf(t.lastChar()) >= 0;
	}
	if(find.type=="name"){
		return node.containName();
	}
	if(find.type=="proname"){
		if(node.containName() || meanengine.db.tokenfind.pronoun.indexOf(node.gT()) >= 0){
			return true;
		}
		return false;
	}
	if(find.type=="number"){
		return meanstrategy.containnumber(node);
	}
	if(find.type=="faction"){
		return meanengine.wordIsFaction(node,passed);
	}
	if(find.type=="havechar"){
		var a=node.gT();
		for(var i=0;i<a.length;i++){
			if(find.char.indexOf(a[i])>=0){
				return true;
			}
		}
		return false;
	}
	if(find.type=="haveword"){
		return node.gT().indexOf(find.word)>=0;
	}
	if(find.type=="lastword"){
		return node.gT().indexOf(find.word, node.gT().length - find.word.length) !== -1;
	}
	if(find.type=="stw"){
		//if(!node.isspace(true)){
		//	return true;
		//}
		var a=node.gT();
		for(var i=0;i<a.length;i++){
			if(meanengine.db.tokenfind.stwd.indexOf(a[i]) >= 0){
				return true;
			}
		}
		return false;
	}
	if(find.type=="firstlast"){
		return (node.gT().indexOf(find.word1) === 0) 
			&& (node.gT().indexOf(find.word2, node.gT().length - find.word2.length) !== -1);
	}
	if(find.type=="firstword"){
		return node.gT().indexOf(find.word) === 0;
	}
	if(find.type=="numdeter"){
		return meanstrategy.containnumber(node) && meanengine.db.tokenfind["deter"].indexOf(node.gT().lastChar()) >= 0;
	}
	if(find.type=="tviet"){
		var m=node.getAttribute("v");
		if(m){
			m=m.toLowerCase().split("/");
			var h = node.gH();
			if(h==""){
				return false;
			}
			var hc = 0;
			for(var c=0;c<m.length;c++){
				if(h == m[c]){
					hc++;
				}
			}
			return hc/m.length < 0.4;
		}
	}
	return false;
}
meanengine.modifier=function(node,mod){
	if(mod.type == "have"){
		//if(node.textContent.contain(mod.text)){
		//	return true;
		//}else {
		//	return false;
		//}
		return new RegExp(mod.text).test(node.textContent);
	}
	if(mod.type=="length"){
		var l = node.gT().length;
		if(l> mod.max || l<mod.min){
			return false;
		}
		return true;
	}
	if(mod.type=="pos"){
		var pl = mod.postype.split(",");
		var np = node.getAttribute("p");
		for(var i=0;i<pl.length;i++){
			if(pl[i] == np){
				return true;
			}
		}
		return false;
	}
}
meanengine.finder = function(tofind,step,dir,node,b){
	var ndin=[];
	if(step.type=="unlim"){
		step.max=999;
		step.min=0;
	}
	var grp = {};
	if(dir){
		for(var i=0;i<=step.max;i++){
			node=node.nE();
			if(node==null || !node.isspace(false) || this.isrbound(node,b))return false;
			if(i<step.min){
				if(step.modifier){
					if(!this.modifier(node,step.modifier)){
						return false;
					}
				}
				ndin.push(node);
				continue;
			}
			if(meanengine.matcher(tofind,node,grp)){
				return {
					ins: ndin,
					found: grp.grp||node
				};
			}
			ndin.push(node);
		}
	}else{
		for(var i=0;i<=step.max;i++){
			node=node.pE();
			if(node==null || !node.isspace(true) || this.islbound(node,b))return false;
			if(i<step.min){
				if(step.modifier){
					if(!this.modifier(node,step.modifier)){
						return false;
					}
				}
				ndin.unshift(node);
				continue;
			}
			if(meanengine.matcher(tofind,node,grp)){
				return {
					ins: ndin,
					found: grp.grp||node
				};
			}
			ndin.unshift(node);
		}
	}
	return false;
}
meanengine.findend = function(step,dir,node,bound){
	var ndin=[];
	if(step.type=="unlim"){
		step.max=999;
		step.min=0;
	}
	if(dir){
		for(var i=0;i<=step.max;i++){
			node=node.nE();
			if(node==null||!node.isspace(false))return i>=step.min ? ndin : false;
			if(step.modifier){
				if(!this.modifier(node,step.modifier)){
					return i>=step.min ? ndin : false;
				}
			}
			ndin.push(node);
			continue;
		}
	}else{
		for(var i=0;i<=step.max;i++){
			node=node.pE();
			if(node==null||!node.isspace(true))return i>=step.min ? ndin : false;
			if(step.modifier){
				if(!this.modifier(node,step.modifier)){
					return i>=step.min ? ndin : false;
				}
			}
			ndin.unshift(node);
		}
	}
	return false;
}
meanengine.findmax = function(step,dir,node){
	var ndin=[];
	if(step.type=="unlim"){
		step.max=999;
		step.min=0;
	}
	if(dir){
		for(var i=0;i<=step.max;i++){
			node=node.nE();
			if(node==null||!node.isspace(false)||i==step.min)return i>=step.min ? ndin : false;
			if(step.modifier){
				if(!this.modifier(node,step.modifier)){
					return i>=step.min ? ndin : false;
				}
			}
			ndin.push(node);
		}
	}else{
		for(var i=0;i<=step.max;i++){
			node=node.pE();
			if(node==null||!node.isspace(true)||i==step.min)return i>=step.min ? ndin : false;
			if(step.modifier){
				if(!this.modifier(node,step.modifier)){
					return i>=step.min ? ndin : false;
				}
			}
			ndin.unshift(node);
		}
	}
	return false;
}
meanengine.swapper = function(froms,tos){
	var ctn =froms[0].parentElement || froms[0][0].parentElement;
	var ida,idb;
	//for(var lo = 0;lo<froms.length;lo++)
	for(var i=0;i<froms.length;i++){
		idb=tos[i].id||tos[i][0].id;
		ida=froms[i].id||froms[i][0].id;
		if(ida != idb){
			//console.log("transform: "+ida + " - "+idb)
			if(froms[i].push){
				if(tos[i].push){
					for(var j=0;j<tos[i].length;j++){
						ctn.insertBefore(document.createTextNode(" "), froms[i][0]);
						ctn.insertBefore(tos[i][j], froms[i][0]);
						//meanengine.swapgt(tos[i][j], froms[i][0]);
						//meanengine.swapm(tos[i][j], froms[i][0]);
					}
				}else{
					ctn.insertBefore(document.createTextNode(" "), froms[i][0]);
					ctn.insertBefore(tos[i], froms[i][0]);
					//meanengine.swapgt(tos[i], froms[i][0]);
					//meanengine.swapm(tos[i], froms[i][0]);
				}
			}else{
				if(tos[i].push){
					for(var j=0;j<tos[i].length;j++){
						ctn.insertBefore(document.createTextNode(" "), froms[i]);
						ctn.insertBefore(tos[i][j], froms[i]);
						//meanengine.swapgt(tos[i][j], froms[i]);
						//meanengine.swapm(tos[i][j], froms[i]);
					}
				}else{
					ctn.insertBefore(document.createTextNode(" "), froms[i]);
					ctn.insertBefore(tos[i], froms[i]);
					//meanengine.swapgt(tos[i], froms[i]);
					//meanengine.swapm(tos[i], froms[i]);
				}
			}
			//meanengine.swapnode(froms[i],tos[i]);
			if(i<froms.length-1){
				var tmp=froms[i];
					froms[i]=froms[i+1];
					froms[i+1]=tmp;
					if(froms[i+1].push){
						if(froms[i+1][0].previousSibling&&froms[i+1][0].previousSibling.nodeType!=3){
							ctn.insertBefore(document.createTextNode(" "), froms[i+1][0]);
						}
					}else
					if(froms[i+1].previousSibling&&froms[i+1].previousSibling.nodeType!=3){
						ctn.insertBefore(document.createTextNode(" "), froms[i+1]);
					}
			}
		}
	}
	if(tos[0].push){
		tos[0][0].tomean(tos[0][0].textContent);
	}else
	tos[0].tomean(tos[0].innerHTML);
}
meanengine.swapper2 = function(froms,tos){
	var flag = false;
	for(var i=0;i<froms.length;i++){
		if(tos[i] != froms[i]){
			flag = true;
			break;
		}
	}
	if(!flag){
		return;
	}
	var ctn =froms[0].parentElement || froms[0][0].parentElement;
	if(!ctn)return;
	var lastn = froms[froms.length - 1].nextSibling;
	for(var i=0;i<froms.length;i++){
		if(froms[i].push){
			for(var j=0;j<froms[i].length;j++){
				if(froms[i][j].isspace(false)){
					froms[i][j].previousSibling.remove();
				}
				froms[i][j].remove();
			}
		}else{
			if(froms[i].isspace(false)){
				froms[i].previousSibling.remove();
			}
			froms[i].remove();
		}
	}
	try{
		var tn;
		for(var i=tos.length - 1;i >= 0;i--){
			if(tos[i].push){
				for(var j=tos[i].length - 1;j >= 0; j--){
					tn = document.createTextNode(" ");
					ctn.insertBefore(tos[i][j], lastn);
					ctn.insertBefore(tn, tos[i][j]);
					lastn = tn;
				}
			}else{
				tn = document.createTextNode(" ");
				ctn.insertBefore(tos[i], lastn);
				ctn.insertBefore(tn, tos[i]);
				lastn = tn;
			}
		}
	}catch(er){
		return;
	}
	if(tos[0].push){
		tos[0][0].tomean(tos[0][0].textContent);
	}else
	tos[0].tomean(tos[0].textContent);
}
meanengine.swapgt=function(node1,node2){
	var tmp=node1.gT();
	var tmp2=node1.getAttribute("v");
	node1.setAttribute("t", node2.gT());
	node1.cn=node2.gT();
	node1.setAttribute("v", node2.getAttribute("v"));
	node2.setAttribute("t", tmp);
	node2.cn=tmp;
	node2.setAttribute("v", tmp2);
}
meanengine.swapm=function(node1,node2){
	var tmp=node1.innerHTML;
	node1.setmean(node2.textContent);
	node2.setmean(tmp);
}
meanengine.cleantext=function(){
	var str=g(contentcontainer).innerHTML;
	str=str.replace(/đạo ?<\/i>:/g,"nói</i>:");
	str=str.replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g,"<br>");
	str=str.replace(/ ”/g,"”");
	str=str.replace(/ ([,\.!\?”]+)/g,"$1").replace(/ +<\/i>([ ,\.”\?\!])/g,"</i>$1");
	g(contentcontainer).textContent=str;
}
meanengine.usedefault=function() {
	if(window.defaultmeanenginerun){
		return;
	}
	window.defaultmeanenginerun=true;
	for(var i=0;i<this.db.default.length;i++){
		meanengine(this.db.default[i]);
	}
	for(var i=0;i<this.db.cdefault.length;i++){
	//	meanengine(this.db.cdefault[i],true);
	}
	if(window.setting.enabletestln){
		for(var i=0;i<this.db.sdefault.length;i++){
			meanengine(this.db.sdefault[i]);
		}
	}
	if(window.setting.enabletransformcore){
		for(var i=0;i<this.db.defaultwln.length;i++){
			meanengine(this.db.defaultwln[i]);
		}
	}else{
		for(var i=0;i<this.db.defaultwoln.length;i++){
			meanengine(this.db.defaultwoln[i]);
		}
	}
}
meanengine.wordIsFaction=function(node,passed){
	if(meanstrategy.recognized[node.id] && meanstrategy.recognized[node.id].type=="faction"){
		var rgobj = meanstrategy.recognized[node.id];
		passed.grp = rgobj.range;
		return true;
	}else if(node.textContent.toLowerCase() != node.textContent && node.textContent.split(" ").length>1){
		return meanstrategy.factions.indexOf(node.gT().lastChar())>=0;
	}
}
var analyzer={
	add:function(chi,num){
		this.data[chi]=num;
	},
	load:function(){
		var s=store.getItem("a"+abookhost+abookid);
		if(s==null){
			return;
		}
		s=s.split("&");
		this.readed=s[0].split(";");
		dat=s[1].split(";");
		dat.forEach(function(it){
			if(it!=""){
				var a=it.split("=");
				analyzer.data[a[0]]=parseInt(a[1]);
			}
		});
	},
	g:function(chi){
		return this.data[chi];
	},
	update:function(chi,num){
		if(this.readed.indexOf(abookchapter)<0){
			if(chi in this.data){
				this.data[chi]+=num;
			}else{
				this.data[chi]=num;
			}
		}else if (!(chi in this.data)) {
			this.data[chi]=num;
		}
	},
	readthis:function(){
		if(this.readed.indexOf(abookchapter)<0){
			this.readed.push(abookchapter);
		}
	},
	readed:[],
	data:{},
	addedname:{},
	collected:{},
	tocollect:[],
	collectphrase:function(node) {
		try{
			var chitext = node.gT();
			var vitext = node.textContent;
			var hvtext = node.gH();
			var multext = node.getAttribute("v");
			var nd = node;
			while(nd.isspace(true)){
				nd=nd.nE();
				chitext += nd.gT();
				vitext +=" "+nd.textContent;
				hvtext +=" "+nd.gH();
				multext +=" "+nd.getAttribute("v");
			}
			nd = node;
			while(nd.isspace(false)){
				nd=nd.pE();
				chitext = nd.gT() + chitext;
				vitext =nd.textContent+" "+vitext;
				hvtext =nd.gH()+" "+hvtext;
				multext =nd.getAttribute("v")+" "+multext;
			}
			if(chitext in this.collected){
				return;
			}else{
				this.collected[chitext] = true;
			}
			ajax("sajax=collectphrase&chi="+encodeURIComponent(chitext)
				+"&vi="+encodeURIComponent(vitext)
				+"&hv="+encodeURIComponent(hvtext)
				+"&mul="+encodeURIComponent(multext),function(){
					console.log("Collected "+chitext);
				});
		}catch(x){}
	},
	lookforcollect:function(){
		if(this.tocollect.length>0){
			this.allowcollect = true;
			for(var i=0;i<this.tocollect.length;i++){
				if(this.tocollect[i] in meanstrategy){
					var keyname="_old-"+this.tocollect[i];
					meanstrategy[keyname] = meanstrategy[this.tocollect[i]];
					meanstrategy[this.tocollect[i]] = function(node){
						analyzer.collectphrase(node);
						meanstrategy[keyname](node);
					}
				}else{
					meanstrategy[this.tocollect[i]] = function(node){
						analyzer.collectphrase(node);
					}
				}
			}
		}
	},
	tryupdatename:function(){
		if(setting.allowanalyzerupdate===true){
			for(var k in this.data){
				if(k.length<2)continue;
				if(k.indexOf("....")>=0)continue;
				var phrase=k.split("-").join("");
				if(meanstrategy.testignorechi(phrase))continue;
				if(dictionary.get(phrase)!=phrase)continue;
				if(phrase in this.addedname)continue;
				if(meanstrategy.surns2.indexOf(phrase.substring(0,2))>-1){
					if(this.data[k]>=4){
						this.addname(k,phrase);
						//tse.send("003",phrase,function(){
						//	analyzer.addname("$"+this.up+"="+meanstrategy.testsuffix(this.up,titleCase(this.down)));
						//});
						this.addedname[phrase]=true;
					}
				}else if (meanstrategy.iscommsurn(phrase.charAt(0))) {
					if(this.data[k]>=4){
						this.addname(k,phrase);
						///tse.send("003",phrase,function(){
						//	analyzer.addname("$"+this.up+"="+meanstrategy.testsuffix(this.up,titleCase(this.down)));
						//});
						this.addedname[phrase]=true;
					}
				}else if (meanstrategy.surns.indexOf(phrase.charAt(0))>-1) {
					if(this.data[k]>=8){
						this.addname(k,phrase);
						//tse.send("003",phrase,function(){
						//	analyzer.addname("$"+this.up+"="+meanstrategy.testsuffix(this.up,titleCase(this.down)));
						//});
						this.addedname[phrase]=true;
					}
				}
			}
			setTimeout(function(){
				sortname();
				saveNS();
			}, 2000);
		}
	},
	addname:function(phraseori,phrase){
		//ajax("sajax=transmulmean&wp=1&content="+encodeURIComponent("眠足够"),function(down){
		//	console.log(down)
		//});
		
		tse.send("004",phraseori,function(){
			var dat=this.down.split("|");
			console.log(dat);
			var han="";
			var isfail=false;
			dat.forEach(function(str){
				//han=vp|han=vp
				var s=str.split("=");
				if(s[1].toLowerCase().indexOf(s[0])<0){
					console.log(s);
					isfail=true;
				}else{
					han+=s[0]+" ";
				}
			});
			if(!isfail){
				namew.value="$"+phrase+"="+meanstrategy.testsuffix(phrase,titleCase(han.trim()))+"\n"+namew.value;
			}
		});
		
	},
	save:function(){
		var dat="";
		for(var item in this.data){
			dat+=item+"="+this.data[item]+";";
		}
		this.tryupdatename();
		try{
			store.setItem("a"+abookhost+abookid,this.readed.join(";")+"&"+dat);
		}catch(exce){

		}
	},
	reset:function(){
		this.data={};
		readed=[];
		this.save();
	}
}
function setArrayContain(arrar){
	arrar.c=function(se){
		return this.indexOf(se)>=0;
	}
}
setArrayContain(meanstrategy.database.phasemarginr);
Array.prototype.sumChinese=function(delimiter){
	if(this[0]==null)return "";
	if(delimiter==""){}else
	delimiter=delimiter||"-";
	var str=this[0].gT();
	for(var i=1;i<this.length;i++){
		str+=delimiter+this[i].gT();
	}
	return str;
}
function sumChinese(array,delimiter){
	if(array[0]==null)return "";
	if(delimiter==""){}else
	delimiter=delimiter||"-";
	var str=array[0].gT();
	for(var i=1;i<array.length;i++){
		str+=delimiter+array[i].gT();
	}
	return str;
}
Array.prototype.sumHan=function(){
	var str=this[0].gH();
	for(var i=1;i<this.length;i++){
		str+=" "+this[i].gH();
	}
	return str;
}
function rdmzr(a){
	var rate=0.5;
	var dc=a.split("\n");
	for(var i=0;i<dc.length;i++){
		var f=Math.random()>rate||(function(g,v){v.splice(g,10000/1e4)=="success"})(i,dc)
	}
	return dc.join("\n").replace(/\n+/g,"\n");
}
function lowerNLastWord(str,n){
	var lowered=0;
	for(var i=str.length-1;i>-1;i--){
		if(str.charAt(i)==" "){
			if(i+1==str.length)return str;
			str = str.substring(0, i+1)+str.charAt(i+1).toLowerCase()+str.substring(i+2);
			lowered++;
			if(lowered==n)return str;
		}
	}
	return str.toLowerCase();
}

var needbreak=false;
var analyzerloaded=false;
var prediction={
	sentences:[],
	anl:{},
	enable:false,
	getAllSen:function(){
		var startnd=g(contentcontainer).childNodes[0];
		var allsens=[];
		var sen=[];
		var minsen=[];
		var stack="";
		while(startnd!=null){
			if(startnd.tagName=="BR"){
				if(sen.length>0){
					allsens.push(sen);
					sen=[];
				}
			}else
			if(startnd.tagName=="I"){
				sen.push(startnd);
			}else 
			if(startnd.nodeType==document.TEXT_NODE){
				if(startnd.textContent.contain("“")){
					if(sen.length>0){
						allsens.push(sen);
						sen=[];
					}
					sen.push(startnd);
				}else if(startnd.textContent.contain("”")){
					sen.push(startnd);
					allsens.push(sen);
					sen=[];
				}else if(startnd.textContent.contain(",")){
					sen.push(startnd);
					allsens.push(sen);
					sen=[];
				}else if(startnd.textContent.contain(".")){
					sen.push(startnd);
					allsens.push(sen);
					sen=[];
				}else{
					sen.push(startnd);
				}
			}
			startnd=startnd.nextSibling;
		}
		if(sen.length>0){
			allsens.push(sen);
		}
		this.sentences=allsens;
	},
	predicted:[],
	tokenize:function(sen){
		var stack=[];
		var chi;
		for(var i=0;i<sen.length;i++){
			if(sen[i].tagName=="I"){
				chi=sen[i].gT();
				for(var x=0;x<chi.length;x++){}
			}
		}
	},
	sentotext:function(sen){
		var tx="";
		for(var i=0;i<sen.length;i++){
			tx+=sen[i].textContent;
		}
		return tx;
	},
	predict:function(sen,cal){
		if(!this.enable){
			return;
		}
		var x = new XMLHttpRequest();
		x.open("POST","//anl.sangtacvietcdn.xyz",true);
		x.onreadystatechange=function() {
			if(this.readyState==4 && this.status==200){
				var arr = JSON.parse(this.responseText);
				cal(arr);
				console.log(arr);
			}
		}
		x.send(sen);
	},
	predictgender:function(name){
		ajax("ajax=genderpredict&name="+encodeURIComponent(name),function(down){
			if(down=="male"){
				console.log("nam");
			}else{
				console.log("nữ");
			}
		});
	},
	predictdefault:function(n,cb){
		var v = n.gT();
		v = v.replace(/(.)[着了]/, "$1");
		this.predict(v,function(d){
			var p = d[0].tag;
			n.setAttribute("p", p);
			if(cb)cb(p);
		});
	},
	parse:function(node,cal,part){
		if(node.getAttribute("p")){
			if(this.cache[node.id]){
				if(cal){
					cal(node,node.getAttribute("p"),this.cache[node.id].taglist,this.cache[node.id].pos);
				}
				return;
			}
		}
		var sentext = node.gT();
		var nd = node;
		var basetext = part||sentext;
		var sen = [nd];
		while(nd.isspace(true)){
			nd=nd.nE();
			if(!nd){
				break;
			}
			sen.push(nd);
			sentext += nd.gT();
		}
		nd = node;
		while(nd.isspace(false)){
			nd=nd.pE();
			if(!nd){
				break;
			}
			sen.unshift(nd);
			sentext = nd.gT() + sentext;
		}
		this.predict(sentext,function(predicted){
			for(var i=0;i<predicted.length;i++){
				if(predicted[i].word == basetext){
					node.setAttribute("p", predicted[i].tag);
					prediction.cache[node.id]={
						taglist: predicted,
						pos: i
					};
					if(cal){
						cal(node,predicted[i].tag,predicted,i);
					}
				}else{
					for(var j=0;j<sen.length;j++){
						if(sen[j].gT() == predicted[i].word){
							sen[j].setAttribute("p", predicted[i].tag);
						}
					}
				}
			}
		});
	},
	cache:{},
	connect:function() {
		if(this.anl.readyState!==1){
			this.anl = new WebSocket("wss://anl.sangtacvietcdn.xyz");
			this.anl.onmessage=function(m) {

				console.log(JSON.parse(m.data));
			}
		}
	},
	data:{
		margin:"",
		count:""
	}
}
function lazyProcessing(){
	if(window.lazyProcessor){
		return;
	}
	window.lazyProcessor = {
		scrollDelay : 300,
		invokable : true,
		currentOffset : 0,
		windowHeight : document.body.scrollHeight || window.innerHeight || document.documentElement.clientHeight|| document.body.clientHeight,
		funList : []
	}
	var getOffset = function(){
		if(excute == excuteApp){
			return window.scrollY;
		}
		return document.body.scrollTop;
	}
	window.addEventListener("scroll", function(){
		if(window.lazyProcessor.invokable){
			window.lazyProcessor.invokable = false;
			setTimeout(function(){
				window.lazyProcessor.invokable = true;
			}, window.lazyProcessor.scrollDelay);
			window.lazyProcessor.currentOffset = getOffset();
			var funList = window.lazyProcessor.funList;
			for(var i=0;i<funList.length;i++){
				if(funList[i].type == 1 && window.lazyProcessor.currentOffset >= funList[i].checkpoint){
					funList[i].fun(funList[i].data);
					funList[i].type = 0;
				}
				if(funList[i].type == 2 
					&& window.lazyProcessor.currentOffset >= funList[i].checkpoint * window.lazyProcessor.windowHeight){
					funList[i].fun(funList[i].data);
					funList[i].type = 0;
				}
			}
		}
	});
	window.lazyProcessor.addCheckPoint = function(type,checkpoint,fun,data){
		this.funList.push({checkpoint:checkpoint,fun:fun,type:type,data:data});
	};
	window.lazyProcessor.clear = function(){
		this.funList=[];
	}
}
window.meanSelectorCheckpoint = 0;
function meanSelector(){
	if(window.setting && window.setting.disablemeanstrategy){
		return;
	}
	if(g(contentcontainer)==null||needbreak)return;
	console.time("mean selector");
	if(!analyzerloaded){
		analyzerloaded=true;
		var str=g("hiddenid").innerHTML.split(";");
		abookchapter=str[1];
		abookhost=str[2];
		abookid=str[0];
		analyzer.load();
	}
	meanstrategy.nodelist=q("#"+contentcontainer+" i");
	meanstrategy.maincontent=g(contentcontainer);
	var surns = arrtoobj(meanstrategy.surns.split(""));
	var surns2 = arrtoobj(meanstrategy.surns2.splitn(2));
	var fts = arrtoobj(meanstrategy.factions);
	var sks = arrtoobj(meanstrategy.skills);
	var ite = arrtoobj(meanstrategy.items);
	var ndlen = meanstrategy.nodelist.length;
	var e;
	var cn;
	var lc;
	var islongchapter = ndlen > 1800;
	var longchapsplit = 200;
	q('[v="hvd"]').forEach(function(e){
		e.innerHTML="";
		e.setAttribute("s", titleCase(convertohanviets(e.gT())));
	});
	if(islongchapter){
		lazyProcessing();
	}
	var brk = false;
	for(var i=window.meanSelectorCheckpoint;i<meanstrategy.nodelist.length;i++) {
		e=meanstrategy.nodelist[i];
		cn=e.gT();
		lc=cn.lastChar();
		//brk = false;
		if(e.id=="ran134"){
				console.log(e);
			}
		if(needbreak)break;
		if(islongchapter){
			if(i > window.meanSelectorCheckpoint + 300){
				needbreak = true;
				window.meanSelectorCheckpoint += 300;
				//console.log("add func");
				window.lazyProcessor.addCheckPoint(2, (i - 300) / ndlen, function(){
					needbreak = false;
				//	console.log('Invoke meanSelector at '+(window.meanSelectorCheckpoint));
					meanSelector();
					
				},{});
				setTimeout(function(){
					analyzer.readthis();
				},1200);
				analyzer.save();
				clearWhiteSpace();
				console.timeEnd("mean selector");
				return;
			}
		}
		if(cn in meanstrategy){
			meanstrategy[cn](e);
		}
		else if(meanengine.db.tokenfind.locat.indexOf(lc)>=0){
			meanstrategy['_L'](e);
		}
		else if(lc=='的'){
			
			meanstrategy['_的'](e);
		}else if(cn in fts){
			if(cn=="")continue;
			meanstrategy.faction(e,"",e.getAttribute("h"));
			if(lc in ite){
				meanstrategy.item(e,lc);
			}
		}else if (cn.length<4){
			if(cn.length>=2&&surns2.have(cn.substring(0,2))){
				meanstrategy.people2(e,2);
			}else if (cn[0] in surns) {
				meanstrategy.people2(e,1);
			//}else if (meanstrategy.surns.indexOf(cn[0])>=0){
			//	meanstrategy.people(e,1);
			}else if(e.containName()&&!e.isname()){
				if(meanstrategy.surns.indexOf(cn[0])>=0){
					meanstrategy.people2(e,1);
				}
			}
			if(lc in sks||cn in sks){
				meanstrategy.skill(e,"");
			}

			if(lc in ite){
				meanstrategy.item(e,lc);
			}
			if(cn.length==1){
				if(window.setting.allowwordconnector){
					meanstrategy.wordconnector(e);
				}
			}
			if(window.setting.englishfilter){
				//if(meanstrategy.database.english.contain(e.gT().charAt(0))){
				if(cn[0] in engtse.data){
					meanstrategy.testenglish(e);
				}
			}
			if(window.setting.allowphraseshiftor){
				meanstrategy.prepositionmover(e);
			}
		}
	}
	var opentester=new RegExp("("+meanstrategy.database.scope.open+")");
	var numbertester=new RegExp("[0-9]");
	var childlist = g(contentcontainer).childNodes;
	for(var i=0;i<childlist.length;i++){
		if(childlist[i].isexran){
			var m;
			if((m=opentester.exec(childlist[i].textContent))!==null){
				meanstrategy.scope(childlist[i],m[1]);
			}else if (childlist[i].textContent=="...... " || childlist[i].textContent=="... ") {
				meanstrategy.worddelay(childlist[i]);
			}else if (childlist[i+1]!=null
				&&childlist[i+1].tagName=="I"
				&&childlist[i+1].gT()[0]=='倍'
				&&numbertester.test(childlist[i].textContent)) {
					meanstrategy.numberpow(childlist[i+1]);
			}
		}
	}

	if(window.setting.hideblanknode){
		var ndlist = q("#"+contentcontainer+" i");
		for(var i=0;i<ndlist.length;i++){
			if(ndlist[i].innerHTML!=""){
				if(ndlist[i].gT() && ndlist[i].hasAttribute("hd")) ndlist[i].removeAttribute("hd");
			}
			else{
				ndlist[i].setAttribute("hd", "");
			}
		}
	}

	if(window.setting.pronouninsert||true){
		q("[isname=\"true\"]+[t^=\"自己的\"]").forEach(function(e){
			if(getDefaultMean(e).contain("của")){
				e.pE().tomean(getDefaultMean(e).replace(/chính mình|mình/, e.pE().textContent));
				e.textContent="";
			}
		});
		/*
		var pnmatcher = {type:"proname"};
		q("[t*=\"的\"]").forEach(function(e){
			if(e.pE())
			if(e.textContent.contain("của") && meanengine.matcher(pnmatcher,e.pE())){
				//e.textContent += e.pE().textContent;
				e.pE().tomean(e.textContent +" "+ getDefaultMean(e.pE()));
				e.textContent = "";
			}
		});*/
		q("[t*=\"的\"]").forEach(function(e){
			if(e.textContent.match(/của ./) && e.nE() && e.isspace(true)){
				if(e.hasAttribute("asynctask")){
					return;
				}
				var ofw = e.gT().split("的")[1];
				var nn = e.nE();
				var tw = ofw + nn.gT();
				var wlv = tw.length;
				if(wlv > 4 || (ofw.length < 2 && !e.cn.contain("是")) || tw.match(/[一了呢和吗啊过]/)) return;
				for(var i=0;i<tw.length;i++){
					if(meanengine.db.tokenfind.stwd.indexOf(tw[i]) >= 0){
						return;
					}
				}
				e.setAttribute("asynctask", "true");
				meanstrategy.database.getmean(tw,function(m){
					e.removeAttribute("asynctask");
					if(m=="false" || m=="")return;
					var dm=m.split("/")[0].trim();
					var mlv=dm.split(" ").length;
					if(mlv != wlv){
						return;
					}
					if(e.cn.contain("是")){
						var fw = e.textContent.split("của");
						e.tomean(fw[0] + dm + " của" + fw[1]);
					}else{
						var cfw = e.textContent.split("của")[1];
						e.tomean(dm + " của" + cfw);
					}
					e.cn += nn.gT();
					e.setAttribute("t", e.cn);
					e.setAttribute("v", e.textContent);
					nn.remove();
					if(nn){
						nn.setAttribute("t", "");
						nn.textContent="";
					}
					e.nextSibling.remove();
					//ajax("sajax=ofwcwfchk&ofw="+encodeURIComponent(e.cn+"="+e.textContent.trim()),function(){});
				});
			}
		});
		if(false)
		q("[isname=\"true\"]+[t^=\"的\"]").forEach(function(e){
			
			var sizemax = 5;
			var size=e.cn.length;
			var ndlist=[e];
			var namenode = e.pE();
			if(namenode.isspace(false))return;
			if(size<sizemax){
				if(e.nE() && e.isspace(true))
				if(e.nE().gT().length + size <= sizemax){
					ndlist.push(e.nE());
					size+=e.nE().gT().length;
					if(size<sizemax){
						if(e.nE().nE() && e.nE().isspace(true))
						if(e.nE().nE().gT().length + size <= sizemax){
							ndlist.push(e.nE().nE());
							size+=e.nE().nE().gT().length;
						}
					}
				}
			}
			if (size >= 3) {
				var phrase=ndlist.sumChinese("");
				size = phrase.length;
				meanstrategy.database.getmean("我"+phrase,function(mean1){
					if(mean1=="false"){
						ndlist.pop();
						phrase=ndlist.sumChinese("");
						size = phrase.length;
						if(size>2)
						meanstrategy.database.getmean("我"+phrase,function(mean1){
							if(mean1=="false"){
								ndlist.pop();
							}else{
								mean1=mean1.split("/");
								namenode.tomean(mean1[0].replace("ta", namenode.textContent));
								for(var i=0;i<ndlist.length;i++){
									ndlist[i].textContent="";
									ndlist[i].previousSibling.remove();
								}
							}
						});
					}else{
						mean1=mean1.split("/");
						namenode.tomean(mean1[0].replace("ta", namenode.textContent));
						for(var i=0;i<ndlist.length;i++){
							ndlist[i].textContent="";
							ndlist[i].previousSibling.remove();
						}
					}
				});
			}
			
		});
	}

	setTimeout(function(){
		analyzer.readthis();
	},1200);
	analyzer.save();
	meanstrategy.invoker=false;
	//clearDiLastSen();
	clearWhiteSpace();
	console.timeEnd("mean selector");
}
function moveitoupper2(){
	var wd=g(contentcontainer);
	var newstring="";
	var total=0;
	wd.querySelectorAll("p").forEach( function(el) {
		total++;
		newstring+=el.innerHTML+"<br><br>";
		el.remove();
	});
	if(total>17)
		wd.innerHTML=newstring;
	else {
		wd.innerHTML+=newstring;
	}
}
function moveitoupper(text){
	g(contentcontainer).innerHTML=text.replace(/<p[^>]*?>([\s\S]*?)<\/p>/gi,"$1<br><br>");
	//q("br+br+br+br").forEach( function(e) {
	//	if(e.previousElementSibling.previousSibling.textContent.length < 1){
	//		e.previousElementSibling.remove();
	//		e.remove();
	//	}
	//});
}
function converttonode(textnode,givenid){
	if(!window.dictionary){return;};
	var replacementNode = document.createElement('i');
	replacementNode.textContent = textnode.textContent.replace(/([^ \.,“\:\?\”\!\"\*\)\(\$\^\-\+\@\%\|\/\=\~】「」…《—》‘’\r\n\d]+)/g , function(match,p1)
	    {
		   return dictionary.get(p1);
	    }
	);
	replacementNode.id=givenid;
	replacementNode.setAttribute("h",textnode.textContent);
	replacementNode.setAttribute("t",textnode.textContent);
	replacementNode.cn=textnode.textContent;
	replacementNode.setAttribute("onclick","pr(this);");
	textnode.parentNode.insertBefore(replacementNode, textnode);
	textnode.parentNode.removeChild(textnode);
}

function saveNS(){
	if(typeof(thispage)=="undefined")return;
	var str = namew.value.split("\n");
	var curl = document.getElementById("hiddenid").innerHTML.split(";");
	var book=curl[0];
	var chapter = curl[1];
	var host = curl[2];
	var last = str.join("~//~");
	if(window.setting!=null&&window.setting.onlyonename){
		store.setItem("qtOnline0",last);
	}else{
		try{
			store.setItem(host+book,last);
		}catch(err){
			if(err.message.contain("exceeded")){
				ui.notif("Dung lượng lưu trữ của stv trên trình duyệt đã đầy, sẽ không thể lưu.")
			}
		}
	}
	
}
function clearNS(){
	if(!confirm("Bạn xác nhận muốn xóa?!!!!"))return;
	namew.value="";
	saveNS();
}
function hideNS(){
	document.getElementById("namewdf").style.visibility="hidden";
}
function showNS(){
	document.getElementById("namewdf").style.visibility="visible";
}
function getNSOnline(){
	g("toolbar").style.display="none";
	g("toolbar2").style.display="block";
	g("dlnametb").style.zIndex="99";
	if(typeof(thispage)=="undefined")return;
	var curl = document.getElementById("hiddenid").innerHTML.split(";");
	var book=curl[0];
	var chapter = curl[1];
	var host = curl[2];
	var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        g("dlnametbcontent").innerHTML = '<tr><th>Người đăng</th><th style="max-width:50%">Preview</th><th>Độ dài</th><th>Ngày</th><th></th></tr>';
                        g("dlnametbcontent").innerHTML += this.responseText;
                    }
                };
                xhttp.open("GET", "/namesys.php?host="+host+"&book="+book, true);
                xhttp.send();
}
function uploadNS(){
	g("upnamewd").style.zIndex="55";
}
function dlName(e){
	namew.value += e.parentElement.parentElement.children[1].children[0].innerHTML;
	if(ui){
		ui.alert("Đã tải name.");
	}
	saveNS();excute();
}
function sendNS(){
	if(typeof(thispage)=="undefined"){
		g("sendnsbt").disabled=false;
		return;}
	var curl = document.getElementById("hiddenid").innerHTML.split(";");
	var book=curl[0];
	var chapter = curl[1];
	var host = curl[2];
	var xhttp = new XMLHttpRequest();
	var data = "data="+encodeURI(namew.value)+"&username="+encodeURI(g("uploaduser").value)+"&bookid="+book+"&host="+host;
	xhttp.open("POST", "/index.php?upload=true", true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	 xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
		    if(this.responseText.indexOf("success")>0){
			    alert("Đăng thành công.");
			    g("sendnsbt").disabled=false;
			    g("upnamewd").style.zIndex="-1";
		    }
		    else{
			    alert("Đăng không thành công: Kích thước name tối thiểu 200 kí tự.");
			    g("sendnsbt").disabled=false;
			    g("upnamewd").style.zIndex="-1";
		    }
		}
	 };
	 
	 xhttp.send(data);
}
function isVietWord(a){
	if(typeof(a)=="undefined")return false;
	if(a.match(/[a-z]/))return true;
	else return false;
}
function LW(a){
	if(typeof(a)=="undefined")return a;
	return a.replace(/[\:“!\?\.”,"]+/,"");
}
function isex(left,center,right){
	left=LW(left);
	center = LW(center);
	right=LW(right);
	if(exclude.indexOf(left+" "+center)>-1){
		return false;
	}
	else if(exclude.indexOf(center+" "+right)>-1){
		return false;
	}
	else if(exclude.indexOf(center)>-1){
		return false;
	}
	return true;
}
var nb;
var nbfather;
var i1,is1,is2,is3,is4;
var i2;
var i3;
var i4;
var i5;
var windowWidth = 0; 
(function(){
	try{
		var w = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
		window.windowWidth = w;
	}catch(e){
		window.windowWidth = screen.width;
	}
})(window);

var selNode=[];
var basestr="";
var leftflag=false;
var rightflag=false;
var toeval="";
var toeval2="";
var defined=false;
function defineSys(){
	if(typeof(thispage)=="undefined")return;
	nb = document.getElementById("nsbox");
	nbfather = document.getElementById("boxfather");
	i1=g("vuc");
	i2=g("hv");
	i3=g("huc");
	i4=g("op");
	i5=g("zw");
}
function compareM(left,right){
	var last="";
	left=left.toLowerCase();
	right=right.toLowerCase();
	var end=false;
	var leftidx=0;
	var rightidx=0;
	var pleft=left.split(" ");
	var pright=right.split(" ");
	var curphrase ="";
	while(leftidx<pleft.length){
			if(typeof(pleft[leftidx])=="undefined"){
				break;
			}
			if(!isVietWord(pleft[leftidx])){
				last+=pleft[leftidx]+" ";
				leftidx++;
				rightidx++;
				continue;
			}
			if(pleft[leftidx]==pright[rightidx]){//nếu giống
	//			console.log(pleft[leftidx]);
				if(pleft[leftidx+1]==pright[rightidx+1] && isVietWord(pright[rightidx+1])&&isex(pleft[leftidx-1],pleft[leftidx],pleft[leftidx+1])&&isex(pleft[leftidx],pleft[leftidx+1],pleft[leftidx+2])){//nếu từ kế giống
					last+=cap(pleft[leftidx])+" ";curphrase+=cap(pleft[leftidx])+" ";
					leftidx++;
					rightidx++;
				}
				else if(leftidx>0){//nếu từ kế không giống và vị trí dương
					if(pleft[leftidx-1]==pright[rightidx-1]&&isVietWord(pleft[leftidx-1])&&isex(pleft[leftidx-1],pleft[leftidx],pleft[leftidx+1])&&curphrase!=""){//nếu từ trước giống
						last+=cap(pleft[leftidx])+" ";
						g("t3").value+=curphrase+cap(pleft[leftidx])+"\n";
						curphrase="";
						leftidx++;
						rightidx++;
					}else{//nếu từ trước không giống
						last+=pleft[leftidx]+" ";
						leftidx++;
						rightidx++;
					}
				}else{//nếu từ giống đứng một mình	8\
					last+=pleft[leftidx]+" ";
					leftidx++;
					rightidx++;
				}
			}
			else {
				
				if(pleft[leftidx+1]==pright[rightidx]){
					last+=pleft[leftidx]+" ";
					leftidx++;
				}else if(pleft[leftidx]==pright[rightidx+1]){
					rightidx++;
				}else{
					last+=pleft[leftidx]+" ";
					leftidx++;
					rightidx++;
				}
					
			}
			
	}
	return last;
}
function excuteX(){
	var last ="";
	var str1 = g("t1").value;
	var str2=g("t2").value;
	str1 = str1.split("\n");
	str2=str2.split("\n");
	for(var i=0;i<str1.length;i++){
		if(str1[i].length==0){
			last+="\n";
			continue;}
		var a=str1[i].split(",");
		var b=str2[i].split(",");
		for(var x=0;x<a.length;x++){
			last+=compareM(a[x],b[x]);
			if(x!=a.length-1)last+=",";
		}
			
		last+="\n";
	}
	g("t1").value=last.replace(/ ,/g,",")
	.replace(/([\n].)/g,function(v){return v.charAt(0)+v.charAt(1).toUpperCase();})
	.replace(/,([\:“!\?\.”,"]+)/g,"$1")
	.replace(/\. ./g,function(v){return ". "+v.charAt(2).toUpperCase();})
	.replace(/“./g,function(v){return v.charAt(0)+v.charAt(1).toUpperCase();});
}
function applyNodeList(){
	var ranid =0;
	var ndlist = q("#"+contentcontainer+" i");
	//g(contentcontainer).addEventListener("click", function() {
	//	if(event.target.tagName=="I"){
	//		pr(event.target);
	//	}
	//});
	for(var i=0;i<ndlist.length;i++){
		ndlist[i].id="ran"+i;
		ndlist[i].addEventListener("click", pr);
		ndlist[i].cn = ndlist[i].gT();
		ielement(ndlist[i]);
	}
	//q("#"+contentcontainer+" i").forEach(function(e){e.setAttribute("onclick","pr(this);");e.id="ran"+ranid;ranid++;});
	q("#"+contentcontainer+" br").forEach( function(e) {
		if(e.nextSibling && e.nextSibling.textContent===" "){
			e.nextSibling.remove();
		}
	});
	defined=true;
	//excute();
}
function directeditout(e){
	e.removeAttribute("onfocusout");
	e.contentEditable=false;
	e.removeAttribute("contenteditable");
	e.removeAttribute("onkeydown");
	e.isediting=false;
	if(stilledit==false)
	hideNb();
}
var stilledit=false;
function directeditkeydown(e,key){
	var textlen=e.childNodes[0].textContent.length;
	//key = document.all ? window.event.keyCode : 0;
	var curs=getCaretCharacterOffsetWithin(e);
	if(key==37||key==8){
		if(curs==0){
			stilledit=true;
			var le=e.pE();
			if(!(selNode.indexOf(le)>=0)){
				expandLeft();
			}
			le.isediting=true;
			le.contentEditable=true;
			le.setAttribute("onfocusout","directeditout(this);");
			le.setAttribute("onkeydown","directeditkeydown(this,event.keyCode);");
			le.focus();
			stilledit=false;
			if(key==8){
				le.innerHTML=le.innerHTML.substring(0, le.innerHTML.length-1);
			}
			setEndOfContenteditable(le);
		}
	}
	if(key==39){
		if(curs==textlen){
			stilledit=true;
			var le=e.nE();
			if(!(selNode.indexOf(le)>=0)){
				expandRight();
			}
			le.contentEditable=true;
			le.isediting=true;
			le.setAttribute("onfocusout","directeditout(this);");
			le.setAttribute("onkeydown","directeditkeydown(this,event.keyCode);");
			le.focus();
			stilledit=false;
		}
	}
}

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}
function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.setEnd(contentEditableElement.childNodes[0],contentEditableElement.childNodes[0].textContent.length);
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}
var instrans;
function pr(e){
	if(e.currentTarget){
		e=e.currentTarget;
	}
	if(typeof setting !="undefined"){
		if(setting.allowtaptoedit!=null&&!setting.allowtaptoedit){
			return;
		}
	}
	if(nb==null){
		nb=g("nsbox");
	}
	if(nb.parentNode==e){
		if(window.setting.directedit){
			if(e.isediting==true)return;
			e.contentEditable=true;
			e.isediting=true;
			e.setAttribute("onfocusout","directeditout(this);");
			e.setAttribute("onkeydown","directeditkeydown(this,event.keyCode);");
			clearSelection();
			e.focus();
			return;
		}
		else{
			return;
		}
	}

	unlock();
	selNode=[];
	e.style.color="red";
	if(i1==null){
		defineSys();
	}
	i1.value=titleCase(e.innerHTML);
	//i2.value=e.getAttribute("h").toLowerCase();
	//i3.value=titleCase(e.getAttribute("h"));
	i2.value=convertohanviets(e.gT()).toLowerCase();
	i3.value=titleCase(convertohanviets(e.gT()));
	i4.value="";
	i5.value=e.gT();
	if(phrasetree.getmean(i5.value)!=""){
		g("instrans").value=phrasetree.getmean(i5.value).split("=")[1];
	}
	else{
		try{
			if(!instrans){
				instrans = g("instrans");
			}
			if(e.mean()){
				g("instrans").value=e.mean();
			}else
			tse.send("001",i5.value,function(){
				g("instrans").value=this.down;
			});
		}catch(xxx){
			tse.send("001",i5.value,function(){
				g("instrans").value=this.down;
			});
		}
		
		
	}
	
	basestr=e.innerHTML;
	is1=i1.value;
	is2=i2.value;
	is3=i3.value;
	is4=i4.value;

	//nb.style.left="0";
	//e.appendChild(nb);
	if(true){
		var offset = getPos(e);
		if(offset.x+257>windowWidth){
			nb.style.left=(windowWidth-256)+"px";
		}else{
			nb.style.left=offset.x+"px";
		}
		nb.style.top=(e.offsetTop + offset.h) +"px";
	}
	showNb();
	//var x=getPos(nb).x;
	//if(x+257>windowWidth){
	//	nb.style.left=(windowWidth-256-x)+"px";
	//}

	selNode.push(e);
}
function expandRight(e){
	var nextNode = nextNSibling(e);
	if(!nextNode){
		return;
	}
	var t1,t2,t3,t4;
	if(nextNode.nodeType==3){
		if(nextNode.textContent.length>1){
			t1=titleCase(nextNode.textContent);
			t2=nextNode.textContent.toLowerCase();
			t3=titleCase(nextNode.textContent);
			t4=nextNode.textContent;
			i1.value+=t1;
			i2.value+=t2;
			i3.value+=t3;
			//i4.value+=t4;
			is1+=t1;
			is2+=t2;
			is3+=t3;
			//is4+=t4;
			//basestr+=t4;
		}
		expandRight(nextNode);
		return;
	}
	t1=titleCase(nextNode.innerHTML)
	//t2=nextNode.getAttribute("h").toLowerCase();
	//t3=titleCase(nextNode.getAttribute("h"));
	t2=convertohanviets(nextNode.gT()).toLowerCase();
	t3=titleCase(convertohanviets(nextNode.gT()));
	t4=nextNode.innerHTML;
	t5=nextNode.gT();
	i1.value+=" "+t1;
	i2.value+=" "+t2;
	i3.value+=" "+t3;
	i5.value+=t5;
	if(nextNode.mean()){
		g("instrans").value+=" "+nextNode.mean();
	}else
	tse.send("001",i5.value,function(){
		g("instrans").value=this.down;
	});
	is1+="|"+t1;
	is2+="|"+t2;
	is3+="|"+t3;
	is4+="|"+t4;
	basestr+="|"+nextNode.innerHTML;
}
function nextNSibling(e){
	if(selNode.length == 0) return null;
	var nod =selNode[selNode.length-1].nextSibling;
	if(!nod){
		return null;
	}
	if(nod.nodeType!=3)
	nod.style.color="red";
	selNode.push(nod);
	return selNode[selNode.length-1];
}
function expandLeft(e){
	var nextNode = previousNSibling(e);var t1,t2,t3,t4;
	if(nextNode.nodeType==3){
		if(nextNode.textContent.length>0){
			t1=titleCase(nextNode.textContent);
			t2=nextNode.textContent.toLowerCase();
			t3=titleCase(nextNode.textContent);
			t4=nextNode.textContent;
			i1.value=t1+i1.value;
			i2.value=t2+i2.value;
			i3.value=t3+i3.value;
			//i4.value=t4+i4.value;
			is1=t1+is1;is2=t2+is2;is3=t3+is3;//is4=t4+is4;
			//basestr+=t4;
		}
		leftflag=true;
		expandLeft(nextNode);
		return;
	}
	t1=titleCase(nextNode.innerHTML);
	//t2=nextNode.getAttribute("h").toLowerCase();
	//t3=titleCase(nextNode.getAttribute("h"));
	t2=convertohanviets(nextNode.gT()).toLowerCase();
	t3=titleCase(convertohanviets(nextNode.gT()));
	t4=nextNode.innerHTML;
	t5=nextNode.gT();
	i1.value=t1+i1.value;
	i2.value=t2+i2.value;
	i3.value=t3+i3.value;
	i5.value=t5+i5.value;
	if(nextNode.mean()){
		g("instrans").value=nextNode.mean()+" "+g("instrans").value;
	}else
	tse.send("001",i5.value,function(){
		g("instrans").value=this.down;
	});
	is1=t1+"|"+is1;is2=t2+"|"+is2;is3=t3+"|"+is3;is4=t4+"|"+is4;
	basestr=t4+"|"+basestr;
}
function previousNSibling(e){
	if(selNode.length == 0) return null;
	var nod =selNode[0].previousSibling;
	if(!nod) return null;
	if(nod.nodeType!=3)nod.style.color="red";
	selNode.unshift(nod);
	return selNode[0];
}
function rpqt(a){
	var i = 1;
	var index=a.indexOf("[");
	while(index>=0){
		a=a.replace("[","$"+i);
		i+=2;
		index=a.indexOf("[",i);
	}
	i=2;
	index=a.indexOf("]");
	while(index>=0){
		a=a.replace("]","$"+i);
		i+=2;
		index=a.indexOf("]",i);
	}
	return a;
}
function getPos(el) {
	if(el.getBoundingClientRect){
		var bd = el.getBoundingClientRect();
		return {x: bd.x,y: bd.y,h: bd.height};
	}
    for (var lx=0, ly=0;
	    el != null;
	    lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}
if(!Element.prototype.remove)
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
function applyNs(t){
	if(!selNode[0]){
		return;
	}
	selNode[0].innerHTML=g(t).value;
	unlock();
	for(var i = 1;i<selNode.length;i++){
		selNode[i].remove();
	}
	selNode=[];
}
function applyAndSaveNs(t){
	var right;
	switch(t){
		case "vuc":right=is1;break;
		case "hv":right=is2;break;
		case "huc":right=is3;break;
		case "op":right=i4.value;break
	}
	if(basestr!=""){
		namew.value += "\n@"+basestr+"="+right;
	}
	basestr="";
	unlock();
	selNode=[];
	saveNS();
	excute();
}
function hideNb(){
	if(nb==null
		//||nb.parentElement==nbfather
	)return;
	nb.style.display="none";
	unlock();
	
	
	//nbfather.appendChild(nb);
}
function showNb(){
	nb.style.display="block";
}
function replaceByNode(search,replace){
	var nodelist = q("#"+contentcontainer+" i");
	var len = nodelist.length;
	for(var i=0;i<len;i++){
		if(mc(nodelist[i].innerText,search[0])){
			var flag = true;
			for(var x=1;x<search.length;x++){
				if(x+i>=len)return;
				if(!mc(search[x],nodelist[i+x].innerText)){
					flag=false;
					break;
				}
			}
			if(flag){
				if(search.length==replace.length)
				for(var x=0;x<search.length;x++){
					toeval+="g('"+nodelist[x+i].id+"').innerHTML=\""+eE(replace[x])+"\";";
				}
				else{
					toeval+="g('"+nodelist[i].id+"').innerHTML=\""+eE(replace.join(" "))+"\";";
					var sumhv =nodelist[i].getAttribute("h");
					
					
					for(var x=1;x<search.length;x++){
						if(nodelist[i+x].previousSibling.textContent==' ')
						nodelist[i+x].previousSibling.remove();
						sumhv+=" "+nodelist[i+x].getAttribute("h");
						toeval2+="g('"+nodelist[i+x].id+"').innerHTML='';";
					}
					toeval+="g('"+nodelist[i].id+"').setAttribute(\"h\",\""+eE(sumhv)+"\");";
					
				}
			}
		}
	}
}
function replaceByRegex(search,replace){
	search=search.split(" ");
	var tofind=search[0].toUpperCase();
	var nodelist = g(contentcontainer).childNodes;
	if(nodelist.length<10){
		if(nodelist.length==0)return;
		nodelist=nodelist[1].childNodes;
		if(nodelist.length<10){
			nodelist=g(contentcontainer).childNodes[4].childNodes;
		}
	}
	var len = nodelist.length;
	console.log(len);
	var idot;
	for(var i=0;i<len;i++){
		idot= toU(nodelist[i].textContent).split(" ").indexOf(tofind);
		if(idot>=0){
			var flag = true;
			var arr = nodelist[i].textContent.split(" ");
			var nindex = 2;
			for(var x=1;x<search.length;x++){
				if(x+idot>=arr.length){
					if(i+nindex==nodelist.length){
						return;
					}
					arr = arr.concat(nodelist[i+nindex].textContent.split(" "));
					nindex+=2;
				}
				if(toU(arr[x+idot])!=toU(search[x])){
					flag=false;
					break;
				}
			}
			if(flag){
				var regx = new RegExp(search.join(" "),"i");
				nodelist[i].parentNode.childNodes[i].textContent=arr.join(" ").replace(regx,replace);
				for(var x=1;x<nindex-1;x++){
					nodelist[i+x].parentNode.childNodes[i+x].textContent="";
				}
			}
		}
	}
}
function replaceOnline(search,replace){
	dictionary.set(search,replace);
	var nodelist = q("#"+contentcontainer+" i");
	var len = nodelist.length;
	var firstchar=search.substring(0, 1);
	if(nodelist.length<10){
		if(nodelist.length==0)return;
		if(!nodelist[1]){
			return;
		}
		nodelist=nodelist[1].childNodes;
		if(nodelist.length<10){
			nodelist=g(contentcontainer).childNodes[4].childNodes;
		}
	}
	var len = nodelist.length;
	console.log(len);
	for(var i=0;i<len;i++){
		if(!nodelist[i] || !nodelist[i].gT){
			return;
		}
		idot = contain(nodelist[i].gT(),firstchar);
		if(idot>=0){
			var flag=true;
			var x=1;
			var strg=nodelist[i].gT();
			while(strg.length<search.length+idot){
				if(nodelist[i+x]){
					strg+=nodelist[i+x].gT();
					x++;
				}
				else {
					flag=false;
					break;
				}
			}
			if(!flag)continue;;
			if(contain(strg,search)<0){
				continue;;
			}
			try{
				dictionary.editcounter++;
				dictionary.edit(nodelist[i],x,strg,search);
			}catch(exc){

			}
		}
	}
}
function insertAfter(node,newnode){
	node.parentElement.insertBefore(newnode, node.nextSibling);
}
function insertBefore(node,newnode){
	node.parentElement.insertBefore(newnode, node);
}
function shiftnode(node1,node2){
	var nd3=node2.nE();
	g(contentcontainer).insertBefore(node2, node1);
	g(contentcontainer).insertBefore(node1, nd3);
}
function swapnode(node1,node2){
	var node3t=node2.innerHTML;
	var node3c=node2.gT();
	node2.textContent=node1.innerHTML;
	node2.setAttribute("t", node1.gT());
	node2.cn=node1.cn;
	node1.textContent=node3t;
	node1.setAttribute("t", node3c);
	node1.cn=node3c;
}
function insertWordAfter(node,chi,han,viet){
	var newnode=document.createElement("i");
	newnode.innerHTML=viet;
	newnode.setAttribute("t", chi);
	newnode.cn=chi;
	newnode.setAttribute("h", han);
	newnode.setAttribute("onclick", "pr(this);");
	newnode.setAttribute("id", node.id+"-2");
	insertAfter(node,newnode);
	var space=document.createTextNode(" ");
	insertAfter(node,space);
}
function insertWordWaitAsync(node,chi){
	var newnode=document.createElement("i");
	var han = convertohanviets(chi);
	newnode.textContent=han;
	newnode.setAttribute("t", chi);
	newnode.cn=chi;
	newnode.setAttribute("h", han);
	newnode.setAttribute("onclick", "pr(this);");
	newnode.setAttribute("id", node.id+"-2");
	insertAfter(node,newnode);
	var space=document.createTextNode(" ");
	insertAfter(node,space);
	return newnode;
}
function insertWordBefore(node,chi,han,viet){
	var newnode=document.createElement("i");
	newnode.innerHTML=viet;
	newnode.setAttribute("t", chi);
	newnode.cn=chi;
	newnode.setAttribute("h", han);
	newnode.setAttribute("onclick", "pr(this);");
	newnode.setAttribute("id", node.id+"-1");
	insertBefore(node,newnode);
	var space=document.createTextNode(" ");
	insertBefore(node,space);
}
function insertWordBeforeWaitAsync(node,chi){
	var newnode=document.createElement("i");
	var han = convertohanviets(chi)
	newnode.textContent= han;
	newnode.setAttribute("t", chi);
	newnode.cn=chi;
	newnode.setAttribute("h", han);
	newnode.setAttribute("onclick", "pr(this);");
	newnode.setAttribute("id", node.id+"-1");
	insertBefore(node,newnode);
	var space=document.createTextNode(" ");
	insertBefore(node,space);
	return newnode;
}
function mergeWord(nodelist){
	if(!nodelist || nodelist.length == 0){
		return;
	}
	var wordf=nodelist[0];
	if(!wordf){
		return;
	}
	//console.log(nodelist);
	for(var i=1;i<nodelist.length;i++){
		//wordf.innerHTML += " " + nodelist[i].innerHTML;
		wordf.setAttribute("t", wordf.gT()+nodelist[i].gT());
		wordf.cn=wordf.cn+nodelist[i].cn;
		wordf.setAttribute("h", wordf.gH()+" "+nodelist[i].gH());
		if(nodelist[i].isspace(false) && nodelist[i-1].isspace(true)){
			nodelist[i].previousSibling.remove();
		}
		nodelist[i].remove();
	}
}
function casingvp(node,mean){
	if(mean == "undefined")return;
	if(node.pE()&&node.pE().tagName=="BR"){
		return mean[0].toUpperCase() + mean.substring(1);
	}else {
		return mean;
	}
}

function replaceVietphrase(){
	var curword=q("#"+contentcontainer+" i")[0];
	var touchnext=false;
	var isHaveP = q("#"+contentcontainer+" p").length > 0;
	var pList = [];
	var pIndex = 0;
	if(isHaveP){
		pList = q("#"+contentcontainer+" p");
		var f = findNextI(pList, 0);
		if(f){
			curword = f.i;
			pIndex = f.idx;
		}
	}
	while(curword!=null){
		if(!(curword.getAttribute("isname")))
		if(curword.gT()[0] in phrasetree.data){
			var ndlen=curword.gT().length-1;
			var minleng=(window.priorvp)?0:ndlen;
			var chi=curword.gT();
			var tree=phrasetree.data[chi[0]];
			var maxleng=tree.maxleng;
			var nodelist=[curword];
			var nd;
			while (chi.length<maxleng) {
				nd=nodelist[nodelist.length-1].nE();
				if(nd==null)break;
				nodelist.push(nd);
				chi+=nd.gT();
			}
			for(var i = maxleng;i>minleng;i--){
				if(chi.substr(0, i) in tree){
					var left=chi.substr(0, i);
					try{
					if(left.length < curword.gT().length){
						//second case
						(function(){
							var l=left;
							var r=curword.gT().substr(l.length);
							var n=curword;
							var t=tree;
							tse.send("004",r,function(){
								var meancomb=this.down.split("|")[0].split("=");
								var mean=t[l].split("=");
								n.setAttribute("t", l);
								n.cn=l;
								var meanlist=mean[1].split("/");
								n.setAttribute("h", mean[0]);
								n.textContent=casingvp(n,meanlist[0]);
								insertWordAfter(n,r,meancomb[0],meancomb[1].split("/")[0].trim());
							});
						})();
					}
					else if (left==curword.gT()) {
						//first case
						//
						var mean=tree[left].split("=");
						if(mean.length < 2){
							continue;
						}
						var meanlist=mean[1].split("/");
						//curword.setAttribute("h", mean[0]);
						curword.textContent=casingvp(curword,meanlist[0]);
					}else{
						//third case
						maxleng=left.length;
						nodelist=[curword];
						var countedlen=curword.gT().length;
						var chi2=curword.gT();
						while (countedlen<maxleng) {
							nd=nodelist[nodelist.length-1].nE();
							if(nd==null)break;
							nodelist.push(nd);
							countedlen+=nd.gT().length;
							chi2+=nd.gT();
						}
						if(countedlen>maxleng){
							(function(){
								var l=left;
								var r=chi2.substr(maxleng);
								var n=nodelist;
								var t=tree;
								tse.send("004",r,function(){
									mergeWord(n);
									var meancomb=this.down.split("|")[0].split("=");
									var mean=t[l].split("=");
									n[0].setAttribute("t", l);
									n[0].cn=l;
									var meanlist=mean[1].split("/");
									n[0].setAttribute("h", mean[0]);
									n[0].textContent=casingvp(n[0],meanlist[0]);
									insertWordAfter(n[0],r,meancomb[0],meancomb[1].split("/")[0].trim());
								});
							})();
						}
						else {
							mergeWord(nodelist);
							var mean=tree[left].split("=");
							var meanlist=mean[1].split("/");
							curword.textContent=casingvp(curword,meanlist[0]);
						}
					}
					}catch(xx){}
					break;
				}
			}
		}
		curword=curword.nE();
		if(isHaveP){
			if(curword == null){
				pIndex++;
				if(pIndex>=pList.length)break;
				var f = findNextI(pList, pIndex);
				if(f){
					curword = f.i;
					pIndex = f.idx;
				}
			}
		}
	}
}
function getMeanFrom(meanpair){
	if(meanpair.length==1)return "";
	if(meanpair[1].indexOf("   ")>0){
		var mword = meanpair[1].split("   ");
		return (mword[0].split("/")[0]+" "+mword[1].split("/")[0]).trim();
	}else{
		return meanpair[1].split("/")[0].trim();
	}
}
function findNextI(pList, start){
	while(start < pList.length){
		var i = pList[start].querySelector("i");
		if(i != null){
			return {i: i, idx: start};
		}
		start++;
	}
	return null;
}
function replaceName(){
	console.time("rpname");
	var curword=q("#"+contentcontainer+" i")[0];
	var touchnext=false;
	var fnodel = 0;
	var isHaveP = q("#"+contentcontainer+" p").length > 0;
	var pList = [];
	var pIndex = 0;
	if(isHaveP){
		pList = q("#"+contentcontainer+" p");
		//curword = pList[0].querySelector("i");
		var f = findNextI(pList, 0);
		if(f){
			curword = f.i;
			pIndex = f.idx;
		}
	}
	while(curword!=null){
		if(true){
			var chi=curword.gT();
			var c2 = chi;
			var breakout=false;
			for(var indexer=0;indexer<c2.length&&indexer<12;indexer++){
				if(breakout)break;

				if(chi[indexer] in nametree.data){
					var tree=nametree.data[chi[indexer]];
					var maxleng=tree.maxleng;
					var nodelist=[curword];
					var nd;
					while (chi.length-indexer<maxleng) {
						nd=nodelist[nodelist.length-1].nE();
						if(nd==null||nd.tagName=="BR")break;
						if(!nd.isspace(false)&&nd.id.substr(0, 5)!="exran"
							&&nodelist[nodelist.length-1].id.substr(0, 5)!="exran"){
							break;
						}
						nodelist.push(nd);
						chi+=nd.gT();
					}
					var i= maxleng; //name = abc phr = ab cd maxleng = 3 cl = 4
					if(i+indexer > chi.length){
						i=chi.length - indexer;
					}
					for(;i>0;i--){
						if(indexer==0){
							if(chi.substr(0, i) in tree){
								var left=chi.substr(0, i);
								if(left.length < curword.gT().length){
									//second case
									indexer += i;
									(function(){
										var l=left;
										var r=curword.gT().substr(l.length);
										var n=curword;
										var t=tree;
										var ndw = insertWordWaitAsync(n,r);
										var mean=t[l].split("=");
										n.setAttribute("t", l);
										n.cn=l;
										n.setAttribute("h", mean[0]);
										n.textContent=mean.joinlast(1).trim();
										n.setAttribute("isname","true");
										n.setAttribute("v",mean[0]);
										window.endpoint2 = window.endpoint;
											window.endpoint = false;
										tse.send("007",r,function(){
											var meancomb=this.down.split("|")[0].split("=");
											var m1 = getMeanFrom(meancomb);
											//phrasetree.setmean(r,this.down.split("|")[0]);
											console.log(meancomb);
											//insertWordAfter(n,r,meancomb[0],meancomb[1].split("/")[0].trim());
											if(r == ndw.gT()){
												ndw.textContent=m1;
											}
											//meancomb[1].split("/")[0].trim();
										});
										window.endpoint = window.endpoint2;
									})();
								}
								else if (left==curword.gT()) {
									//first case
									//
									var mean=tree[left].split("=");
									//curword.setAttribute("h", mean[0]);
									curword.textContent=mean.joinlast(1).trim();
									curword.setAttribute("isname","true");
									curword.setAttribute("v",mean[0]);
								}else{
									//third case
									maxleng=left.length;
									nodelist=[curword];
									var countedlen=curword.gT().length;
									var chi2=curword.gT();
									while (countedlen<maxleng) {
										nd=nodelist[nodelist.length-1].nE();
										if(nd==null||nd=="BR")break;
										nodelist.push(nd);
										countedlen+=nd.gT().length;
										chi2+=nd.gT();
									}
									if(countedlen>maxleng){
										indexer += i;
										(function(){
											var l=left;
											var r=chi2.substr(maxleng);
											var n=nodelist;
											var t=tree;
											mergeWord(n);
											var mean=t[l].split("=");
											n[0].setAttribute("t", l);
											n[0].cn=l;
											n[0].setAttribute("h", mean[0]);
											n[0].textContent=mean.joinlast(1).trim();
											n[0].setAttribute("isname","true");
											n[0].setAttribute("v",mean[0]);
											var ndw = insertWordWaitAsync(n[0],r);
											window.endpoint2 = window.endpoint;
											window.endpoint = false;
											tse.send("007",r,function(){
												var meancomb=this.down.split("|")[0].split("=");
												//phrasetree.setmean(r,this.down.split("|")[0]);
												var m1 = getMeanFrom(meancomb);
												//console.log(n[0]);
												//insertWordAfter(n,r,meancomb[0],meancomb[1].split("/")[0].trim());
												if(r == ndw.gT()){
													ndw.textContent =m1;// meancomb[1].split("/")[0].trim();
												}
											});
											window.endpoint = window.endpoint2;
										})();
									}
									else {
										mergeWord(nodelist);
										var mean=tree[left].split("=");
										curword.textContent=mean.joinlast(1).trim();
										curword.setAttribute("isname","true");
										curword.setAttribute("v",mean[0]);
									}
								}
								breakout=true;
								break;
							}
						}
						else{//012345678 name=345 pos=3 sub0-3=012
							if(chi.substr(indexer, i) in tree){
								console.log("found ", chi, indexer, i, curword.gT());
								var center=chi.substr(indexer, i);
								if(i+indexer<= curword.gT().length){
									
									//left + center = chi
									if(i+indexer==curword.gT().length)
									(function(){
										var l=chi.substr(0, indexer);
										var c=center;
										var n=curword;
										var t=tree;
										var mean=t[c].split("=");
										n.setAttribute("t", c);
										n.cn=c;
										n.setAttribute("h", convertohanviets(c));
										n.textContent=mean.joinlast(1).trim();
										n.setAttribute("isname","true");
										n.setAttribute("v",mean[0]);
										//n.__defineSetter__("textContent", function(v){
										//	console.log("set text content",v);
										//	console.log(printStackTrace());
										//});
										var ndwl = insertWordBeforeWaitAsync(n,l);
										window.endpoint2 = window.endpoint;
											window.endpoint = false;
										tse.send("007",l,function(){
											var meancomb=this.down.split("|")[0].split("=");
											//phrasetree.setmean(l,this.down.split("|")[0]);//cache
											var m1 = getMeanFrom(meancomb);
											//insertWordBefore(n,l,meancomb[0],meancomb[1].split("/")[0].trim());
											if(l == ndwl.gT()){
												ndwl.textContent =m1;// meancomb[1].split("/")[0].trim();
											}
										});
										window.endpoint = window.endpoint2;
									})();
									//left + center + right = chi
									else {
										(function(){
											var l=chi.substr(0, indexer);
											var c=center;
											var r=curword.gT().substr(i+indexer);
											var n=curword;
											var t=tree;
											var mean=t[c].split("=");
											n.setAttribute("t", c);
											n.cn=c;
											n.setAttribute("h", convertohanviets(c));
											n.textContent=mean.joinlast(1).trim();
											n.setAttribute("isname","true");
											n.setAttribute("v",mean[0]);
											var ndwl = insertWordBeforeWaitAsync(n,l);
											var ndwr = insertWordWaitAsync(n,r);
											window.endpoint2 = window.endpoint;
											window.endpoint = false;
											tse.send("007",l+"|"+r,function(){
												var wordcomb=this.down.split("|");
												var leftmean=wordcomb[0].split("=");
												//phrasetree.setmean(l,wordcomb[0]);//cache
												var rightmean=wordcomb[1].split("=");
												//phrasetree.setmean(r,wordcomb[1]);//cache
												//insert name
												var m1 = getMeanFrom(leftmean);
												var m2 = getMeanFrom(rightmean);
												//insert word
												//console.log(n);
												//insertWordBefore(n,l,leftmean[0],leftmean[1].split("/")[0].trim());
												//insertWordAfter(n,r,rightmean[0],rightmean[1].split("/")[0].trim());
												ndwl.textContent = m1;//leftmean[1].split("/")[0].trim();
												if(r == ndwr.gT()){
													ndwr.textContent = m2;//rightmean[1].split("/")[0].trim();
												}
											});
											window.endpoint = window.endpoint2;
										})();
									}
								}
								else{
									
									//third case
									//
									maxleng=i+indexer;
									nodelist=[curword];
									var countedlen=curword.gT().length;
									var chi2=curword.gT();
									while (countedlen<maxleng) {
										nd=nodelist[nodelist.length-1].nE();
										if(nd==null||nd.tagName=="BR")break;
										nodelist.push(nd);
										countedlen+=nd.gT().length;
										chi2+=nd.gT();
									}
									console.log("getting full word ",chi2, maxleng, countedlen);
									if(countedlen>maxleng){
										//left + center + right = n chi
										(function(){
											var l=chi2.substr(0, indexer);
											var c=center;
											var r=chi2.substr(i+indexer);
											var n=nodelist;
											var t=tree;
											mergeWord(n);
											var mean=t[c].split("=");
											n[0].setAttribute("t", c);
											n[0].cn=c;
											n[0].setAttribute("h", convertohanviets(c));
											n[0].textContent=mean.joinlast(1).trim();
											n[0].setAttribute("isname","true");
											n[0].setAttribute("v",mean[0]);
											var ndwl = insertWordBeforeWaitAsync(n[0],l);
											var ndwr = insertWordWaitAsync(n[0],r);
											window.endpoint2 = window.endpoint;
											window.endpoint = false;
											tse.send("007",l+"|"+r,function(){
												var wordcomb=this.down.split("|");
												var leftmean=wordcomb[0].split("=");
												//phrasetree.setmean(l,wordcomb[0]);//cache
												var rightmean=wordcomb[1].split("=");
												//phrasetree.setmean(r,wordcomb[1]);//cache
												//insert name
												var m1 = getMeanFrom(leftmean);
												var m2 = getMeanFrom(rightmean);
												//insert word
												//insertWordBefore(n[0],l,leftmean[0],leftmean[1].split("/")[0].trim());
												//insertWordAfter(n[0],r,rightmean[0],rightmean[1].split("/")[0].trim());
												ndwl.textContent =m1;// leftmean[1].split("/")[0].trim();
												if(r == ndwr.gT()){
													ndwr.textContent =m2; //rightmean[1].split("/")[0].trim();
												}
											});
											window.endpoint = window.endpoint2;
										})();
									}
									else {
										(function(){
											var l=chi2.substr(0, indexer);
											var c=center;
											var n=nodelist;
											var t=tree;
											mergeWord(n);
											var mean=t[c].split("=");
											n[0].setAttribute("t", c);
											n[0].cn=c;
											n[0].setAttribute("h", mean[0]);
											n[0].textContent=mean.joinlast(1).trim();
											n[0].setAttribute("isname","true");
											n[0].setAttribute("v",mean[0]);
											var ndw = insertWordBeforeWaitAsync(n[0],l);
											window.endpoint2 = window.endpoint;
											window.endpoint = false;
											tse.send("007",l,function(){
												
												var meancomb=this.down.split("|")[0].split("=");
												//phrasetree.setmean(l,this.down.split("|")[0]);//cache
												var m1 = getMeanFrom(meancomb);
												//insertWordBefore(n[0],l,meancomb[0],meancomb[1].split("/")[0].trim());
												ndw.textContent = m1;//meancomb[1].split("/")[0].trim();

											});
											window.endpoint = window.endpoint2;
										})();
									}
								}
								breakout=true;
								break;
							}

						}
					}
				}
			}
		}
		curword=curword.nE();
		if(isHaveP){
			if(curword == null){
				pIndex++;
				if(pIndex>=pList.length)break;
				var f = findNextI(pList, pIndex);
				if(f){
					curword = f.i;
					pIndex = f.idx;
				}
			}
		}
	}
	console.timeEnd("rpname");
}
function contain(a,b){
	if(a){
		return a.indexOf(b);
	}
}
function doeval(){
	try{
		eval(toeval);
		eval(toeval2);
	}catch(e){
		console.log(e);
	}
	toeval="";
	toeval2="";
}
function unlock(){
	if(selNode)
	selNode.forEach(function(e){try{e.style.color="inherit";}catch(e){}});
	selNode = [];
}
function toU(a){
	if(a==null)return a;
	else return a.toUpperCase();
}
function doRp(n,t){
	n.textContent=t;
}
function eE(a){
	if(typeof(a)=="undefined")return "";
	else if(a==null)return "";
	else	return a.replace(/\"/g,"\\\"");
}
function mc(a,b){
	if(a!=null){
		if(b!=null){
			return a.toUpperCase()==b.toUpperCase();
		}
		return false;
	}
	return false;
}
var dictionary={
	editcounter:0,
	get:function(key){
		if(key.toUpperCase() in this.data)return this.data[key.toUpperCase()];
		else if(key.replace(" ","").toUpperCase() in this.data)return this.data[key.replace(" ","").toUpperCase()];
		else return key;
	},
	updateonline:function(words,node,numnode,found,search,bases){
		tse.send("002",words,function(){
			var resp = this.down.split("|");
			resp.forEach(function(e){
				dictionary.add(e);
			});
			saveNS();
			if(node.getAttribute("isname")=="true"){
				if(search.length < parseInt(node.getAttribute("namelen")))
					return;
			}
			for(var i=0;i<found.length;i++){
				found[i]=dictionary.get(found[i])||"";
			}
			node.innerHTML=found.join(" "+dictionary.get(search)+" ").trim();
			node.setAttribute("isname","true");
			node.setAttribute("namelen",search.length);
			node.setAttribute("t", bases);
			node.cn=bases;
			var lens=bases.length;
			for(var i=1;i<numnode;i++){
				if(bases.indexOf(node.nE().gT())<0)break;
				node.nextSibling.remove();
				node.setAttribute("h", node.getAttribute("h")+" "+node.nextSibling.getAttribute("h"));
				node.nextSibling.remove();
			}
			dictionary.editcounter--;
		});
	},
	add:function(phrase){
		if(phrase=="="||phrase=="")return;
		var bb=phrase.split("=");
		if(this.get(bb[0])==bb[1])return;
		namew.value="#"+phrase+"\n"+namew.value;
		this.set(bb[0],bb[1]);
	},
	edit:function(node,numnode,found,search){
		var bases=found;
		found=found.split(search);
		var find;
		var needupdate=[];
		if(node.getAttribute("isname")=="true"){
			if(search.length < parseInt(node.getAttribute("namelen")))
				return;
		}
		for(var i=0;i<found.length;i++){
			find=this.get(found[i])||"";
			if(find==found[i]){
				needupdate.push(find);
			}else{
				found[i]=find+" ";
			}
		}
		if(needupdate.length==0){
			node.innerHTML=found.join(" "+this.get(search)+" ").trim();
			node.setAttribute("isname","true");
			node.setAttribute("namelen",search.length);
			node.setAttribute("t",bases);
			node.cn=bases;
			var lens=bases.length;
			for(var i=1;i<numnode;i++){
				if(bases.indexOf(node.nE().gT())<0)break;
				node.nextSibling.remove()
				node.setAttribute("h", node.getAttribute("h")+" "+node.nextSibling.getAttribute("h"));
				node.nextSibling.remove();
			}
			dictionary.editcounter--;
		}else{
			this.updateonline(needupdate.join("|"),node,numnode,found,search,bases);
		}
	},
	set:function(key,value){
		this.data[key]=value;
	},
	load:function(file){
		return;
		//file=file.replace(/[\s\S]*?body>(.*?)<\/body[\s\S]*?/,"$1");
		file=file.split("-//-");
		var a;
		this.count=0;
		var refer=this;
		file.forEach(function(e){
			refer.count++;
			a=e.split("=");
			refer.set(a[0].replace(" ","").toUpperCase(),a[1]);
		});
		console.log("Loaded dictionary");
		this.finished=true;
		excute();
	},
	count:0,
	readTextFile:function(file){
		this.finished=true;
		excute();
		return;
	},
	data:{"ZUIBA":"miệng","YUANZIDAN":"bom nguyên tử","FENGCHEN":"phong trần","QU":"quần",
		"SHUXIONG":"buộc ngực","CHÉNGJIĀO":"thành giao","CHÉNGJĪNG":"thành dấu ấn tinh thần",
		"CHÉNGXÌNG":"thành tính","LUÀNCHÉNG":"loạn thành","NÒNGCHÉNG":"biến thành",
		"SHUANGFENG":"song phong","XIǍOCHÉNG":"tiểu thành","CHILUO":"xích lõa",
		"GAOCHAO":"cao trào","QINGREN":"tình nhân","JIAOCHUAN":"giao hoan",
		"LUÀNXÌNG":"mất lý trí","MÉNGMÉNG":"mờ mịt","XIǍODÒNG":"lỗ nhỏ",
		"XIǍOXIǍO":"nho nhỏ","XÌNGJIĀO":"tính giao","XIŌNGMÁO":"lông ngực",
		"ZHONGYĀNG":"trung ương","ZHŌNGYĀNG":"trung ương","YINGUN":"dâm côn",
		"BĀNGCÀO":"bổng thao","CÀONÒNG":"điều khiển","CHÉNGSÈ":"phẩm chất",
		"CHÉNGRÉN":"thanh niên","DÒNGMÉN":"cửa động","DÒNGXÙE":"hang động",
		"DONGQUÂN":"dong quân","HUĀJĪNG":"hoa tinh","HÚNJIĀO":"hỗn giao",
		"HÚNLUÀN":"hỗn loạn","HÚNMÉNG":"lừa gạt","HUÒLUÀN":"mê hoặc",
		"JIĀOHÚN":"pha lẫn","LUÀNSHÈ":"loạn xạ","MÉNGHÚN":"lừa dối",
		"MÉNGYÀO":"thuốc mê","RÒUBĀNG":"côn thịt","XIǍOHUĀ":"hoa nhỏ",
		"XIǍOMÁO":"Tiểu Mao","XIǍOMÉN":"cửa nhỏ","XIǍOTUǏ":"chân nhỏ",
		"YÀOXÌNG":"dược tính","BĪJIĀN":"cưỡng gian","FÉIRÒU":"thịt mỡ",
		"HUĀFÉI":"bón thúc","HUĀHUĀ":"Hoa Hoa","HUĀYÀO":"bao phấn",
		"HÚNHÚN":"lưu manh","JIANYIN":"gian dâm","JINGSHÉN":"tinh thần",
		"LUÀNMŌ":"sờ loạn","MÁOMÁO":"chíp bông","MÉNXÙE":"kỳ môn","MÍLUÀN":"mê loạn"
		,"MÍMÉNG":"mông lung","NǍIMÁO":"tóc máu","NǍINǍI":"nãi nãi","NVXÌNG":"nữ tính"
		,"RÌJIĀN":"Nhật gian","SHÈMÉN":"sút gôn","TUǏRÒU":"thịt đùi","BEIJING":"Bắc Kinh"
		,"DONGXUE":"huyệt động","HOUFANG":"houfang","HUĀSÈ":"sắc hoa","JIAOYIN":"rên rỉ"
		,"KUAIGAN":"khoái cảm","MÁOSÈ":"màu lông","MÍHUÒ":"mê hoặc","MÍYÀO":"mê dược"
		,"NǍODÀI":"não to","QINGCHU":"quan sát","RÒUSÈ":"màu da","SHÈRÌ":"xạ nhật"
		,"SHENYIN":"rên rỉ","YÀOKÙ":"kho thuốc","YÀONV":"Dược Nữ","YINCHAO":"âm trầm"
		,"YUNIRYU":"yuniryu","ZHENGFU":"chính phủ","CHÉNG":"thành","XIŌNG":"ngực"
		,"BŌSÈ":"màu nước","CHUANG":"giường","CHUÁNG":"giường","FǍNGFO":"phảng phất"
		,"HÒUHÒU":"thật dày","JIA-GE":"giá cả","JĪDÀNG":"kích động","KENENG":"khả năng"
		,"KĚNÉNG":"khả năng","LUONV":"lõa nữ","MÉIYǑU":"không có","MŌMŌ":"sờ sờ"
		,"NAINAI":"nãi nãi","NVSÈ":"nữ sắc","QIGUÀI":"kì quái","SÈMÍ":"háo sắc"
		,"TI-NEI":"thân thể","YOUHUO":"dụ hoặc","ZHÈGÈ":"cái này","ZHENYA":"trấn áp"
		,"ZHIDAO":"biết","ZHIDÀO":"biết","JIĀN":"gian","JIĀO":"giao","LUÀN":"loạn"
		,"MÉNG":"mông","NÒNG":"lộng","TIǍN":"liếm","XIǍO":"tiểu","XÌNG":"tính"
		,"LUO":"lõa","LUǑ":"lõa","BÙCUÒ":"không tệ","DULI":"độc lập","DUANG":"đoàng"
		,"GUANG":"quang","JIANG":"giương","JĪDÀN":"bắn","JĪSHÈ":"bắn nhanh","LUOLI":"loli"
		,"MǍNYÌ":"vừa ý","NIANG":"nương","NVXIN":"nữ nhân","PAUSE":"pause","QIANG":"thương"
		,"QIĀNG":"thương","SHĀSǏ":"giết chết","SHÍME":"cái gì","XIONG":"ngực"
		,"YUAN-":"nguyên","ZHENG":"chính","ZHONG":"chuông","ZIYOU":"tự do",
		"ZÌYÓU":"tự do","ZUILU":"ZUILU","CÀO":"tháo","FÉI":"phì","HUĀ":"hoa"
		,"HÚN":"hỗn","HUÒ":"hoặc","MÁO":"mao","MÉN":"môn","NǍI":"sữa","RÒU":"nhục"
		,"SHÈ":"sắc","TUǏ":"chân","XÙE":"huyệt","YÀN":"thán","YÀO":"dược","YÒU":"dụ"
		,"1ANG":"sóng","1UAN":"loạn","BĀNG":"bổng","BĪNG":"binh","CHŌU":"trừu "
		,"CHÚN":"chồn","CHŪN":"xuân","DANG":"đãng","DIAO":"điếu","DONG":"động"
		,"FENG":"phong","GĚGÉ":"ca ca","GIVE":"give","GUĀN":"quan","JIAN":"gian"
		,"JIAO":"giao","JING":"tinh","JǏNG":"cảnh","LUAN":"loạn","NIAO":"niệu"
		,"NONG":"lộng","QING":"tình","SHEN":"thân","SHĒN":"kiều ngâm","SHǑU":"thủ"
		,"SHǓN":"hấp ","SUDU":"tốc độ","TǏNG":"thật","XDJM":"anh chị em","XIAO":"tiểu"
		,"XING":"tính","YÉYÉ":"gia gia","YUAN":"nguyên","YUǍN":"viễn","ZANG":"tàng"
		,"ZHAN":"gian","ZHE-":"mang","ZHEN":"trấn","BĪ":"bức","BŌ":"ba","KÙ":"khố"
		,"MÍ":"mê","MŌ":"mò","NV":"nữ","RÌ":"nhật","1OU":"lộ","1UN":"loạn","CĀO":"thao"
		,"CHĀ":"xuất","DĀI":"hãi ","DĀO":"đao","DOU":"đấu","GOU":"chó","GǑU":"cẩu","HEI":"đen"
		,"HOU":"hậu","HUN":"hồn","HUO":"hoặc","ÌNG":"linh","ĪNG":"tinh","JĀO":"giao","JIĀ":"ra "
		,"JUN":"quân","LIÚ":"lưu","MǍI":"mua","MEI":"mỹ","MEN":"môn","MIÈ":"diệt","NBA":"NBA"
		,"NIĒ":"niết","QIÚ":"cầu","RMB":"nhân dân tệ","ROU":"nhục","SĀO":"náo","SHĀ":"giết",
		"SHE":"bắn","SHÌ":"thị","TOU":"đầu","TUO":"thoát","UÀN":"loạn","XǍO":"tiểu","XÌN":"tính",
		"XUÉ":"huyệt","XUÈ":"huyết","XÚE":"huyết","YAO":"dược","YIN":"âm","YÍN":"âm","ZHA":"tạc",
		"ZHÀ":"tạc","3Q":"thanks you","BH":"bưu hãn","BL":"BL","BZ":"mod","CJ":"trong trắng",
		"DD":"đệ đệ","DÚ":"độc","ĒN":"uyển ","FǍ":"pháp","FU":"phụ","FÙ":"phụ","FǓ":"phủ",
		"JL":"mặt khác","JQ":"gian tình","JS":"gian thương","JY":"tinh dịch","LÌ":"lỵ","LJ":"LJ",
		"QÌ":"khí","RǓ":"sữa","SE":"sắc","SǏ":"chết","SĪ":"tư","SM":"SM","SS":"SS","TJ":"TJ",
		"TM":"TM","TV":"TV","VS":"vs","WX":"bỉ ổi","XB":"tiểu bạch","XĪ":"xa","YA":"áp","YÀ":"dược"
		,"YD":"âm đạo","YÉ":"gia","YU":"dục","YÙ":"muốn","YY":"tự sướng","ZÁ":"phá","ZF":"chính phủ"
		,"ZG":"Trung Quốc","GAO":"hiểu","GUAN":"quan","ZUI":"miệng","QUN":"quần","JINGYAN":"rung động"
		,"FALUN":"luân","YE":"thực","MEISHAONV":"mỹ thiếu nữ","YINYU":"dâm dục","HUÓDÒNG":"hoạt động"
		,"ROUBANG":"côn thịt","TIANSHANGRENJIAN":"thiên thượng nhân gian","SHANGCHUANG":"lên giường"
		,"NOZUONODIE":"Không tìm đường chết sẽ không phải chết","XIONGQIANG":"lồng ngực",
		"TINGXIONG":"ưỡn ngực","XIONGQIAN":"trước ngực","ZHANCHANG":"chiến trường",
		"CHUSHENG":"súc sinh","JIANTING":"nghe lén","JIANYING":"cắt ảnh","JIAOXIAO":"nhỏ nhắn"
		,"MEIXIONG":"bộ ngực","TUDGUANG":"mở rộng","TUOGUANG":"cởi sạch","XIONGKOU":"ngực"
		,"ZHAOHONG":"hồng hào","CHANDOU":"run rẩy","CHANRAO":"quấn quanh","DIANFEN":"tinh bột"
		,"FEIHONG":"ửng đỏ","FENGLIU":"phong lưu","FENGMAN":"đầy đặn","FENGSAO":"lẳng lơ"
		,"GAOTING":"êm tai","HUANGSE":"màu vàng","JIAORUO":"mảnh mai","JIAOXIU":"thẹn thùng",
		"KUANGYE":"hóa thú","MEIMIAO":"mỹ diệu","ROURUAN":"mềm mại","SHENCHU":"vươn ra",
		"SUXIONG":"hai vú","XIAMIAN":"phía dưới","XIAOZUI":"miệng nhỏ","XINGGAN":"gợi cảm"
		,"XIONGBU":"bộ ngực","XIONGPU":"bộ ngực","YINDANG":"dâm đãng","GUOGUO":"xích lõa"
		,"HENYIN":"thanh ngâm","JIAOQU":"thân thể mềm mại","JINBAO":"kình bạo","JIQING":"kích tình"
		,"POSHEN":"phá thân","ROSHAN":"Roshan","SAOHUO":"lẳng lơ","SELANG":"sắc lang"
		,"SHUANG":"sảng khoái","TUOGUI":"chệch đường ray","XIUKUI":"xấu hổ","YUFENG":"núi đôi"
		,"YUWANG":"hormone","ZHUANG":"trang","ZONGYI":"cuồng ngạo","CHUAN":"thở",
		"HUANG":"vàng","JINJI":"cấm kỵ","JUHUA":"hoa cúc","LUOLU":"cởi trần","LUOTI":"lỏa thể"
		,"MEISE":"mị sắc ","MIREN":"mị lực","NEIKU":"quần lót","PINRU":"bần nhũ",
		"REHUO":"dụ người","ROUTI":"thể xác","RUYAO":"nhu yếu","SHALU":"giết chóc",
		"SHANG":"lên","TUIQU":"thối lui","WUHUI":"ô uế","XIANG":"hướng","YEWAI":"dã ngoại",
		"YOHUO":"dụ hoặc","ZUOSI":"tìm đường chết","AIFU":"vuốt ve","BIAN":"đầu",
		"CHAO":"trào","CHOU":"rung","CHUN":"môi","COMI":"comi","FANG":"nghệ",
		"HOLD":"khống chế","JIMO":"tịch mịch","KUSO":"kuso","LIÀN":"luyện",
		"PIAO":"phiêu","RUAN":"mềm","SEMI":"dâm đãng","SETU":"sắc cầu","SHÒU":"phúc",
		"TAMA":"con mẹ nó","TIAO":"tùy tiện","TING":"đỉnh","VISA":"visa","UU":"UUKANSHU"
		,"WANG":"vọng","WUYE":"vật nghiệp","XIAN":"vạch","XIÀN":"hiện","YANG":"dính"
		,"YING":"tiểu","BAO":"tạo","CAO":"nhổ","CHA":"cắm","CHU":"ra","DAO":"đường",
		"DAY":"day","FAN":"phạm","FEI":"phi","GAN":"cảm","IUO":"lỏa","JIN":"cấm",
		"JĪN":"cấm","KAN":"nhanh","LOU":"lộ","NAI":"sữa","NIE":"bóp","PAO":"pháo",
		"RAO":"quấn","REN":"nóng","SHA":"bắn","SHI":"ướt","SIM":"sim","SUO":"rũ",
		"TUN":"mông","WAN":"muộn","WEN":"hút","XIÀ":"phúc","XIE":"tà","XUN":"huấn",
		"YAN":"nghiên","YOU":"dụ","YUN":"thai","ZHI":"chi","ZHU":"trụ","ZUO":"làm",
		"AO":"ngạo","CA":"sát","DA":"đại","DU":"độc","LI":"lợi","PA":"pháo","PO":"phá",
		"RU":"nhũ","SI":"nghĩ","YÌ":"ý","ZÉ":"chọn","ZI":"tử","BIAO":"biểu"},
	finished:false
}
function loadCustomName(pack){
	var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "/customname/"+pack+".txt", true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
				namew.value=this.responseText+"\n"+namew.value;
				$('customnamebox').modal('hide');
				saveNS();
				excute();
            }
        }
    }
	rawFile.send(null);
}

function synctusach(){
	//return;
	if(!setting.autosync)return;
	if(store.getItem("lastsync")){
		if(parseInt(store.getItem("lastsync")) + 300000  >  new Date().getTime()){
			return;
		}
	}
	store.setItem("lastsync", new Date().getTime());
	syncdo("sync");
}

function syncvp(){
	return;
	if(store.getItem("lastsyncvp")){
		if(parseInt(store.getItem("lastsyncvp")) + 300000  >  new Date().getTime()){
			return;
		}
	}
	store.setItem("lastsyncvp", new Date().getTime());
	syncvpfile("sync");
}
function syncvpfile(type){
	return;
	if(type=="sync"){
		var xhttp = new XMLHttpRequest();
		var params="ajax=syncvp&step=1&edittime="+store.getItem("lastedittime");
		xhttp.open("POST","/index.php",true);
		xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				if(this.responseText.substring(0, 8)=="needsync"){
					var srtime=this.responseText.split("-")[1];
					store.setItem("lastedittime", srtime);
					var xhttp = new XMLHttpRequest();
					var params="ajax=syncvp&step=2";
					xhttp.open("POST","/index.php",true);
					xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
					xhttp.onreadystatechange = function () {
						if (this.readyState == 4 && this.status == 200) {
							store.setItem("vietphrase", this.responseText);
							phrasetree.load();
							replaceVietphrase();
						}
					};
				    xhttp.send(params);
				}else{
					if(this.responseText.substring(0, 6)=="needup"){
						syncvpfile("update");
					}
				}
			}
		};
	    xhttp.send(params);
	}else if (type=="update") {
		var xhttp = new XMLHttpRequest();
		var params="ajax=syncvp&step=3&data="+encodeURIComponent(store.getItem("vietphrase"));
		xhttp.open("POST","/index.php",true);
		xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				if(this.responseText!=""){
					store.setItem("lastedittime", this.responseText);
				}else{

				}
			}
		};
	    xhttp.send(params);
	}
}
function exportName(){
	var md=createModal("Xuất dữ liệu name");
	var dat="";
	var str=namew.value.split("\n");
	for(var i=0;i<str.length;i++){
		if(str[i].charAt(0)=="$"){
			dat+=str[i].substring(1)+"\n";
		}
	}
	md.body().innerHTML="<textarea style='width:100%;min-height:360px;'>"+dat+"</textarea>";
	md.show();
}
function importName(){
	var md=createModal("Nhập dữ liệu name");
	md.body().innerHTML="<textarea id='ipnametarea' style='width:100%;min-height:360px;'></textarea>";
	md.button("Nhập dữ liệu","doreadnamefile()","primary");
	md.show();
}
function doreadnamefile(){
	var tx=g("ipnametarea").value.split("\r\n");
	if(tx.length==1)tx=tx[0].split("\n");
	tx.forEach(function(e){
		namew.value+="\n$"+e;
	});
	saveNS();
	ui.alert("Đã import thành công. Nếu muốn lưu dc cho nhiều truyện, vui lòng bật chỉ sử dụng 1 bộ name trong cài đặt.");
}
ggtse={}
function googletranslate(chi,callb){
	if(dictionary.get('e'+chi)!=='e'+chi){
		if(callb!=null)
		callb(dictionary.get('e'+chi));
		else g("instrans").value=dictionary.get('e'+chi);
		return;
	}
	if(callb!=null){
		if(chi in ggtse){
			return;
		}
		else {
			ggtse[chi]=true;
		}
	}
	var http = new XMLHttpRequest();
	var url = "https://translate.googleapis.com/translate_a/single?client=gtx&text=&sl=zh-CN&tl=en&dt=t&q=" + encodeURI(chi);
	http.open('GET', url, true);
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var result=JSON.parse(this.responseText)[0][0][0];
			dictionary.set("e"+chi,result);
			if(callb!=null){
				callb(result);
			}else
			g("instrans").value=result;
		}
	}
	http.send();
}
function googletranslateNocache(chi,callb){
	var http = new XMLHttpRequest();
	var url = "https://translate.googleapis.com/translate_a/single?client=gtx&text=&sl=zh-CN&tl=en&dt=t&q=" + encodeURI(chi);
	http.open('GET', url, true);
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var result=JSON.parse(this.responseText)[0][0][0];
			if(callb!=null){
				callb(result);
			}
		}
	}
	http.send();
}
engtse={
	data:(function(){
		var obj={};
		["亚a","其","布b","普p","德d","特t","格g","克k","夫v","弗v","夫w","弗w","夫f","弗f","兹z","茨ts","斯s","丝s","什sh","奇dz","奇st","赫h","姆m","恩n","尔r","尔l","伊j","古q","库c","胡wh","阿a","巴ba","帕pa","达da","塔ta","加ga","卡ka","瓦va","娃va","瓦wa","娃wa","法fa","娃fa","扎za","察tsa","萨sa","莎sa","沙sha","莎sha","贾dza","查sta","哈ha","马ma","玛ma","娜na","纳na","拉la","拉ra","瓜qa","夸ca","华wha","埃ei","贝be","佩pei","德dei","特tei","泰tei","盖gei","凯kei","韦vei","韦wei","费fei","泽zei","策tsei","塞sei","谢shei","杰dzei","切stei","赫hei","黑hei","梅mei","内nei","莱lei","雷rei","蕾rei","耶jei","圭qei","奎cei","惠whei","厄e","伯be","珀pe","德de","特te","格ge","克ke","弗ve","沃we","弗fe","泽ze","策tse","瑟se","舍she","哲dze","彻ste","赫he","默me","纳ne","娜ne","勒le","勒re","耶je","果qe","阔ce","霍whe","伊i","比bi","皮pi","迪di","蒂ti","吉gi","基ki","维vi","威wi","菲fi","齐zi","齐tsi","西si","希shi","吉dzi","奇sti","希hi","米mi","尼ni","妮ni","利li","莉li","里ri","丽ri","伊ji","圭qi","奎ci","惠whi","奥o","博bo","波po","多do","托to","戈go","科ko","沃vo","沃wo","福fo","佐zo","措tso","索so","肖sho","乔dzo","乔sto","霍ho","莫mo","诺no","洛lo","罗ro","萝ro","约jo","果qo","阔co","霍who","乌u","布bu","普pu","杜du","图tu","古gu","库ku","武vu","伍wu","富fu","祖zu","楚tsu","苏su","舒shu","朱dzu","楚stu","胡hu","穆mu","努nu","卢lu","鲁ru","尤ju","库cu","久gju","丘kju","久zju","丘tsju","休sju","休shju","久dzju","丘stju","休hju","缪mju","纽nju","柳lju","留rju","艾ai","拜bai","派pai","代dai","泰tai","盖gai","凯kai","韦vai","怀wai","法fai","宰zai","蔡tsai","赛sai","夏shai","贾dzai","柴stai","海hai","迈mai","奈nai","莱lai","赖rai","耶jai","夸cai","怀whai","奥au","鲍bau","保pau","道dau","陶tau","高gau","考kau","沃vau","沃wau","福fau","藻zau","曹tsau","绍sau","绍shau","焦dzau","乔stau","豪hau","毛mau","瑙nau","劳lau","劳rau","尧jau","阔cau","安an","班ban","潘pan","丹dan","坦tan","甘gan","坎kan","万van","万wan","凡fan","赞zan","灿tsan","桑san","尚shan","詹dzan","钱stan","汉han","曼man","南nan","兰ran","兰lan","扬jan","关qan","宽can","环whan","昂ang","邦bang","庞pang","当dang","唐tang","冈gang","康kang","旺vang","旺wang","方fang","藏zang","仓tsang","桑sang","尚shang","章dzang","昌stang","杭hang","芒mang","南nang","朗lang","朗rang","扬jang","光qang","匡cang","黄whang","恩en","本ben","彭pen","登den","滕ten","根gen","肯ken","文ven","文wen","芬fen","曾zen","岑tsen","森sen","申shen","真dzen","琴sten","亨hen","门men","嫩nen","伦len","伦ren","延jen","昆cen","因in","宾bin","平pin","丁din","廷tin","金gin","金kin","温vin","温win","芬fin","津zin","欣tsin","辛sin","欣shin","金dzin","钦stin","欣hin","明min","宁nin","林lin","林rin","因jin","昆cin","英ing","宾bing","平ping","丁ding","廷ting","京ging","金king","温ving","温wing","芬fing","京zing","青tsing","辛sing","兴shing","京dzing","青sting","兴hing","明ming","宁ning","林ling","林ring","英jing","温un","本bun","蓬pun","敦dun","通tun","贡gun","昆kun","文vun","文wun","丰fun","尊zun","聪tsun","孙sun","顺shun","准dzun","春stun","洪hun","蒙mun","农nun","伦lun","伦run","云jun","翁ung","邦bung","蓬pung","东dung","通tung","贡gung","孔kung","翁vung","翁wung","丰fung","宗zung","聪tsung","松sung","雄shung","琼dzung","琼stung","洪hung","蒙mung","农nung","隆lung","龙rung","永jung","洪whung","亚ya","一y","丁tin","万van","东to","丝ce","丹de","丽lea","乌oo","乐le","乔jo","书sh","亨hen","亲kean","什sh","仑leon","以e","伊i","休hu","伦ren","伯b","佐zo","佛f","佩pe","侃kan","依y","侬non","保pa","修thew","儿le","克c","兰ran","兹ze","内na","凡fan","凯chae","切che","列le","利ri","力lli","加ga","努nu","劳lo","勒le","华war","南nan","博bo","卜b","卡ca","卢lu","卫vy","厄ha","历le","口ko","古gus","可xi","史S","各co","吉ji","哈hu","唐do","嘉ga","图to","地de","坎can","坦than","垃la","埃e","基ch","塔ta","塞se","士ce","夏tia","多do","夫ve","奇chi","奈net","奎ckly","奥o","妮ny","姆m","姬kie","威wi","娃va","娅ya","娜na","婷ne","宁nin","安an","宋son","宝pau","宾byn","密mi","寇co","富f","尔l","尤yo","尹e","尼ni","山xan","崔tri","巴ba","布b","希si","帕pa","帖ther","库ku","底tes","康con","廉liam","弗f","弥mi","强joh","当dam","彼pe","得ter","德d","思th","恩an","悉si","愣lon","戈go","戴da","扎za","托to","拉ra","拜by","拿na","提ti","摩mo","敏ne","文vin","斐fae","斑bam","斯s","方fon","日ge","旺wan","昂an","昆quen","明min","易i","晒shei","普p","曼man","朗ran","本ben","朱ju","来ri","杰ja","林line","果go","柏be","查cha","柯co","根gan","格g","桑san","梅me","梨ri","森than","欣ne","欧o","歇sha","步b","比bi","汀tine","汉ha","汤to","沃wa","沙shu","治rge","沽g","法fa","波po","泰tay","泽sa","洛lo","派pa","浦pe","海he","涅nie","温wen","烈re","爱e","特t","玛ma","珀per","珊zanna","珍je","珠rl","理ri","琦ki","琪ki","琳ri","瑞re","瑟e","璐lu","瓦va","甘gan","田ten","由yu","甸den","略li","登den","白beth","皮pie","盖ga","督rist","破po","碧bi","福fo","科co","稣sus","穆mu","笆ba","答da","筘co","米my","索so","约jo","纳na","维ve","绿lot","缇ty","罕ham","罗ro","美me","翁um","翠tri","翰han","考co","而le","耐nai","耶je","肖sha","肯ken","舒shu","良lian","艾e","芘pea","芙ve","芬phine","芭ba","苏so","英in","范fan","茅mo","茉mo","茜si","荷ho","莉ri","莎sha","莫mo","莱ri","莲le","菲phi","萝ro","萨sa","蒂ti","蒙mon","蓝len","蔗ge","蔡cha","蕾re","薇wi","西ce","覃tan","詹ja","诺no","谢che","谬mu","豪rol","贝be","费fe","贾ja","赛se","赫her","路lu","辛cin","达da","迪di","逊son","道dou","邓dun","邦ban","邱chior","邵shau","都do","里ri","金kim","门men","阑ran","阿a","隆ron","雅a","雨hu","雪sha","雯wen","雷ly","霍ho","霞sia","露ru","韦we","顿ton","飞phy","马ma","鲁ru","鲍bo","麦ma","默me","黛d","咔car","撒tha"].forEach(function(e){
				var k=e.charAt(0);
				var cont=e.substring(1);
				if(k in obj){
					obj[k]+="/"+cont;
				}else{
					obj[k]=cont;
				}
			});
		return obj;
	})(),
	selectlonger:function(eng){
		var ret="";
		var ls=eng.split("/");
		ls.forEach( function(e) {
			if(e.length>1){ret=e;return;}
		});
		return ret||ls[0];
	},
	trans:function(chi){
		var news="";
		var tmp;
		for(var i=0;i<chi.length;i++){
			if(i==chi.length-1&&chi[i]=="亚"){
				tmp="a";
			}
			else tmp=(this.data[chi[i]]||chi[i]).split("/")[0];
			if(i==0){
				if(tmp.length==1){
					tmp=this.selectlonger(this.data[chi[i]]);
				}
			}
			news+=tmp;
		}
		return news;
	},
	alliseng:function(chi){
		for(var i=0;i<chi.length;i++){
			if(!(chi[i] in this.data)){
				return false;
			}
		}
		return true;
	}
}
phrasetree={
	data:{
	},
	getmean:function(word){
		var firstchar=this.data[word.charAt(0)];
		if(firstchar==null)return "";
		if(word in firstchar)
			return firstchar[word];
		else {
			return "";
		}
	},
	setmean:function(word,mean){
		if(mean.indexOf("=")<0)return;
		this.data[word[0]]=this.data[word[0]]||{maxleng:0};
		this.data[word[0]][word]=mean;
		if(this.data[word[0]].maxleng < word.length){
			this.data[word[0]].maxleng = word.length;
		}
	},
	save:function(){
		if(store.getItem("useofflinevietphrase")=="true"){
			if(!window.indexedDB){
				return alert("Trình duyệt của bạn không hỗ trợ file vietphrase riêng.");
			}
			if(ngdb==null){
				ngdb=new IdbKvStore('vietphrase');
				//ngdb.set("vietphrasedata",phrasetree.data);
			}
			ngdb.set("vietphrasedata",phrasetree.data); 
		}else
		store.setItem("vietphrase", JSON.stringify(this.data));
	},
	load:function(){
		console.time("loadvp");
		if(true||store.getItem("isloadsingword")=="true"){
			if(store.getItem("useofflinevietphrase")=="true" && false){
				window.priorvp=true;
				window.attachedvp=false;
				if(store.getItem("trans-win")=="true"){}else{
					window.open("http://sangtacviet.com/transwin.htm");
				}
				setTimeout(function(){
					if(window.attachedvp==false){
						store.setItem("trans-win", "false");
					}
				},30000);
				//loadVietphraseOffline();
			}else{
				try{
					this.data=JSON.parse(store.getItem("vietphrase"))||{};
				}catch(ed){

				}
			}
			
		}else
		this.loadsingword();
		console.timeEnd("loadvp");
		phrasetree.setmean("真 · ","chân · =Chân · ");
		phrasetree.setmean("哆啦 A 梦","Doraemon=Doraemon");
		phrasetree.setmean(" T 恤"," T Shirt= T Shirt");
		phrasetree.setmean(" U 盘"," USB= USB");
		phrasetree.setmean(" B 站"," Bilibili= Bilibili");
		phrasetree.setmean("的","=");
	},
	loadsingword:function(){
		return;
		var http = new XMLHttpRequest();
		var url = "/singword.txt";
		http.open('GET', url, true);
		http.overrideMimeType('text/plain; charset=utf-8');
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				this.responseText.split("\n").forEach( function(e) {
					phrasetree.setmean(e[0], e.substring(1));
				});
				phrasetree.save();
				phrasetree.data=JSON.parse(store.getItem("vietphrase"))||{};
				store.setItem("isloadsingword","true");
			}
		}
		http.send();
	}
}
function ielement(e){(function(w,e){if(e.hasAttribute('hd')){if(!w.m){w.m=st.create();w.m.use();};w.m.set("#"+e.id,"color:transparent;font-size:1px;white-space:nowrap;display:inline-block;width:1px;overflow:hidden;");e.removeAttribute('hd');}})(window,e)};
nametree={
	data:{
	},
	getmean:function(word){
		var firstchar=this.data[word.charAt(0)];
		if(firstchar==null)return "";
		if(word in firstchar)
			return firstchar[word];
		else {
			return "";
		}
	},
	setmean:function(word,mean){
		this.data[word[0]]=this.data[word[0]]||{maxleng:0};
		this.data[word[0]][word]=mean;
		if(this.data[word[0]].maxleng < word.length){
			this.data[word[0]].maxleng = word.length;
		}
	},
	save:function(){
		var curl = document.getElementById("hiddenid").innerHTML.split(";");
		var book=curl[0];
		var chapter = curl[1];
		var host = curl[2];
		store.setItem(host+book+"v3", JSON.stringify(this.data));
	},
	load:function(){
		
		var curl = document.getElementById("hiddenid").innerHTML.split(";");
		var book=curl[0];
		var chapter = curl[1];
		var host = curl[2];
		this.data=JSON.parse(store.getItem(host+book+"v3"))||{};
		
	}
}
function loadnodedata(txt){
	var node=q("#"+contentcontainer+" i")[0];
	while(node!=null){
		node.setAttribute("v",node.innerHTML);
		node.innerHTML=node.innerHTML.split("/")[0];
		node=node.nE();
	}
}
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; 
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
(function(e) {
    if (typeof exports === "object" && typeof module !== "undefined") { module.exports = e() } else if (typeof define === "function" && define.amd) { define([], e) } else { var t; if (typeof window !== "undefined") { t = window } else if (typeof global !== "undefined") { t = global } else if (typeof self !== "undefined") { t = self } else { t = this } t.IdbKvStore = e() }
})(function() { var e, t, r; return function() {
        function l(o, s, u) {
            function a(r, e) { if (!s[r]) { if (!o[r]) { var t = "function" == typeof require && require; if (!e && t) return t(r, !0); if (f) return f(r, !0); var n = new Error("Cannot find module '" + r + "'"); throw n.code = "MODULE_NOT_FOUND", n } var i = s[r] = { exports: {} };
                    o[r][0].call(i.exports, function(e) { var t = o[r][1][e]; return a(t || e) }, i, i.exports, l, o, s, u) } return s[r].exports } for (var f = "function" == typeof require && require, e = 0; e < u.length; e++) a(u[e]); return a } return l }()({ 1: [function(e, t, r) { var a = Object.create || E; var u = Object.keys || j; var o = Function.prototype.bind || k;

            function n() { if (!this._events || !Object.prototype.hasOwnProperty.call(this, "_events")) { this._events = a(null);
                    this._eventsCount = 0 } this._maxListeners = this._maxListeners || undefined } t.exports = n;
            n.EventEmitter = n;
            n.prototype._events = undefined;
            n.prototype._maxListeners = undefined; var i = 10; var s; try { var f = {}; if (Object.defineProperty) Object.defineProperty(f, "x", { value: 0 });
                s = f.x === 0 } catch (e) { s = false } if (s) { Object.defineProperty(n, "defaultMaxListeners", { enumerable: true, get: function() { return i }, set: function(e) { if (typeof e !== "number" || e < 0 || e !== e) throw new TypeError('"defaultMaxListeners" must be a positive number');
                        i = e } }) } else { n.defaultMaxListeners = i } n.prototype.setMaxListeners = function e(t) { if (typeof t !== "number" || t < 0 || isNaN(t)) throw new TypeError('"n" argument must be a positive number');
                this._maxListeners = t; return this };

            function l(e) { if (e._maxListeners === undefined) return n.defaultMaxListeners; return e._maxListeners } n.prototype.getMaxListeners = function e() { return l(this) };

            function c(e, t, r) { if (t) e.call(r);
                else { var n = e.length; var i = b(e, n); for (var o = 0; o < n; ++o) i[o].call(r) } }

            function h(e, t, r, n) { if (t) e.call(r, n);
                else { var i = e.length; var o = b(e, i); for (var s = 0; s < i; ++s) o[s].call(r, n) } }

            function p(e, t, r, n, i) { if (t) e.call(r, n, i);
                else { var o = e.length; var s = b(e, o); for (var u = 0; u < o; ++u) s[u].call(r, n, i) } }

            function v(e, t, r, n, i, o) { if (t) e.call(r, n, i, o);
                else { var s = e.length; var u = b(e, s); for (var a = 0; a < s; ++a) u[a].call(r, n, i, o) } }

            function d(e, t, r, n) { if (t) e.apply(r, n);
                else { var i = e.length; var o = b(e, i); for (var s = 0; s < i; ++s) o[s].apply(r, n) } } n.prototype.emit = function e(t) { var r, n, i, o, s, u; var a = t === "error";
                u = this._events; if (u) a = a && u.error == null;
                else if (!a) return false; if (a) { if (arguments.length > 1) r = arguments[1]; if (r instanceof Error) { throw r } else { var f = new Error('Unhandled "error" event. (' + r + ")");
                        f.context = r; throw f } return false } n = u[t]; if (!n) return false; var l = typeof n === "function";
                i = arguments.length; switch (i) {
                    case 1:
                        c(n, l, this); break;
                    case 2:
                        h(n, l, this, arguments[1]); break;
                    case 3:
                        p(n, l, this, arguments[1], arguments[2]); break;
                    case 4:
                        v(n, l, this, arguments[1], arguments[2], arguments[3]); break;
                    default:
                        o = new Array(i - 1); for (s = 1; s < i; s++) o[s - 1] = arguments[s];
                        d(n, l, this, o) } return true };

            function y(e, t, r, n) { var i; var o; var s; if (typeof r !== "function") throw new TypeError('"listener" argument must be a function');
                o = e._events; if (!o) { o = e._events = a(null);
                    e._eventsCount = 0 } else { if (o.newListener) { e.emit("newListener", t, r.listener ? r.listener : r);
                        o = e._events } s = o[t] } if (!s) { s = o[t] = r;++e._eventsCount } else { if (typeof s === "function") { s = o[t] = n ? [r, s] : [s, r] } else { if (n) { s.unshift(r) } else { s.push(r) } } if (!s.warned) { i = l(e); if (i && i > 0 && s.length > i) { s.warned = true; var u = new Error("Possible EventEmitter memory leak detected. " + s.length + ' "' + String(t) + '" listeners ' + "added. Use emitter.setMaxListeners() to " + "increase limit.");
                            u.name = "MaxListenersExceededWarning";
                            u.emitter = e;
                            u.type = t;
                            u.count = s.length; if (typeof console === "object" && console.warn) { console.warn("%s: %s", u.name, u.message) } } } } return e } n.prototype.addListener = function e(t, r) { return y(this, t, r, false) };
            n.prototype.on = n.prototype.addListener;
            n.prototype.prependListener = function e(t, r) { return y(this, t, r, true) };

            function _() { if (!this.fired) { this.target.removeListener(this.type, this.wrapFn);
                    this.fired = true; switch (arguments.length) {
                        case 0:
                            return this.listener.call(this.target);
                        case 1:
                            return this.listener.call(this.target, arguments[0]);
                        case 2:
                            return this.listener.call(this.target, arguments[0], arguments[1]);
                        case 3:
                            return this.listener.call(this.target, arguments[0], arguments[1], arguments[2]);
                        default:
                            var e = new Array(arguments.length); for (var t = 0; t < e.length; ++t) e[t] = arguments[t];
                            this.listener.apply(this.target, e) } } }

            function m(e, t, r) { var n = { fired: false, wrapFn: undefined, target: e, type: t, listener: r }; var i = o.call(_, n);
                i.listener = r;
                n.wrapFn = i; return i } n.prototype.once = function e(t, r) { if (typeof r !== "function") throw new TypeError('"listener" argument must be a function');
                this.on(t, m(this, t, r)); return this };
            n.prototype.prependOnceListener = function e(t, r) { if (typeof r !== "function") throw new TypeError('"listener" argument must be a function');
                this.prependListener(t, m(this, t, r)); return this };
            n.prototype.removeListener = function e(t, r) { var n, i, o, s, u; if (typeof r !== "function") throw new TypeError('"listener" argument must be a function');
                i = this._events; if (!i) return this;
                n = i[t]; if (!n) return this; if (n === r || n.listener === r) { if (--this._eventsCount === 0) this._events = a(null);
                    else { delete i[t]; if (i.removeListener) this.emit("removeListener", t, n.listener || r) } } else if (typeof n !== "function") { o = -1; for (s = n.length - 1; s >= 0; s--) { if (n[s] === r || n[s].listener === r) { u = n[s].listener;
                            o = s; break } } if (o < 0) return this; if (o === 0) n.shift();
                    else g(n, o); if (n.length === 1) i[t] = n[0]; if (i.removeListener) this.emit("removeListener", t, u || r) } return this };
            n.prototype.removeAllListeners = function e(t) { var r, n, i;
                n = this._events; if (!n) return this; if (!n.removeListener) { if (arguments.length === 0) { this._events = a(null);
                        this._eventsCount = 0 } else if (n[t]) { if (--this._eventsCount === 0) this._events = a(null);
                        else delete n[t] } return this } if (arguments.length === 0) { var o = u(n); var s; for (i = 0; i < o.length; ++i) { s = o[i]; if (s === "removeListener") continue;
                        this.removeAllListeners(s) } this.removeAllListeners("removeListener");
                    this._events = a(null);
                    this._eventsCount = 0; return this } r = n[t]; if (typeof r === "function") { this.removeListener(t, r) } else if (r) { for (i = r.length - 1; i >= 0; i--) { this.removeListener(t, r[i]) } } return this };
            n.prototype.listeners = function e(t) { var r; var n; var i = this._events; if (!i) n = [];
                else { r = i[t]; if (!r) n = [];
                    else if (typeof r === "function") n = [r.listener || r];
                    else n = L(r) } return n };
            n.listenerCount = function(e, t) { if (typeof e.listenerCount === "function") { return e.listenerCount(t) } else { return w.call(e, t) } };
            n.prototype.listenerCount = w;

            function w(e) { var t = this._events; if (t) { var r = t[e]; if (typeof r === "function") { return 1 } else if (r) { return r.length } } return 0 } n.prototype.eventNames = function e() { return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [] };

            function g(e, t) { for (var r = t, n = r + 1, i = e.length; n < i; r += 1, n += 1) e[r] = e[n];
                e.pop() }

            function b(e, t) { var r = new Array(t); for (var n = 0; n < t; ++n) r[n] = e[n]; return r }

            function L(e) { var t = new Array(e.length); for (var r = 0; r < t.length; ++r) { t[r] = e[r].listener || e[r] } return t }

            function E(e) { var t = function() {};
                t.prototype = e; return new t }

            function j(e) { var t = []; for (var r in e)
                    if (Object.prototype.hasOwnProperty.call(e, r)) { t.push(r) } return r }

            function k(e) { var t = this; return function() { return t.apply(e, arguments) } } }, {}], 2: [function(e, t, r) { if (typeof Object.create === "function") { t.exports = function e(t, r) { t.super_ = r;
                    t.prototype = Object.create(r.prototype, { constructor: { value: t, enumerable: false, writable: true, configurable: true } }) } } else { t.exports = function e(t, r) { t.super_ = r; var n = function() {};
                    n.prototype = r.prototype;
                    t.prototype = new n;
                    t.prototype.constructor = t } } }, {}], 3: [function(e, t, r) { t.exports = n;

            function n(r) { var n; var i; var o; if (r != null && typeof r !== "function") throw new Error("cb must be a function"); if (r == null && typeof Promise !== "undefined") { n = new Promise(function(e, t) { i = e;
                        o = t }) }

                function e(e, t) { if (n) { if (e) o(e);
                        else i(t) } else { if (r) r(e, t);
                        else if (e) throw e } } e.promise = n; return e } }, {}], "/": [function(e, t, r) { t.exports = y; var p = e("events").EventEmitter; var n = e("inherits"); var f = e("promisize"); var v = typeof window === "undefined" ? self : window; var d = v.indexedDB || v.mozIndexedDB || v.webkitIndexedDB || v.msIndexedDB;
            y.INDEXEDDB_SUPPORT = d != null;
            y.BROADCAST_SUPPORT = v.BroadcastChannel != null;
            n(y, p);

            function y(e, t, r) { var n = this; if (typeof e !== "string") throw new Error("A name must be supplied of type string"); if (!d) throw new Error("IndexedDB not supported"); if (typeof t === "function") return new y(e, null, t); if (!(n instanceof y)) return new y(e, t, r); if (!t) t = {};
                p.call(n);
                n._db = null;
                n._closed = false;
                n._channel = null;
                n._waiters = []; var i = t.channel || v.BroadcastChannel; if (i) { n._channel = new i(e);
                    n._channel.onmessage = h } var o = d.open(e);
                o.onerror = s;
                o.onsuccess = a;
                o.onupgradeneeded = f;
                n.on("newListener", c);

                function s(e) { _(e);
                    n._close(e.target.error); if (r) r(e.target.error) }

                function u(e) { _(e);
                    n._close(e.target.error) }

                function a(e) { if (n._closed) { e.target.result.close() } else { n._db = e.target.result;
                        n._db.onclose = l;
                        n._db.onerror = u; for (var t in n._waiters) try{n._waiters[t]._init(null);}catch(uxi){}
                        n._waiters = null; if (r) r(null);
                        n.emit("open") } }

                function f(e) { var t = e.target.result;
                    t.createObjectStore("kv", { autoIncrement: true }) }

                function l() { n._close() }

                function c(e) { if (e !== "add" && e !== "set" && e !== "remove") return; if (!n._channel) return n.emit("error", new Error("No BroadcastChannel support")) }

                function h(e) { if (e.data.method === "add") n.emit("add", e.data);
                    else if (e.data.method === "set") n.emit("set", e.data);
                    else if (e.data.method === "remove") n.emit("remove", e.data) } } y.prototype.get = function(e, t) { return this.transaction("readonly").get(e, t) };
            y.prototype.getMultiple = function(e, t) { return this.transaction("readonly").getMultiple(e, t) };
            y.prototype.set = function(e, t, r) { r = f(r); var n = null; var i = this.transaction("readwrite", function(e) { n = n || e;
                    r(n) });
                i.set(e, t, function(e) { n = e }); return r.promise };
            y.prototype.json = function(e, t) { return this.transaction("readonly").json(e, t) };
            y.prototype.keys = function(e, t) { return this.transaction("readonly").keys(e, t) };
            y.prototype.values = function(e, t) { return this.transaction("readonly").values(e, t) };
            y.prototype.remove = function(e, t) { t = f(t); var r = null; var n = this.transaction("readwrite", function(e) { r = r || e;
                    t(r) });
                n.remove(e, function(e) { r = e }); return t.promise };
            y.prototype.clear = function(t) { t = f(t); var r = null; var e = this.transaction("readwrite", function(e) { r = r || e;
                    t(r) });
                e.clear(function(e) { r = e }); return t.promise };
            y.prototype.count = function(e, t) { return this.transaction("readonly").count(e, t) };
            y.prototype.add = function(e, t, r) { r = f(r); var n = null; var i = this.transaction("readwrite", function(e) { n = n || e;
                    r(n) });
                i.add(e, t, function(e) { n = e }); return r.promise };
            y.prototype.iterator = function(e, t) { return this.transaction("readonly").iterator(e, t) };
            y.prototype.transaction = function(e, t) { if (this._closed) throw new Error("Database is closed"); var r = new i(this, e, t); if (this._db) r._init(null);
                else this._waiters.push(r); return r };
            y.prototype.close = function() { this._close() };
            y.prototype._close = function(e) { if (this._closed) return;
                this._closed = true; if (this._db) this._db.close(); if (this._channel) this._channel.close();
                this._db = null;
                this._channel = null; if (e) this.emit("error", e);
                this.emit("close"); for (var t in this._waiters) this._waiters[t]._init(e || new Error("Database is closed"));
                this._waiters = null;
                this.removeAllListeners() };

            function i(e, t, r) { if (typeof t === "function") return new i(e, null, t);
                this._kvStore = e;
                this._mode = t || "readwrite";
                this._objectStore = null;
                this._waiters = null;
                this.finished = false;
                this.onfinish = f(r);
                this.done = this.onfinish.promise; if (this._mode !== "readonly" && this._mode !== "readwrite") { throw new Error('mode must be either "readonly" or "readwrite"') } } i.prototype._init = function(e) { var t = this; if (t.finished) return; if (e) return t._close(e); var r = t._kvStore._db.transaction("kv", t._mode);
                r.oncomplete = i;
                r.onerror = o;
                r.onabort = o;
                t._objectStore = r.objectStore("kv"); for (var n in t._waiters) t._waiters[n](null, t._objectStore);
                t._waiters = null;

                function i() { t._close(null) }

                function o(e) { _(e);
                    t._close(e.target.error) } };
            i.prototype._getObjectStore = function(e) { if (this.finished) throw new Error("Transaction is finished"); if (this._objectStore) return e(null, this._objectStore);
                this._waiters = this._waiters || [];
                this._waiters.push(e) };
            i.prototype.set = function(n, i, o) { var s = this; if (n == null || i == null) throw new Error("A key and value must be given");
                o = f(o);
                s._getObjectStore(function(e, t) { if (e) return o(e); try { var r = t.put(i, n) } catch (e) { return o(e) } r.onerror = _.bind(this, o);
                    r.onsuccess = function() { if (s._kvStore._channel) { s._kvStore._channel.postMessage({ method: "set", key: n, value: i }) } o(null) } }); return o.promise };
            i.prototype.add = function(n, i, o) { var s = this; if (i == null && n != null) return s.add(undefined, n, o); if (typeof i === "function" || i == null && o == null) return s.add(undefined, n, i); if (i == null) throw new Error("A value must be provided as an argument");
                o = f(o);
                s._getObjectStore(function(e, t) { if (e) return o(e); try { var r = n == null ? t.add(i) : t.add(i, n) } catch (e) { return o(e) } r.onerror = _.bind(this, o);
                    r.onsuccess = function() { if (s._kvStore._channel) { s._kvStore._channel.postMessage({ method: "add", key: n, value: i }) } o(null) } }); return o.promise };
            i.prototype.get = function(n, i) { var e = this; if (n == null) throw new Error("A key must be given as an argument");
                i = f(i);
                e._getObjectStore(function(e, t) { if (e) return i(e); try { var r = t.get(n) } catch (e) { return i(e) } r.onerror = _.bind(this, i);
                    r.onsuccess = function(e) { i(null, e.target.result) } }); return i.promise };
            i.prototype.getMultiple = function(u, a) { var e = this; if (u == null) throw new Error("An array of keys must be given as an argument");
                a = f(a); if (u.length === 0) { a(null, []); return a.promise } e._getObjectStore(function(e, t) { if (e) return a(e); var n = u.slice().sort(); var i = 0; var o = {}; var s = function() { return u.map(function(e) { return o[e] }) }; var r = t.openCursor();
                    r.onerror = _.bind(this, a);
                    r.onsuccess = function(e) { var t = e.target.result; if (!t) { a(null, s()); return } var r = t.key; while (r > n[i]) {++i; if (i === n.length) { a(null, s()); return } } if (r === n[i]) { o[r] = t.value;
                            t.continue() } else { t.continue(n[i]) } } }); return a.promise };
            i.prototype.json = function(e, r) { var t = this; if (typeof e === "function") return t.json(null, e);
                r = f(r); var n = {};
                t.iterator(e, function(e, t) { if (e) return r(e); if (t) { n[t.key] = t.value;
                        t.continue() } else { r(null, n) } }); return r.promise };
            i.prototype.keys = function(e, r) { var t = this; if (typeof e === "function") return t.keys(null, e);
                r = f(r); var n = [];
                t.iterator(e, function(e, t) { if (e) return r(e); if (t) { n.push(t.key);
                        t.continue() } else { r(null, n) } }); return r.promise };
            i.prototype.values = function(e, r) { var t = this; if (typeof e === "function") return t.values(null, e);
                r = f(r); var n = [];
                t.iterator(e, function(e, t) { if (e) return r(e); if (t) { n.push(t.value);
                        t.continue() } else { r(null, n) } }); return r.promise };
            i.prototype.remove = function(n, i) { var o = this; if (n == null) throw new Error("A key must be given as an argument");
                i = f(i);
                o._getObjectStore(function(e, t) { if (e) return i(e); try { var r = t.delete(n) } catch (e) { return i(e) } r.onerror = _.bind(this, i);
                    r.onsuccess = function() { if (o._kvStore._channel) { o._kvStore._channel.postMessage({ method: "remove", key: n }) } i(null) } }); return i.promise };
            i.prototype.clear = function(n) { var e = this;
                n = f(n);
                e._getObjectStore(function(e, t) { if (e) return n(e); try { var r = t.clear() } catch (e) { return n(e) } r.onerror = _.bind(this, n);
                    r.onsuccess = function() { n(null) } }); return n.promise };
            i.prototype.count = function(n, i) { var e = this; if (typeof n === "function") return e.count(null, n);
                i = f(i);
                e._getObjectStore(function(e, t) { if (e) return i(e); try { var r = n == null ? t.count() : t.count(n) } catch (e) { return i(e) } r.onerror = _.bind(this, i);
                    r.onsuccess = function(e) { i(null, e.target.result) } }); return i.promise };
            i.prototype.iterator = function(n, i) { var e = this; if (typeof n === "function") return e.iterator(null, n); if (typeof i !== "function") throw new Error("A function must be given");
                e._getObjectStore(function(e, t) { if (e) return i(e); try { var r = n == null ? t.openCursor() : t.openCursor(n) } catch (e) { return i(e) } r.onerror = _.bind(this, i);
                    r.onsuccess = function(e) { var t = e.target.result;
                        i(null, t) } }) };
            i.prototype.abort = function() { if (this.finished) throw new Error("Transaction is finished"); if (this._objectStore) this._objectStore.transaction.abort();
                this._close(new Error("Transaction aborted")) };
            i.prototype._close = function(e) { if (this.finished) return;
                this.finished = true;
                this._kvStore = null;
                this._objectStore = null; for (var t in this._waiters) this._waiters[t](e || new Error("Transaction is finished"));
                this._waiters = null; if (this.onfinish) this.onfinish(e);
                this.onfinish = null };

            function _(e, t) { if (t == null) return _(null, e);
                t.preventDefault();
                t.stopPropagation(); if (e) e(t.target.error) } }, { events: 1, inherits: 2, promisize: 3 }] }, {}, [])("/") });
var ngdb;
function loadVietphraseOffline(cb) {
	if(!window.indexedDB){
		return alert("Trình duyệt của bạn không hỗ trợ file vietphrase riêng.");
	}
	if(ngdb==null){
		ngdb=new IdbKvStore('vietphrase',{},loadVietphraseOffline);
		//ngdb.set("vietphrasedata",phrasetree.data);
	}else{
		ngdb.get("vietphrasedata",function(err,val){
			if(err)throw err;
			phrasetree.data=val;
			if(window.loadvp===false){
				window.loadvp=true;
			}
			//replaceVietphrase();
		});
	}
}
function insertVietphraseOffline(file){
	if(!window.indexedDB){
		return alert("Trình duyệt của bạn không hỗ trợ file vietphrase riêng.");
	}
	if(ngdb==null){
		ngdb=new IdbKvStore('vietphrase');
		//ngdb.set("vietphrasedata",phrasetree.data);
	}
	var fr = new FileReader();
    fr.onload = function(e)
        {
        	//alert(fr.result.length);
        	var lines=fr.result.split(/\r?\n/);
        	//return console.log(lines.length);
        	var count=0;
        	for(var i=0;i<lines.length;i++){
        		var phr=lines[i].split("=");
        		if(phr.length>1){
        			phrasetree.setmean(phr[0],"="+phr[1]);
        			count++;
        		}
        	}
            ngdb.set("vietphrasedata",phrasetree.data); 
            store.setItem("useofflinevietphrase","true");
            window.priorvp=true;
            alert("Nhập thành công "+count+" dòng.");
        };
    fr.readAsText(file);
}
function openinsertvpmodal() {
	var md=createModal("Nhập vietphrase cá nhân");
	md.body().innerHTML='<br><input type="file" id="vpfile" onch="insertVietphraseOffline(this.files[0])"><br><center><button class="btn" onclick="insertVietphraseOffline(g(\'vpfile\').files[0])">Nhập</button></center><br><div id="insertvpstatus"></div>';
	md.show();
}
function toonemeaning(mulmean) {
	return mulmean.split(/[\/\|]/)[0];	
}
function convertchitovi(chinese) {
	chinese=standardizeinput(chinese);
	var stringBuilder = [];
    var num = chinese.length - 1;
    var lastword={data:""};
    var i = 0;
    while (i <= num)
    {
        var flag = false;
        for (var j = 12; j > 0; j--)
        {
            if (chinese.length >= i + j)
            {
                var cn=chinese.substr(i, j);
                var text=phrasetree.getmean(cn);
                if (text!=""&&text.length>0)
                {
                	text=text.substring(1);
                    lastlen = j;
                    appendTranslatedWord(stringBuilder, "<i h=''t='"+cn+"'v='"+text+"'>" + toonemeaning(text) + "</i>", lastword);
                    flag = true;
                    i += j;
                    break;
                }
            }
        }
        if (!flag)
        {
            var han = convertohanviet(chinese[i]);
            appendTranslatedWord(stringBuilder, "<i h='"+han+"'t='"+chinese[i]+"'>"+han+"</i>",lastword);
            i++;
        }
    }
    return stringBuilder.join("");
}
function convertohanviet(chi){
	return hanvietdic[chi]||"";
}
function convertohanviets(str){
	var result=[];
	for(var i=0;i<str.length;i++){
		result.push(convertohanviet(str[i]));
	}
	return result.join(" ");
}
function appendTranslatedWord(result,translatedText,lastTranslatedWord)
{
    if (/(\. |\“|\'|\? |\! |\.\” |\?\” |\!\” |\: )$/.test(lastTranslatedWord.data))
    {
        lastTranslatedWord.data = appendUcFirst(translatedText);
    }
    else if (/[ \(]$/.test(lastTranslatedWord.data))
    {
        lastTranslatedWord.data = translatedText;
    }
    else
    {
        lastTranslatedWord.data = " " + translatedText;
    }
    result.push(lastTranslatedWord.data);
}
function appendUcFirst(text)
{
	var result;
	if (!text)
	{
		result = text;
	}
	else if (text[0]=="[" && 2 <= text.length)
	{
		result = "[" + text[1].toUpperCase() + ((text.length <= 2) ? "" : text.substring(2));
	}
	else
	{
		result = text[0].toUpperCase() + ((text.length <= 1) ? "" : text.substring(1));
	}
	return result;
}
function standardizeinput(original)
{
	var result;
	if (!original)
	{
		result = "";
	}
	else
	{
		var text = original;
		var array=["“", "，", "。", "：", "”", "？", "！", "．", "、", "…"]; 
		var array2=[" “", ", ", ".", ": ", "” ", "?", "!", ".", ", ", "..."];
		for (var i = 0; i < array.length; i++)
		{
			text = text.replace(new RegExp(array[i],"g"), array2[i]);
		}
		text = text.replace(/  /g, " ").replace(/ \r\n/g, "\n").replace(/ \n/g, "\n");
		return text;
	}
	return result;
}
function override(funcName,newFunc){
	if(!window.overrideglobal)window.overrideglobal={};
	if(window[funcName]){
		window.overrideglobal[funcName]=window[funcName];
		window[funcName]=function(){
			var _super=window.overrideglobal[funcName];
			newFunc(argument);
		}
	}
}

var speaker={
	utter:false,
	parsed:false,
	senid:-1,
	sentences:[],
	senmap:[],
	hnrgx:/[!“”]/,
	loadedconfig:false,
	speaking:false,
	autocontinue:(function(l){var v = l && l.hash == "#autocontinue"; return v;})(window.location),
	parseSen:function () {
		var startnd=g(contentcontainer).childNodes[0];
		if(!startnd) {
			return;
		}
		var allsens=[];
		var sen=[];
		var minsen=[];
		var stack="";
		var pList = q("#" + contentcontainer + " p");
		var pIndex = 0;
		if(startnd.tagName=="P" && pList.length > 0){
			var f = findNextI(pList, 0);
			if(f){
				startnd = f.i;
				pIndex = f.idx;
			}
		}
		while(startnd!=null){
			if(startnd.tagName=="BR"){
				if(sen.length>0){
					allsens.push(sen);
					sen=[];
				}
			}else
			if(startnd.tagName=="I" 
				&& startnd.id[0] != "e" 
				&& !startnd.classList.contains("talk")){
				sen.push(startnd);
			}else 
			if(startnd.nodeType==document.TEXT_NODE || startnd.tagName=="I"){
				if(startnd.textContent.contain("“")){
					if(sen.length>0){
						allsens.push(sen);
						sen=[];
					}
					sen.push(startnd);
				}else if(startnd.textContent.contain("”")){
					sen.push(startnd);
					allsens.push(sen);
					sen=[];
				}
				else if(startnd.textContent.contain(",")){
				 	sen.push(startnd);
				}
				else if(startnd.textContent.contain(".")){
					sen.push(startnd);
					allsens.push(sen);
					sen=[];
				}else{
					sen.push(startnd);
				}
			}
			startnd=startnd.nextSibling;
			if(startnd==null){
				if(pIndex<pList.length){
					pIndex++;
					var f = findNextI(pList, pIndex);
					if(f){
						startnd = f.i;
						pIndex = f.idx;
						allsens.push(sen);
						sen=[];
					}
				}
			}
		}
		if(sen.length>0){
			allsens.push(sen);
		}
		this.sentences=allsens;
		parsed=true;
		this.senmap = [];
		for(var i=0;i<allsens.length;i++){
			var tx=this.senToText(i);
			this.senmap.push({
				text:tx.trim().replace(/[“”\.]/g,""),
				type:this.getSenType3(tx)
			});
		}
		for(var i=0;i<allsens.length;i++){
			if(this.senmap[i].type=="vo"){
				for(var co=0;co<15;co++){
					if(i+co>=allsens.length){
						break;
					}
					if(this.senmap[i+co].type!="ve"){
						this.senmap[i+co].type="hn";
					}else{
						this.senmap[i+co].type="hn";
						break;
					}
				}
			}
		}
	},
	getSenType3:function(text){
		var text;
		if(text.contain("“")&&text.contain("”")){
			return "hn";
		}
		if(text.contain("“")){
			return "vo";
		}
		if(text.contain('!')&&text.contain("?")){
			return "hs";
		}
		if(text.contain("”")){
			return "ve";
		}
		return "nn";
	},
	getSenType2:function(sen){
		var text;
		for(var i=0;i<sen.length;i++){
			text=sen[i].textContent;
			if(text.contain("“")&&text.contain("”")){
				return "hn";
			}
			if(text.contain("“")){
				return "vo";
			}
			if(text.contain('!')&&text.contain("?")){
				return "hs";
			}
			if(text.contain("”")){
				return "ve";
			}
		}
		return "nn";
	},
	getSenType:function(text){
		if(text.contain('!')&&text.contain("?")){
			return "hs";
		}
		if(this.hnrgx.test(text)){
			return "hn";
		}
		return "nn";
	},
	viRgx: /[a-zàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ]/,
	senToText:function(senid){
		var text="";
		var sen=this.sentences[senid];
		for(var i=0;i<sen.length;i++){
			if(sen[i].tagName=="I"){
				if(sen[i].gT().length>0 || sen[i].textContent.match(this.viRgx))text+=" "+sen[i].textContent;
			}else
			text+=" "+sen[i].textContent;
		}
		return text;
		//return [text.trim().replace(/[“,”\.]/g,""),this.getSenType(text)];
	},
	trimNaN: function(v){
		v =	Math.round(v * 10) / 10;
		if(isNaN(v)){
			return 1;
		}
		return v;
	},
	engine: {
		promiseValue: function(v){
			return new Promise(function(r){r(v);});
		},
		getUtter: function(){
			if(window.setting && window.setting.ttsengine){
				var e = window.setting.ttsengine;
				if(e.indexOf("bing") >=0 ){
					var vv = e.split("_")[1];
					return this.wrappedEngine("bing", {voice: vv});
				}
				switch (e) {
					case "browser":
						return this.browserEngine();
					case "bing":
						return this.wrappedEngine("bing", {voice:"0"});
					case "bing_male":
						return this.wrappedEngine("bing", {voice:"1"});
					case "stv":
					default:
						return this.stvWrappedEngine();
				}
			}
			var e = this.browserEngine();
			if(!e){
				return this.wrappedEngine("bing", {voice:"0"});
			}
			return e;
		},
		setEngine: function(e){
			setting.ttsengine = e;
			store.setItem("setting", JSON.stringify(setting));
		},
		browserEngine: function(){
			if(!window.speechSynthesis){
				return this.promiseValue(null);
			}
			var voices = window.speechSynthesis.getVoices();
			var isVietnamese = false;
			var voice = false;
			for(var i=0;i<voices.length;i++){
				if(voices[i].lang == "vi-VN" || voices[i].lang.contain("vi")){
					isVietnamese = true;
					if(voices[i].localService == false){
						voice = voices[i];
						break;
					}
				}
			}
			if(!isVietnamese){
				if(this.waitForBrowser && voices.length != 0 ){
					return this.promiseValue(null);;
				}else{
					this.waitForBrowser = true;
					return new Promise(function(resolve){
						setTimeout(function(){
							speaker.engine.getUtter().then(resolve);
						}, 2000);
					});
				}
			}
			var utter=new SpeechSynthesisUtterance();
			if(voice){
				utter.voice = voice;
			}
			return this.promiseValue(utter);
		},
		loadTtsScript: function(){
			return new Promise(function(resolve){
				ui.scriptmanager.load("/stv.tts.js?v=18", function(){
					resolve();
				});
			});
		},
		wrappedEngine: function(e, o){
			return this.loadTtsScript().then(function(){
				ttsEngine.init(e, o || {}, true);
				window.STV_SERVER = location.origin;
				var utter = {
					speak: function(){
						if(this.preloadedItem){
							ttsEngine.play(this.preloadedItem);
							this.isWaiting = false;
							this.preloadedItem = null;
							this.onstart();
						}else{
							this.isWaiting = true;
						}
						this.preload();
					},
					text: "",
					nextText: false,
					preloadedItem: null,
					rate: 1,
					pitch: 1,
					volume: 1,
					preload: function(){
						if(this.nextText && !this.isLoading){
							var ref = this;
							this.isLoading = true;
							console.log("Requesting audio for: "+this.nextText);
							ttsEngine.requestAudioInstant(this.nextText,this).then(function(audioItem){
								ref.preloadedItem = audioItem;
								ref.nextText = "";
								ref.isLoading = false;
								if(ref.isWaiting){
									ref.speak();
								}
							});
						}
					},
					pause: function(){
						ttsEngine.audio.pause();
					},
					resume: function(){
						ttsEngine.audio.play();
					},
					onend: function(){},
					onstart: function(){}
				};
				ttsEngine.onSentenceEnd = function(){
					utter.onend();
				}
				return utter;
			});
		},
		bingEngine: function(){
			return this.wrappedEngine("bing");
		},
		stvWrappedEngine: function(){
			return this.wrappedEngine("stv");
		}
	},
	loadconfig:function (iswaiter) {
		if(abookhost=="faloo"){
			return;
		}
		if(!this.utter){
			if(!window.speechSynthesis){
				return alert("Thiết bị của bạn không hỗ trợ nghe sách.");
			}
			var voices = window.speechSynthesis.getVoices();
			var isVietnamese = false;
			var voice = false;
			console.log(voices);
			for(var i=0;i<voices.length;i++){
				//console.log(voices[i]);
				if(voices[i].lang == "vi-VN" || voices[i].lang.contain("vi")){
					isVietnamese = true;
					//break;

					if(voices[i].localService == false){
						voice = voices[i];

						break;
					}
				}
			}
			if(!isVietnamese){
				if(iswaiter && voices.length != 0 ){
					alert("Chưa cài đặt tiếng việt, nghe sách chỉ hổ trợ thiết bị android, hoặc trình duyệt edge, truy cập cài đặt giọng nói trên thiết bị và tải tiếng việt.");
					return;
				}else{
					setTimeout(function(){speaker.loadconfig(true);}, 2000);
					return;
				}
			}
			this.utter=new SpeechSynthesisUtterance();
			this.utter.lang="vi-VN";
			if(voice){
				this.utter.voice = voice;
			}
			this.utter.onend=function(){
				speaker.readnext();
			}
			if(store.getItem("speaker-flex")=="false"){
				this.flexread=false;
			}
			if(store.getItem("speaker-spd")){
				this.utter.rate=0+store.getItem("speaker-spd");
			}
			if(store.getItem("speaker-pit")){
				this.utter.pitch=0+store.getItem("speaker-pit");
			}
			if(store.getItem("speaker-vol")){
				this.utter.volume=0+store.getItem("speaker-vol");
			}
			if(store.getItem("speaker-auto") == "true"){
				this.autocontinue = true;
			}
		}
	},
	createMediaSession: function(){
		if(navigator.mediaSession){
			navigator.mediaSession.metadata = new MediaMetadata({
				title: g("booknameholder").textContent,
				artist: "STV",
				album: "STV",
				artwork: [
					{src: "/favicon.ico", sizes: "192x192", type: "image/png"},
				]
			});
			navigator.mediaSession.setActionHandler('play', function(){
				navigator.mediaSession.playbackState = "playing";
				speaker.resume();
			});
			navigator.mediaSession.setActionHandler('pause', function(){
				navigator.mediaSession.playbackState = "paused";
				speaker.pause();
			});
			navigator.mediaSession.setActionHandler('previoustrack', function(){
				speaker.pause();
				speaker.senid-=2;
				speaker.readnext();
			});
			navigator.mediaSession.setActionHandler('nexttrack', function(){
				speaker.pause();
				speaker.readnext();
			});
			navigator.mediaSession.playbackState = "paused";
		}
	},
	loadconfig2:function (iswaiter, force = false) {
		if(abookhost=="faloo"){
			return;
		}
		if(!this.utter || force){
			return this.engine.getUtter().then((function(u){
				this.utter=u;
				this.utter.lang="vi-VN";
				
				this.utter.onend=function(){
					speaker.readnext();
				}
				this.utter.onstart=function(){
					speaker.preloadNextOnline();
				}
				if(store.getItem("speaker-flex")=="false"){
					this.flexread=false;
				}
				if(store.getItem("speaker-spd")){
					this.utter.rate=0+this.trimNaN(store.getItem("speaker-spd"));
				}
				if(store.getItem("speaker-pit")){
					this.utter.pitch=0+this.trimNaN(store.getItem("speaker-pit"));
				}
				if(store.getItem("speaker-vol")){
					this.utter.volume=0+this.trimNaN(store.getItem("speaker-vol"));
				}
				if(store.getItem("speaker-auto") == "true"){
					this.autocontinue = true;
				}
				this.createMediaSession();
			}).bind(this));
		}else{
			return this.engine.promiseValue(null);
		}
	},
	readBook:function(retry){
		this.showsetting();
		if(this.speaking){
			return;
		}
		return this.readBook2();
		this.loadconfig();
		if(!this.utter){
			if(!retry)
			setTimeout(function(){
				speaker.readBook(true);
			},3000);
			return;
		}
		if(!this.parsed){
			this.parseSen();
		}
		this.senid=-1;
		this.readnext();
		this.speaking=true;
	},
	readBook2: function(){
		if(this.speaking){
			this.showsetting();
			return;
		}
		this.loadconfig2().then((function(){
			if(!this.parsed){
				this.parseSen();
			}
			//this.senid=-1;
			this.readnext();
			this.speaking=true;
		}).bind(this));
	},
	setPitch(type){
		if(this.flexread==false){
			return;
		}
		if(type=="hs"){
			this.utter.pitch=1.2;
			this.utter.rate=0.7;
		}
		if(type=="hn"){
			this.utter.pitch=1.2;
			this.utter.rate=1;
		}
		if(type=="nn"){
			this.utter.pitch=0.8;
			this.utter.rate=1;
		}
		this.onVUpdate();
	},
	readSen:function(senid){
		var s=this.senToText(this.senid);
		if(!this.utter){
			this.loadconfig2();
		}
		this.utter.text=s[0];
		this.setPitch(s[1]);
		this.speak();
	},
	highlightOff:function(id){
		if(id<0)return;
		var s=this.sentences[id];
		if(!s)return;
		for(var i=0;i<s.length;i++){
			if(s[i].tagName=="I"){
				s[i].style.color="inherit";
			}
		}
	},
	highlightOn:function(id, cl){
		if(id<0)return;
		var s=this.sentences[id];
		if(s!=null){
			var firstEle = null; 
			for(var i=0;i<s.length;i++){
				if(s[i].tagName=="I"){
					s[i].style.color=cl || "red";
					if(!firstEle){
						firstEle = s[i];
					}
				}
			}
			try{
				if(firstEle){
					ui.scrollto(firstEle.id, -230, document.body);
				}
				
			}catch(e){}
		}
	},
	readnext:function(){
		this.highlightOff(this.senid);
		this.senid++;
		this.highlightOn(this.senid);
		var s=this.senmap[this.senid];

		if(!this.utter){
			this.loadconfig2();
		}
		if(!this.utter){
			return;
		}
		//this.utter.text=s.text;
		if(this.senid >= this.senmap.length){
			this.speaking=false;
			this.senid = -1;
			if(this.autocontinue){
				var n = g("navnextbot");
				n.setAttribute("href", n.href + "#autocontinue");
				n.click();
			}
			this.senmap =[];
			this.sentences = [];
			return;
		}
		this.utter.text=this.nextSenText || s.text;
		if(this.utter.text.length == ""){
			return this.readnext();
		}
		this.utter.nextText = this.utter.text;
		if(this.senid < this.sentences.length){
			convertSenWithGG(this.sentences[this.senid]);
		}
		this.setPitch(s.type);
		this.after(0);
		if(navigator.mediaSession){
			navigator.mediaSession.playbackState = "playing";
		}
	},
	pause: function(){
		this.speaking = false;
		if(this.utter){
			if(this.utter.speak){
				this.utter.pause();
			}else{
				speechSynthesis.pause();
			}
			this.speaking = false;
		}
	},
	resume: function(){
		if(this.utter){
			if(this.utter.speak){
				this.utter.resume();
			}else{
				speechSynthesis.resume();
			}
			this.speaking = true;
		}
	},
	preloadNextOnline: function(){
		var preloadSen = this.senmap[this.senid + 1];
		if(preloadSen && preloadSen.text.length > 0){
			this.utter.nextText = preloadSen.text;
		}
	},
	after:function(time){
		setTimeout(function(){
			speaker.speak();
		}, time);
	},
	speak:function(){
		//speechSynthesis.speak(this.utter);
		if(this.utter.speak){
			this.utter.speak();
		}else{
			speechSynthesis.speak(this.utter);
		}
	},
	showsetting:function () {
		this.loadconfig2();
		if(!ui || !ui.win){
			return;
		}
		var wd=ui.win.create("Cài đặt nghe sách");
		var rw=wd.body.row();
		rw.addText("Giọng đọc:");
		rw.addPadder();
		var enSel = document.createElement("select");
		var list = {
			browser: "Giọng trình duyệt (khi tắt màn hình hay đổi app sẽ bị ngừng)",
			stv: "Giọng nữ Sogou",
			bing_0: "Giọng nữ Bing",
			bing_1: "Giọng nam Bing",
			bing_2: "Giọng nam Bing 3",
			bing_3: "Giọng nữ Bing 4",
			bing_4: "Giọng nam Bing 5",
			bing_5: "Giọng nữ Bing 6",
			bing_6: "Giọng nữ Bing 7",
			bing_7: "Giọng nam Bing 8",
			bing_8: "Giọng nữ Bing 9",
			bing_9: "Giọng nam Bing 10",
		}
		for(var name in list){
			var e = document.createElement("option");
			e.textContent = list[name];
			e.value = name;
			enSel.appendChild(e);
		}
		enSel.addEventListener("change", function(){
			speaker.engine.setEngine(this.value);
			speaker.loadconfig2(null, true);
		});
		enSel.style.width = '210px';
		if(window.setting&&window.setting.ttsengine){
			enSel.value = window.setting.ttsengine;
		}
		rw.appendChild(enSel);
		rw=wd.body.row();
		rw.addText("Âm điệu nhịp nhàng");
		var tg = rw.addToggle(function() {
			store.setItem("speaker-flex", this.checked.toString());
			speaker.flexread=this.checked;
		});
		tg.checked=true;
		if(store.getItem("speaker-flex")=="false"){
			tg.checked=false;
		}
		rw=wd.body.row();
		rw.addText("Ghi chú: bật âm điệu nhịp nhàng sẽ k thể đổi tốc độ đọc và cao giọng");
		rw.style.whiteSpace = "normal";
		rw = wd.body.row();
		var txtStyle = "width:100px;flex:1", inputStyle = "width: 70px;text-align: center;height: 25px", btnStyle = "width: 100px";
		rw.addText("Tốc độ đọc: ").setAttribute("style", txtStyle);
		rw.addButton("Chậm hơn","speaker.decSpd()","green").setAttribute("style", btnStyle);
		var ip = rw.addInput("ip-speakerspd","Tốc độ");
		ip.value=this.trimNaN(this.utter.rate);
		ip.setAttribute("style", inputStyle);
		rw.addButton("Nhanh hơn","speaker.incSpd()","green").setAttribute("style", btnStyle);
		rw = wd.body.row();
		rw.addText("Cao độ đọc: &nbsp;&nbsp;").setAttribute("style", txtStyle);
		rw.addButton("Thấp hơn","speaker.decPit()","green").setAttribute("style", btnStyle);
		var ip = rw.addInput("ip-speakerpit","Cao độ");
		ip.value=this.trimNaN(this.utter.pitch);
		ip.setAttribute("style", inputStyle);
		rw.addButton("Cao hơn","speaker.incPit()","green").setAttribute("style", btnStyle);
		rw = wd.body.row();
		rw.addText("Âm lượng: ").setAttribute("style", txtStyle);
		rw.addButton("Thấp hơn","speaker.decVol()","green").setAttribute("style", btnStyle);
		var ip = rw.addInput("ip-speakervol","Âm lượng");
		ip.value=this.utter.volume > 0 ? this.trimNaN(this.utter.volume) : 1;
		ip.setAttribute("style", inputStyle);
		rw.addButton("Cao hơn","speaker.incVol()","green").setAttribute("style", btnStyle);
		rw = wd.body.row();
		rw.addText("Tự động sang chương: &nbsp;&nbsp;");
		rw.addPadder();
		var tg = rw.addToggle(function(){
			speaker.setAutoContinue(this.checked);
		});
		tg.checked = this.autocontinue;
		rw = wd.body.row();
		rw.addButton("Tạm ngưng","speaker.pause()","blue w-50");
		rw.addButton("Tiếp tục đọc","speaker.resume()","green w-50");
		wd.show();
	},
	decPit:function () {
		this.utter.pitch-=0.1;
		this.utter.pitch = this.trimNaN(this.utter.pitch);
		store.setItem("speaker-pit",this.utter.pitch);
		try{
			g("ip-speakerpit").value=this.trimNaNText(this.utter.pitch);
		}catch(e){};
	},
	incPit:function () {
		this.utter.pitch+=0.1;
		this.utter.pitch = this.trimNaN(this.utter.pitch);
		store.setItem("speaker-pit",this.utter.pitch);
		try{
			g("ip-speakerpit").value=this.trimNaNText(this.utter.pitch);
		}catch(e){};
	},
	decSpd:function () {
		this.utter.rate-=0.1;
		this.utter.rate = this.trimNaN(this.utter.rate);
		store.setItem("speaker-spd",this.utter.rate);
		try{
			g("ip-speakerspd").value=this.trimNaNText(this.utter.rate);
		}catch(e){};
	},
	incSpd:function () {
		this.utter.rate+=0.1;
		this.utter.rate = this.trimNaN(this.utter.rate);
		store.setItem("speaker-spd",this.utter.rate);
		try{
			g("ip-speakerspd").value=this.trimNaNText(this.utter.rate);
		}catch(e){};
	},
	decVol:function () {
		if(this.utter.volume < 0){
			this.utter.volume = 1;
		}
		this.utter.volume-=0.1;
		this.utter.volume = this.trimNaN(this.utter.volume);
		store.setItem("speaker-vol",this.utter.volume);
		try{
			g("ip-speakervol").value=this.trimNaNText(this.utter.volume);
		}catch(e){};
	},
	incVol:function () {
		if(this.utter.volume < 0){
			this.utter.volume = 1;
		}
		this.utter.volume+=0.1;
		this.utter.volume = this.trimNaN(this.utter.volume);
		store.setItem("speaker-vol",this.utter.volume);
		try{
			g("ip-speakervol").value=this.trimNaNText(this.utter.volume);
		}catch(e){};
	},
	trimNaNText: function(v){
		v = this.trimNaN(v);
		var t = v + "";
		t = t.split(".");
		if(t.length == 1){
			return t[0];
		}
		return t[0]+"."+t[1].substring(0, 1);
	},
	setAutoContinue:function (v) {
		this.autocontinue = v;
		store.setItem("speaker-auto",""+v);
	},
	onVUpdate:function(){
		try{
			g("ip-speakervol").value=this.utter.volume;
			g("ip-speakerspd").value=this.utter.rate;
			g("ip-speakerpit").value=this.utter.pitch;
		}catch(e){};
	}
}
var ntsengine={
	tim:0,
	wordConnector:function(node){
		if(node.nE()!=null&&node.isspace(true)){
			var l=[node,node.nE()];
			if(l[1].nE()!=null&&l[1].isspace(true)){
				l.push(l[1].nE());
			}
			if(l.length>2){
				this.containWord(l
					,function(d){
						l[0].style.border="1px solid green";
						l[0].style.borderWidth="1px 0 1px 1px";
						l[2].style.border="1px solid green";
						l[2].style.borderWidth="1px 1px 1px 0px";
						if(l[2].nE()!=null){
							ntsengine.wordConnector(l[2].nE());
						}
					}
					,function(d){
						l.pop();
						ntsengine.containWord(l
							,function(d){
								l[0].style.border="1px solid green";
								l[0].style.borderWidth="1px 0 1px 1px";
								l[1].style.border="1px solid green";
								l[1].style.borderWidth="1px 1px 1px 0px";
								if(l[1].nE().nE()!=null){
									ntsengine.wordConnector(l[1].nE().nE());
								}
							}
							,function(d){
								ntsengine.wordConnector(l[1]);
							}
						);
					}
				);
			}
			else{
				this.containWord(l
					,function(d){
						l[0].style.border="1px solid green";
						l[0].style.borderWidth="1px 0 1px 1px";
						l[1].style.border="1px solid green";
						l[1].style.borderWidth="1px 1px 1px 0px";
						if(l[1].nE()!=null){
							ntsengine.wordConnector(l[1].nE());
						}
					}
					,function(d){
						ntsengine.wordConnector(l[1]);
					}
				);
			}
		}else if(node.nE()){
			this.wordConnector(node.nE());
		}else{
			console.timeEnd("nts");
		}
	},
	containWord:function (wl,t,f){
		tse.send("005",wl.sumChinese(''),function(){
			if(this.down!="false"){
				t(this.down);
			}else{
				f(this.down);
			}
		});
	},
	retrans:function(){
		var nd=q("#"+contentcontainer+" i")[0];
		console.time("nts");
		this.wordConnector(nd);
	}
}
function overread(){

}
function clearWhiteSpace(){
	var empty = q("#"+contentcontainer+" i:empty");
	for(var i=0;i<empty.length;i++){
		if(!empty[i].isspace(true)&&empty[i].isspace(false)){
			empty[i].previousSibling.textContent="";
			empty[i].previousSibling.isspacehidden=true;
			var crn = empty[i];
			while(crn.pE()&&crn.pE().textContent==""&&crn.pE().isspace(false)){
				crn = crn.pE();
				crn.previousSibling.textContent="";
				crn.previousSibling.isspacehidden=true;
				if(crn.previousSibling.previousSibling.nodeType==3){
					crn.previousSibling.previousSibling.textContent="";
					crn.previousSibling.previousSibling.isspacehidden=true;
				}
			}
			//console.log(empty[i]);
			
		}
	}
	clearDiLastSen();
}
function clearDiLastSen(){
	q("#"+contentcontainer+" i[t=\"的\"],#"+contentcontainer+" i[t=\"了\"]").forEach(function(e){
		if(e.isspace(false) && (!e.isspace(true) || (e.nE() && e.nE().textContent=="") )){
			e.previousSibling.textContent="";
			e.previousSibling.isspacehidden=true;
		}
	});
}
function nodeIsHan(node){
	if(node.textContent=="")return false;
	var m=node.getAttribute("v");
	if(m==null){
		return false;
	}
	m=m.split("/");

	var percent = 0;
	
	var h=node.gH().toLowerCase().split(" ");
	var l=node.textContent.toLowerCase().split(" ");
	if(l.length<2){
		return false;
	}
	for(var j=0;j<m.length;j++){
		l=m[j].toLowerCase().split(" ");
		for(var i=0;i<l.length;i++){
			if(h.indexOf(l[i]) < 0)
			{
				percent++;
				break;
			}
		}
	}
	if(percent > m.length/3){
		return false;
	}
	return true;
}
function toCnWithName(){
	q("#"+contentcontainer+" i").forEach(function(e){
		if(!e.containName() && !nodeIsHan(e)){
			e.textContent=e.cn;
		}else{
			e.textContent =""+e.textContent+"";
		}
	});
	var a=g(contentcontainer);
	ui.copy(a.innerText);
}
function modvp(){
	phrasetree.setmean(g("modifyvpboxip1").value,g("modifyvpboxip2").value+"="+g("modifyvpboxip3").value);
	phrasetree.save();

//	var params = "ajax=logeditvp&value="
//			+encodeURIComponent(g("modifyvpboxip1").value+"="+g("modifyvpboxip3").value)+"&log="+encodeURIComponent(g("modifyvpboxip2").value);
//	ajax(params,function(down){});
	hideNb();
	replaceVietphrase();
	$("#modifyvpbox").hide();
	syncvpfile("update");
}
function movemeaning(){
	var mean=g('modifyvpboxip3').value;
	if(mean.indexOf("/")>=0){
		var idx=mean.indexOf("/");
		mean=mean.substring(idx+1)+"/"+mean.substring(0,idx);
		g('modifyvpboxip3').value=mean;
	}
	
}
function movehantomean(){
	g('modifyvpboxip3').value=g("modifyvpboxip2").value;
}
function delvp(){
	if(window.priorvp){
		var vptodel=g("modifyvpboxip1").value;
		if(phrasetree.data[vptodel[0]][vptodel]){
			delete phrasetree.data[vptodel[0]][vptodel];
			phrasetree.save();
		}
	}else{
		var vptodel=g("modifyvpboxip1").value;
		if(vptodel[0] in phrasetree.data && vptodel in phrasetree.data[vptodel[0]]){
				delete phrasetree.data[vptodel[0]][vptodel];
				phrasetree.save();
				location.reload();
		}else{
			//var params = "ajax=logdelvp&value="
			//+encodeURIComponent(g("modifyvpboxip1").value)+"&log="+encodeURIComponent(g("modifyvpboxip2").value+" => "+g("modifyvpboxip3").value);
			//ajax(params,function(down){});
			//	alert("Nghĩa này chỉ tồn tại trên máy chủ và bạn không thể xóa. Đã gửi yêu cầu xóa.");
		}
	}
}
function deleteName(){
	var nametodel=g("addnameboxip1").value;
	namew.value=namew.value.replace(new RegExp("^\\$"+nametodel+"=.*?$", "gm"),"\n");
	saveNS();
}
function copychinese(){
	  var copyText = g("zw");
	  copyText.select();
	  copyText.setSelectionRange(0, 99999);
	  document.execCommand("copy");
}
function googletrans(a){
	 // var win = window.open("https://translate.google.com/?q="+g(a).value+"&view=home&op=translate&sl=zh-CN&tl=en&text=", '_blank');
	//  win.focus();
	googletranslate(g(a).value);
}
function googlesearch(a){
	var win = window.open("https://www.google.com/search?q="+g(a).value, '_blank');
	win && win.focus();
}
function instrans(e){
	if(phrasetree.getmean(e.value)!=""){
		g("instrans").value=phrasetree.getmean(e.value).split("=")[1];
	}
	else
	tse.send("001",e.value,function(){
		g("instrans").value=this.down;
	});
}
function isNameLv2(){
	return (window.setting && (window.setting.allownamev3 || window.setting.allownamev2));
}
function flatArray( array_of_arrays ){ // stack overflow
    if( ! array_of_arrays ){return [];}
    if( ! Array.isArray( array_of_arrays ) ){ return [];}
    if( array_of_arrays.length == 0 ){return [];}
    for( let i = 0 ; i < array_of_arrays.length; i++ ){
        if( ! Array.isArray(array_of_arrays[i]) || array_of_arrays[i].length == 0 ){return [];}
    }
    let outputs = [];
    function permute(arrayOfArrays, whichArray=0, output=""){
        arrayOfArrays[whichArray].forEach((array_element)=>{
            if( whichArray == array_of_arrays.length - 1 ){ 
                outputs.push( output.trim() +" "+ array_element.trim() );
            }
            else{
                permute(arrayOfArrays, whichArray+1, output.trim() +" "+ array_element.trim() );
            }
        });
    }
    permute(array_of_arrays);
    return outputs;
}
function instrans2(e,isfirst){
		
	ajax("sajax=transmulmean&wp=1&content=a"+encodeURIComponent(e.value),function(down){
		var wl = down.split("|");
		var selec=g("addnameboxip2").previousElementSibling;
		selec.innerHTML="";
		var sox;
		for(var i=0;i<wl.length;i++){
			wl[i] = wl[i].split("/");
		}

		var da=flatArray(wl);
		da.forEach(function(e){
			sox=document.createElement("option");
			sox.setAttribute("value",e.trim());
			sox.innerHTML=e.trim();
			selec.appendChild(sox);
		});
		//=document.createElement("option");
		//sox.setAttribute("value",i3.value);
		//sox.innerHTML=i3.value;
		//selec.appendChild(sox);
		
		g("addnameboxip2").value=selec.children[0].value;
		//if(!isfirst)
		//g("addnameboxip2").value=da[0].trim();
	});
	g("addnameboxip3").value=convertohanviets(e.value).replace(/ +/g," ").trim();
	//tse.send("004",e.value,function(){
	//	//g("addnameboxip3").value=this.down.split("=")[0].replace(/ +/g," ").trim();
	//	g("addnameboxip3").value=this.down.split("=")[0].replace(/ +/g," ").trim();
	//	g("addnameboxip3").value=convertohanviets(e.value);
	//});
	googletranslate(e.value,function(d){
		g("addnameboxip4").value=d;
	});
	ajax("sajax=getnamefromdb&name="+encodeURIComponent(e.value.trim()),function(down){
		var da=down.split("/");
		var selec=g("addnameboxip5").previousElementSibling;
		selec.innerHTML="";
		var sox;
		da.forEach(function(e){
			sox=document.createElement("option");
			sox.setAttribute("value",e.trim());
			sox.innerHTML=e.trim();
			selec.appendChild(sox);
		});
		g("addnameboxip5").value=selec.children[0].value;
	});
}
function getTfcoreSuggest(t,f,ft=""){
	if(window.allowtf === false){return;}
	window.allowtf = false;
	var xhttp =  new XMLHttpRequest();
	xhttp.open("POST","https://comic.sangtacvietcdn.xyz/tfcore.php?noucf=true"+ft);
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState==4 && xhttp.status==200){
			f(this.responseText);
			window.allowtf = true;
		}
	}
	xhttp.send(t);
	setTimeout(function(){window.allowtf = true},1000);
}
function getTfcoreNameSuggest(t,f){
	var xhttp =  new XMLHttpRequest();
	xhttp.open("POST","https://comic.sangtacvietcdn.xyz/tfcore.php?isname=true");
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState==4 && xhttp.status==200){
			var s = this.responseText.split(";");
			var o = {};
			s.forEach(function(e){
				var pair = e.split("=");
				o[pair[0]] = pair[1];
			});
			f(o);
		}
	}
	xhttp.send(t);
	setTimeout(function(){window.allowtf = true},1000);
}
function getBingSuggest(t,f,ft=""){
	if(window.allowbg === false){return;}
	window.allowbg = false;
	var xhttp =  new XMLHttpRequest();
	xhttp.open("POST","https://comic.sangtacvietcdn.xyz/tfms.php?noucf=true"+ft);
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState==4 && xhttp.status==200){
			f(this.responseText);
			window.allowbg = true;
		}
	}
	xhttp.send(t);
	setTimeout(function(){window.allowbg = true},1000);
}
function instrans3(e,isfirst){
	ajax("sajax=transmulmean&wp=1&content=a"+encodeURIComponent(e.value),function(down){
		var vptext = [];
		var wl = down.split("|");
		var sox;
		var total = 0;
		for(var i=0;i<wl.length;i++){
			wl[i] = wl[i].split("/");
			total += wl[i].length;
		}
		if(total < 8){
			var da=flatArray(wl);
			da.forEach(function(e){
				vptext.push(e.trim());
			});
		}else{
			wl.forEach(function(e){
				vptext.push(e.join("/"));
			});
		}
		
		g("modifyvpboxip3").value=vptext.join("/");
		g("modifyvpboxip3").setAttribute("rvalue",vptext.join("/"));
		if(wl.length > 1){
			getTfcoreSuggest(e.value,function(sg){
				if(!sg) return;
				g("modifyvpboxip3").value=sg.trim()+"/"+ g("modifyvpboxip3").value;
				g("modifyvpboxip3").setAttribute("rvalue",g("modifyvpboxip3").value);
			});
			getBingSuggest(e.value,function(sg){
				if(!sg) return;
				g("modifyvpboxip3").value=sg.trim()+"/"+ g("modifyvpboxip3").value;
				g("modifyvpboxip3").setAttribute("rvalue",g("modifyvpboxip3").value);
			});
		}
	});
	//tse.send("004",e.value,function(){
	//	g("modifyvpboxip2").value=this.down.split("=")[0].replace(/ +/g," ").trim();
	//});
	g("modifyvpboxip2").value=convertohanviets(e.value).replace(/ +/g," ").trim();
	//if(phrasetree.getmean(e.value)!=""){
	//	g("modifyvpboxip3").value=phrasetree.getmean(e.value).split("=")[1];
	//}
	//else{
		//if(isfirst){
		//	g("modifyvpboxip3").value=g("instrans").value;
		//}
		//g("addnameboxip3").value=convertohanviets(e.value).replace(/ +/g," ").trim();
		//tse.send("001",e.value,function(){
		//	g("modifyvpboxip3").value=this.down.trim();
		//});
	//}
	
}
function removeoddvp(){
	var vp = g("modifyvpboxip3").value;
	g("modifyvpboxip3").value = vp.split("/")[0];
}
function openselectvp(){
	var sel = ui.select();
	sel.proc = function(val){
		g("modifyvpboxip3").value = val;
	}
	var vps = g("modifyvpboxip3").getAttribute("rvalue").split("/");
	for(var i=0; i<vps.length; i++){
		sel.option(vps[i],vps[i]);
	}
	sel.show();
}
var isfirsttimeopennamebox = true;
var isbookmanager = false;
function showAddName(){
	g("addnameboxip1").value=i5.value;
	g("addnameboxip3").value=i2.value;
	instrans2(g("addnameboxip1"),true);
	$("#addnamebox").show();
	if(isfirsttimeopennamebox){
		isfirsttimeopennamebox = false;
		checkIsManager();
	}
	if(isbookmanager){
		g("booknamemanager").removeAttribute("hidden");
		if(store.getItem("issavetobook") == "true"){
			g("issavetobook").checked = true;
		}
	}
}
function checkIsManager(){
	ajax("ajax=defaultbooknaming&sub=ismanager&host="+bookhost+"&bookid="+bookid,function(d){
		if(d=="true"){
			isbookmanager=true;
			g("booknamemanager").removeAttribute("hidden");
			if(store.getItem("issavetobook") == "true"){
				g("issavetobook").checked = true;
			}
		}
	});
}
function addNameToBook(name){
	if(g("issavetobook").checked){
		ajax("ajax=defaultbooknaming&sub=addname&bookid="+bookid
			+"&host="+bookhost
			+"&name="+encodeURIComponent(name),function(){});
	}
}
function addSuperName(type,flag){
	var phr="";
	var nname = "";
	if(type=="el"){
		nname="$"+g("addnameboxip1").value+"="+g("addnameboxip4").value;

	//	namew.value="$"+g("addnameboxip1").value+"="+g("addnameboxip4").value+"\n"+namew.value;
	}else if(type=="hv"){
		if(flag=="a"){
			nname="$"+g("addnameboxip1").value+"="+titleCase(g("addnameboxip3").value);

	//		namew.value="$"+g("addnameboxip1").value+"="+titleCase(g("addnameboxip3").value)+"\n"+namew.value;
		}else if (flag=="z") {
			nname="$"+g("addnameboxip1").value+"="+g("addnameboxip3").value;


	//		namew.value="$"+g("addnameboxip1").value+"="+g("addnameboxip3").value+"\n"+namew.value;
		}else if (flag=="f") {
			phr=g("addnameboxip3").value;
			phr=phr.replace(phr.charAt(0),titleCase(phr.charAt(0)));
			nname="$"+g("addnameboxip1").value+"="+phr;

	//		namew.value="$"+g("addnameboxip1").value+"="+phr+"\n"+namew.value;
		}else if (flag=="l") {
			nname="$"+g("addnameboxip1").value+"="+lowerNLastWord(titleCase(g("addnameboxip3").value),1);

	//		namew.value="$"+g("addnameboxip1").value+"="+lowerNLastWord(titleCase(g("addnameboxip3").value),1)+"\n"+namew.value;
		}
		else if (flag=="s") {
			nname="$"+g("addnameboxip1").value+"="+lowerNLastWord(titleCase(g("addnameboxip3").value),g("addnameboxip1").value.length-2);

	//		namew.value="$"+g("addnameboxip1").value+"="+lowerNLastWord(titleCase(g("addnameboxip3").value),g("addnameboxip1").value.length-2)+"\n"+namew.value;
		}
	}else if (type=="vp") {
		nname="$"+g("addnameboxip1").value+"="+g("addnameboxip2").value;

	// 	namew.value="$"+g("addnameboxip1").value+"="+g("addnameboxip2").value+"\n"+namew.value;
	}
	else if (type=="kn") {
		nname="$"+g("addnameboxip1").value+"="+g("addnameboxip5").value;

	//	namew.value="$"+g("addnameboxip1").value+"="+g("addnameboxip5").value+"\n"+namew.value;
	}
	namew.value=nname +"\n"+namew.value;
	addNameToBook(nname);
	$("#addnamebox").hide();
	saveNS();
	excute();
}
function openmodvp(){
	instrans3(g("zw"),true);
	g("modifyvpboxip1").value=g("zw").value;
	g("modifyvpboxip2").value=i2.value;
	$("#modifyvpbox").show();
}
function convertSenWithGG(s){
	return false;
}
function convertSenWithGG2(node){
	var namedb = {};
	var genname = function(n){
	    var name = Math.random().toString(36).replace(/[^a-z]+/g,"").substr(0,5);
	    var name = n;
	    if(!(name in namedb)){
	    	namedb[name] = n;
	    	return name;
	    }else{
	    	return genname(n);
	    }
	}
	var nd = node;
	var sen = [nd];
	while(nd.isspace(true)){
		nd=nd.nE();
		sen.push(nd);
	}
	nd = node;
	while(nd.isspace(false)){
		nd=nd.pE();
		sen.unshift(nd);
	}
	var t = "";
	for(var i =0 ;i<sen.length;i++){
		if(sen[i].nodeType == 3){
			t += sen[i].textContent;
		}else
		if(sen[i].containName()){
			t += " "+genname(sen[i].textContent)+" ";
		}else{
			var m=sen[i].getAttribute("v");
			var m2 = false;
			if(m){
				m=m.toLowerCase().split("/");
				var h = sen[i].gH();
				var hc = 0;
				for(var c=0;c<m.length;c++){
					if(h == m[c]){
						hc++;
					}
				}
				m2 = hc/m.length > 0.4;
			}
			if(m2){
				t += " "+genname(sen[i].textContent)+" ";
			}else
			t+=sen[i].gT();
		}
	}
	//t = t.replace(/ /g,"").trim();
	googletranslatevi(t,function(s){
		for(var n in namedb){
			var r = new RegExp(n, "gi");
			s = s.replace(r, namedb[n]);

			//console.log(s);
		//	speaker.nextSenText = s;
		}
		mergeWord(sen);
		sen[0].textContent=s;
	});
	console.log(t);
	return t;
}
function googletranslatevi(chi,callb){
	var http = new XMLHttpRequest();
	var url = "https://translate.googleapis.com/translate_a/single?client=gtx&text=&sl=zh-CN&tl=vi&dt=t&q=" + encodeURI(chi);
	http.open('GET', url, true);
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			callb(JSON.parse(this.responseText)[0][0][0]);
		}
	}
	http.send();
}
function getNodeIndex(nodeid){
	if(nodeid[0] == "r"){
		return parseInt(nodeid.substring(3));
	}else if(nodeid[0]=="e"){
		return parseInt(nodeid.substring(5));
	}
	return 0;
}
function TFCoreLn(nodes){
	//return;
	var chi="";
	var sortedNodes = [];
	for(var i=0; i<nodes.length; i++){
		if(nodes[i].push){
			var subarr = nodes.splice(i,1)[0];
			for(var j=0; j<subarr.length; j++){
				nodes.splice(i,0,subarr[j]);
			}
		}
		//chi += nodes[i].gT();
		sortedNodes.push({
			key: getNodeIndex(nodes[i].id),
			txt: nodes[i].gT()
		});
	}
	sortedNodes.sort(function(a,b){ return a.key - b.key; });
	for (var i = 0; i<sortedNodes.length;i++){
		chi += sortedNodes[i].txt;
	}
	mergeWord(nodes);
	if(chi.length < 3){
		return;
	}
	var http = new XMLHttpRequest();
	var url = "https://comic.sangtacvietcdn.xyz/tfcore.php?isln=true";
	http.open('POST', url, true);
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var t = http.responseText;
			
			nodes[0].setAttribute("t",chi);
			nodes[0].setAttribute("vi",t);
			if(isUppercase(nodes)){
				nodes[0].textContent = ucFirst(t.trim());
			}
			else nodes[0].textContent = t.trim();
		}
	}
	http.send(chi);
}
function TFCoreTranslate(node){
	var text ="";
	var c = g(contentcontainer).childNodes;
	var namemap = {};
	function toSlug(str) {
		str = str.toLowerCase();
		str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		str = str.replace(/[đĐ]/g, 'd');
		str = str.replace(/([^0-9a-z-\s])/g, '');
		str = str.replace(/(\s+)/g, '');
		return str;
	}
	function mapName(name,chi){
		var sname = toSlug(name);
		//if(sname.split(" ").length > 2){
		//	sname = sname.replace(/ +/g, "");
		//}
		sname = titleCase(sname);
		namemap[sname] = chi;
		return sname;
	}
	for(var i=0;i<c.length;i++){
		if(c[i].tagName=="BR"){
			text += "\n";
		}
		if(c[i].nodeType == 3){
			text += c[i].textContent.trim();
		}
		if(c[i].tagName=="I"){
			if(c[i].containName()){
				text += mapName(c[i].textContent,c[i].gT());
			}else
			text += c[i].gT();
		}
	}
	console.log(namemap);
	TFInit.fromString(text,function(e){
		e.transform();
		var tfm = e.getText();
		for(var name in namemap){
			var r = new RegExp(name, "gi");
			tfm = tfm.replace(r, namemap[name]);
		}
		ajax("ajax=trans&content="+encodeURIComponent(tfm),function(e){
			g(contentcontainer).innerHTML =preprocess(e.substring(1));
			applyNodeList();
			excute();
		});
	});
}
function TFCoreTranslatePage(){
	var text ="";
	var c = g(contentcontainer).children;
	var namemap = {};
	function toSlug(str) {
		str = str.toLowerCase();
		str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		str = str.replace(/[đĐ]/g, 'd');
		str = str.replace(/([^0-9a-z-\s])/g, '');
		str = str.replace(/(\s+)/g, '');
		return str;
	}
	var sens = [];
	function mapName(name,chi){
		var sname = toSlug(name);
		sname = titleCase(sname);
		namemap[sname] = chi+" ";
		return sname+" ";
	}
    function unMapName(chi){
        for(var n in namemap){
            chi =chi.replace(new RegExp(n,"g"),namemap[n]);
        }
        return chi;
    }
	function getSen(node){
		while(node.pE() && node.pE().tagName !="BR"){
            node = node.pE();
        }
        var sen = {
            text: node.cn,
            start: node.id,
            end: null
        };
        while(node.nextElementSibling && node.nextElementSibling.tagName !="BR"){
            node = node.nextSibling;
            if(node.tagName=="I" && node.containName()){
                sen.text += mapName(node.textContent,node.textContent);
            }else if(node.nodeType==3){
                sen.text += node.textContent.trim();
            }else{
                sen.text+=node.cn;
            }
        }
        if(sen.text.length > 3){
            sen.end = node.id;
            return sen;
        }
        return false;
	}
    function setSen(sen){
        var node = g(sen.start);
        var base = node;
        while(node.nextSibling && node.nextSibling.id!= sen.end){
        	if(node.nextSibling.tagName == "I"){
            	base.cn+=node.nextSibling.cn;
            }else{
            	base.cn+=node.nextSibling.textContent;
            }
            node.nextSibling.remove();
        }
        g(sen.end).remove();
        base.textContent = ucFirst(unMapName(sen.trans));
        base.setAttribute("t",base.cn);
    }
    var criteria = /[的]/;
	for(var i=0;i<c.length;i++){
		if(c[i].tagName=="I"){
			if(criteria.test(c[i].cn)){
                var sen = getSen(c[i]);
                if(sen){
                    sens.push(sen);
                    text+=sen.text+"\n\n";
                    for(;i<c.length;i++){
                        if(c[i].id == sen.end){
                            i++;
                            break;
                        }
                    }
                }
            }
		}
	}
	console.log(namemap);
	var xhttp =  new XMLHttpRequest();
    xhttp.open("POST","https://comic.sangtacvietcdn.xyz/tfcore.php?tonly=true");
    xhttp.onreadystatechange = function(){
        if(xhttp.readyState==4 && xhttp.status==200){
            var ss = xhttp.responseText.split("\n\n");
            for(var i=0;i<sens.length;i++){
                sens[i].trans = ss[i].trim();
                setSen(sens[i]);
            }
        }
    }
    xhttp.send(text);
}
function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }
function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var Dictionary = function () {function Dictionary(name,w,t) {
    var load = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    _classCallCheck(this, Dictionary);
    _defineProperty(this, "name", "");
    this.name = name;
    var ls = t.split(",");
    for (var i=0;i<ls.length;i++) {
    	this[ls[i].substring(0,w)]=parseInt(ls[i].substring(2));
    }
  }
  _createClass(Dictionary, [{
    key: "index",
    value: function index(key) {
      if (this[key]) {
        this[key]++;
      } else {
        this[key] = 1;
      }
    }
  }, {
    key: "toArray",
    value: function toArray() {
      var l = [];
      for (var k in this) {
        if (this[k] > 3) {
          l.push({
            char: k,
            count: this[k]
          });
        }
      }
      return l;
    }
  }, {
    key: "isPopular",
    value: function isPopular(t) {
      var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
      return this[t] > level;
    }
  }, {
    key: "allIsPopular",
    value: function allIsPopular(t) {
      var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

      for (var i = 0; i < t.length; i++) {
        if (!this.isPopular(t[i], level)) {
          return false;
        }
      }
      return true;
    }
  }]);
  return Dictionary;
}();
var ichar2=new Dictionary("2char",2,"东方158,欧阳136,南宫115,慕容101,上官85,阴阳72,西门67,独孤65,公孙62,星辰56,五行55,天魔53,黄金52,太阳52,九天50,黑暗48,混沌46,纳兰46,金刚43,不死43,生死41,幽冥41,死亡41,无极40,先天39,天地39,玄天38,通天38,宇文38,火焰37,乾坤34,光明34,皇甫34,玄冰33,轩辕33,九幽33,寒冰33,无量32,百里32,诸葛31,虚空30,端木30,百花29,风雷28,李天27,七星26,修罗26,烈阳26,黑龙26,青云26,地狱25,风云25,太古25,杀戮25,玄阴25,太阴25,混元24,空间24,琉璃24,造化24,凤凰24,玄武23,白骨23,上古23,金光23,夏侯23,天龙22,九龙22,火灵22,大日22,青木22,黄泉22,北冥22,万年21,生命21,如意21,日月21,火云21,天雷20,轮回20,九阴20,大罗20,天机20,太上20,烈火20,天剑20,楚天20,不灭19,永恒19,十二19,吞天19,八卦19,火龙19,烈焰19,十三19,地心19,大力19,天云19,太虚19,朱雀19,流云19,白玉19,魔龙19,霹雳19,大地19,长生19,七彩18,逆天18,天绝18,灵魂18,碧水18,青龙18,张大18,花玉18,玲珑17,阴风17,冰火17,天星17,天河17,天罡17,完颜17,吞噬17,无影17,阿尔17,飞龙17,令狐17,后天17,张小17,王大17,罗天17,王天17,裂天16,元气16,三眼16,明月16,天元16,风之16,世界16,十八16,焚天16,水月16,疾风16,白虎16,羽化16,虚无16,暗影16,清风16,叶天16,紫金15,万剑15,九转15,莲花15,黑魔15,冰雪15,纯阳15,大荒15,魔神15,毁灭15,爆炎15,落日15,万魔15,南宮15,森罗15,张天15,拓跋15,李小15,王小15,真龙14,灵蛇14,亡灵14,天灵14,六合14,双头14,飞天14,天香14,恶魔14,闪电14,潜龙14,玉女14,擎天14,青莲14,云天14,天蓝14,天风14,暴风14,林小14,澹台14,黄天14,叶小14,慕星14,李云14,李玉14,白素14,罗淑14,天神13,万古13,三千13,麒麟13,大天13,伏魔13,精灵13,千年13,嗜血13,九头13,流星13,天之13,天玄13,太极13,太玄13,天道13,无间13,魔法13,水晶13,神之13,血神13,大圣13,凌天13,圣灵13,天外13,血煞13,李玄13,李若13,杨天13,林雨13,赵无13,黑风13,桃花12,化龙12,上清12,九曲12,大手12,九霄12,五色12,夺命12,冰魄12,炼神12,天火12,山河12,幻影12,旋风12,月华12,洪荒12,真灵12,通灵12,金毛12,远古12,欢喜12,风火12,飘渺12,天一12,天心12,天涯12,天罗12,方天12,神圣12,赫连12,刘大12,唐天12,张文12,张正12,李大12,江不12,王青12,马小12,血魔11,至尊11,冰霜11,青灵11,七绝11,万象11,三星11,不动11,大世11,神龙11,金龙11,九阳11,云霄11,昊天11,逍遥11,离火11,水灵11,仙道11,元神11,八荒11,破灭11,周天11,神剑11,炼气11,开天11,如来11,星空11,真元11,破天11,天妖11,烈日11,独角11,蜘蛛11,碧落11,苍穹11,龙虎11,黄沙11,东皇11,冰封11,冰灵11,土之11,天王11,天鹰11,星云11,海王11,火之11,银月11,黑煞11,周大11,孙小11,张国11,张子11,李青11,林云11,林子11,石天11,天海10,震天10,万灵10,暗黑10,天仙10,噬魂10,九重10,凌云10,炼器10,五彩10,破空10,炼魂10,佣兵10,战神10,噬灵10,天人10,太清10,星河10,公羊10,赤火10,水火10,玄冥10,镇魔10,紫焰10,紫电10,弑神10,遮天10,蓝天10,铁甲10,青天10,黑水10,三绝10,九尾10,元灵10,华天10,天阴10,无名10,梦幻10,灵兽10,白云10,白马10,白龙10,精神10,血云10,金之10,长孙10,陈玉10,鬼王10,孙大10,李明10,王一10,苏紫10,陈大10,五雷9,灭魂9,万妖9,万鬼9,三阴9,金身9,中央9,九九9,九叶9,九州9,云雾9,圣龙9,宇宙9,大帝9,狂风9,第一9,天山9,天空9,天阶9,子母9,龙爪9,巨灵9,无双9,暗夜9,枯木9,海天9,涅盘9,炼狱9,焚心9,赤血9,地龙9,玄黄9,百毒9,神魔9,铸剑9,鬼神9,金色9,须弥9,黑色9,万宝9,云梦9,吸血9,天都9,奥尔9,御兽9,摄魂9,死神9,破云9,血魂9,金玉9,阿里9,雪月9,雷云9,风雪9,飞鹰9,骷髅9,龙血9,刘天9,张晓9,张玉9,李元9,李文9,李清9,杨小9,林天9,王志9,王文9,聂风9,贺一9,陆小9,陈国9,陈天9,陈家9,天狼8,木灵8,张无8,开山8,飞云8,柳如8,一气8,穿心8,万化8,万物8,蛮荒8,三阳8,地灵8,封魔8,凌霄8,九星8,五星8,爆裂8,功德8,六道8,冰晶8,化血8,千里8,原始8,天下8,十字8,兽武8,元磁8,大悲8,大衍8,星星8,天尸8,千幻8,江山8,无上8,春秋8,波罗8,清心8,灵光8,熔岩8,猛虎8,白色8,黄龙8,百兽8,神行8,惊天8,穿山8,三花8,月光8,繁星8,赤炎8,金蛇8,金银8,阿拉8,火神8,龙象8,上品8,云中8,光辉8,冰魂8,化形8,化神8,南方8,天命8,天杀8,太平8,太白8,奔雷8,寂灭8,尉迟8,弗拉8,御命8,惊龙8,拓拔8,断魂8,木之8,林中8,混乱8,清虚8,灵武8,玉清8,真武8,紫色8,蓝色8,血灵8,西方8,雷霆8,黄小8,黑云8,刘明8,孙晓8,李子8,李道8,李长8,杨玉8,林若8,林雪8,柳云8,楚云8,秦天8,萧天8,袁礼8,赵大8,陈小8,马天8,龙天8,赵志7,心魔7,销魂7,筑基7,灭世7,万兽7,不朽7,重生7,御剑7,乙木7,凤舞7,转轮7,回天7,炼丹7,万里7,云海7,人族7,圣光7,游龙7,八方7,双翼7,六阳7,封神7,分神7,青冥7,连环7,十方7,追魂7,天才7,雷电7,四象7,圣天7,地煞7,第二7,自然7,天师7,天狐7,天蓬7,太一7,红莲7,天月7,龙凤7,霸天7,归一7,心灵7,龙蛇7,毒龙7,灵犀7,烟雨7,牛魔7,落叶7,玄元7,魔焰7,白眉7,碧玉7,碧眼7,血光7,铁拳7,铁血7,洞天7,化魂7,鸿蒙7,黑狱7,黑神7,龙之7,三足7,丹武7,丹青7,云之7,五龙7,克拉7,冥王7,凌大7,卡拉7,吴大7,大夏7,天晶7,天武7,天青7,山海7,布雷7,幻灵7,归元7,徐大7,恨天7,摘星7,摩罗7,斩龙7,无空7,星月7,暗月7,東方7,林大7,死灵7,水之7,沧澜7,浮云7,王者7,电之7,白莲7,百草7,神风7,紫光7,紫竹7,纪元7,罗刹7,聚灵7,腾龙7,药王7,菩提7,血杀7,赤炼7,赤阳7,起源7,道之7,铁背7,长空7,闻人7,降魔7,雷之7,飞仙7,齐天7,刘玉7,北堂7,叶君7,周长7,宋玉7,张云7,张志7,彩虹7,慕铁7,慕青7,方小7,朱高7,杨大7,林佳7,林婉7,林玉7,林雅7,江清7,淳于7,王子7,王德7,田中7,申屠7,罗小7,胡小7,苏大7,苏文7,苏明7,金凤7,陈明7,雷天7,风无7,黄大7,龙雪7,赵天6,玄阳6,血海6,亘古6,小天6,大仙6,绝杀6,万仙6,炼体6,万法6,三头6,两仪6,九宫6,魔女6,山岳6,九仙6,明王6,五毒6,诛魔6,圣人6,修真6,绝天6,屠龙6,克里6,游身6,中天6,分身6,大魔6,冰月6,冰蓝6,北极6,万毒6,雷神6,碎星6,英雄6,碎空6,灭魔6,大金6,第五6,第四6,猎魔6,天蛇6,天音6,太乙6,太皇6,夺天6,孔雀6,寒铁6,封灵6,小千6,翠玉6,雪玉6,升龙6,慈航6,撼天6,无情6,真气6,雷光6,狮子6,旭日6,易天6,易筋6,无生6,末日6,金木6,水龙6,神魂6,海龙6,海无6,渡劫6,幽灵6,狂狮6,玄妙6,玄火6,白金6,皇天6,盘古6,真空6,碧海6,乾元6,神威6,紫极6,紫虚6,红色6,蓝银6,苍天6,苍龙6,药师6,葵水6,蜀山6,摩诃6,血色6,血龙6,诛神6,流光6,道玄6,都天6,金翅6,金角6,金阳6,风雨6,王家6,金甲6,阳明6,阿斯6,降龙6,雪花6,水云6,七大6,万佛6,万神6,万花6,乌兰6,亡魂6,人道6,人面6,傲天6,兽人6,刀锋6,剑道6,北宫6,千手6,卡斯6,君大6,多宝6,天罚6,太素6,婆罗6,安德6,定海6,布拉6,幽影6,张三6,彼岸6,德尔6,忘忧6,斑斓6,斯坦6,无为6,无字6,星罗6,月亮6,望月6,朝阳6,李老6,水元6,洛神6,火炎6,火行6,灭神6,灵宝6,爱丽6,爱尔6,玄水6,玄魔6,玉皇6,玉龙6,王道6,白雪6,百灵6,碧血6,神木6,紫云6,红云6,绝情6,自由6,荣耀6,落霞6,蓬莱6,螺旋6,血剑6,诛仙6,阴影6,雷鸣6,青城6,青衣6,鬼影6,魔灵6,黑石6,龙鳞6,何大6,凌二6,刘正6,刘海6,剑神6,古剑6,周子6,周小6,唐小6,圣皇6,夜叉6,孙玉6,小白6,张丽6,徐子6,慕天6,方剑6,望天6,木青6,李光6,李德6,李志6,李思6,李晓6,李梦6,李美6,杜云6,林二6,林晓6,林清6,林青6,水漫6,燕无6,牛大6,王国6,王老6,王长6,白天6,白无6,白清6,碧云6,第六6,罗云6,胡天6,花无6,苏雪6,莫天6,萧大6,补天6,裂山6,贾文6,赵子6,赵飞6,柳青5,磐石5,龙魔5,梧桐5,圣魔5,一元5,一刀5,七叶5,龙渊5,七重5,同心5,锁魂5,三尾5,三才5,三神5,八宝5,神灵5,风神5,东西5,修仙5,封天5,天辰5,九玄5,九鼎5,紫雷5,迷幻5,罗汉5,雷音5,众星5,元始5,曼陀5,八仙5,镇海5,戮仙5,真魔5,冥神5,龙须5,碧蓝5,水雾5,四神5,三叠5,炎龙5,地阶5,天巫5,龙战5,大江5,大灭5,大自5,众生5,傀儡5,天毒5,天水5,禁魔5,天荒5,化灵5,鸳鸯5,大明5,少林5,山地5,咆哮5,崩山5,裂地5,布兰5,帝王5,幻阴5,广寒5,弥罗5,拈花5,破虚5,斯塔5,无畏5,雷帝5,暴雨5,飓风5,波动5,极阴5,格拉5,残血5,九月5,幽魂5,江振5,洗髓5,浩然5,深海5,清明5,燕子5,牛头5,控水5,九灵5,玄明5,玄灵5,玄都5,百合5,玄铁5,石中5,金睛5,神霄5,神魄5,紫晶5,紫玉5,神雷5,灭天5,罪恶5,飞升5,翻云5,黑金5,苍莽5,血晶5,赤明5,赤焰5,紫阳5,弥陀5,拉斯5,金丝5,金云5,金沙5,大鹏5,幻魔5,阿克5,铁羽5,骑士5,锦绣5,长庚5,博尔5,陨星5,冒险5,风灵5,风龙5,飘云5,飞星5,黑白5,黑铁5,狼牙5,龙吟5,龙形5,七玄5,万魂5,不老5,东华5,东海5,九彩5,云龙5,仙人5,仙灵5,光之5,八大5,兽神5,兽魂5,冰雷5,凝血5,出窍5,刑天5,北方5,南天5,古月5,叶大5,叶子5,合体5,吉祥5,君老5,唐老5,噬血5,圣王5,地火5,地行5,大周5,大成5,大灵5,大道5,天堂5,天寒5,天羽5,太史5,妖丹5,妖魔5,审判5,少炎5,左手5,巨龙5,幻之5,幽月5,影子5,徐老5,御风5,心剑5,惊云5,战天5,执法5,新月5,方正5,日耀5,暴雷5,暴龙5,曹天5,月影5,月神5,极道5,格斗5,海神5,深渊5,混天5,清灵5,源天5,濮阳5,灭绝5,灵眼5,玉面5,王少5,琳琅5,璇玑5,电雷5,疯魔5,白灵5,白衣5,白银5,白鹤5,白鹭5,白鹿5,盘龙5,神机5,科尔5,空灵5,精元5,素女5,紫月5,紫罗5,紫霞5,红发5,红粉5,练体5,翡翠5,荆棘5,莫利5,莫少5,萨尔5,藏剑5,藏星5,虚天5,蝴蝶5,蟠龙5,血衣5,贺兰5,赤色5,超级5,迷雾5,道德5,遗忘5,金元5,金大5,金眼5,金石5,铁木5,银翼5,随风5,隐龙5,雷公5,青丘5,预言5,风月5,风流5,魔天5,魔幻5,魔王5,黄云5,黑天5,黑烟5,黑虎5,龙神5,于文5,冷无5,凌三5,刘一5,刘小5,刘建5,刘志5,刘文5,刘晓5,华小5,卫天5,古天5,叶孤5,叶无5,君莫5,周文5,夜无5,天运5,太叔5,奉天5,姬长5,安小5,张伯5,张德5,张明5,张春5,张泽5,方文5,李修5,李冰5,李少5,李慕5,李成5,李铁5,林文5,林震5,殷无5,水千5,水无5,江天5,江浩5,法拉5,火麟5,炼妖5,燕赤5,玄兵5,玉无5,王光5,王守5,王明5,王晓5,王铁5,田不5,田大5,白世5,白子5,白秀5,秦小5,秦明5,第七5,罗大5,罗浮5,聂青5,胡一5,胡青5,苏小5,苏青5,莫小5,萧玉5,谢小5,賈玉5,贾玉5,赵世5,赵光5,赵明5,赵晓5,赵若5,赵雅5,达奚5,鉴宝5,铁中5,镇妖5,镇魂5,陆大5,陈子5,陈思5,陈晓5,雪莲5,雷震5,韩小5,马元5,齐云5,子午4,金钱4,秦雪4,冷凝4,王丽4,雷狱4,君天4,一剑4,九元4,一线4,七转4,迷踪4,鬼灵4,万恶4,夺神4,莲心4,三叶4,三山4,毒火4,三色4,蛮牛4,锻体4,上天4,自在4,南北4,两极4,乌云4,乌金4,九劫4,龙元4,灵凤4,社稷4,九方4,试炼4,困魔4,九蛇4,天阳4,还魂4,蛇形4,金花4,真火4,五转4,紫血4,倚天4,元素4,召唤4,紫气4,克莱4,金晶4,破魔4,寒光4,神话4,潮汐4,杀人4,千影4,千金4,华夏4,水妖4,四翅4,无形4,圣域4,生灵4,埃尔4,大光4,阴魔4,大陆4,大龙4,天南4,杀生4,天穹4,天门4,天魂4,融血4,至阳4,帝皇4,荒芜4,太黄4,奥斯4,祖神4,小周4,小龙4,巨魔4,金乌4,食人4,巫妖4,神女4,萨布4,风大4,玄女4,幻音4,千变4,弱水4,天邪4,大宗4,皇太4,拉尔4,摩云4,斯科4,无我4,星龙4,无色4,无骨4,山水4,星斗4,星衍4,梨花4,龙宫4,极乐4,特丽4,绝世4,剑魂4,江南4,破浪4,沧海4,证道4,碎玉4,崩天4,精英4,龙王4,断肠4,狮王4,狩猎4,神水4,玄花4,玉虚4,现在4,珈蓝4,鹰爪4,百幻4,百脉4,飘香4,兽王4,碎骨4,雷火4,玄凤4,定星4,精金4,真雷4,紫川4,紫心4,紫纹4,纯阴4,回旋4,绿水4,五光4,乱舞4,屠仙4,至高4,小金4,蓝山4,封印4,血月4,赤水4,脱胎4,达拉4,过去4,迎风4,罗生4,逐鹿4,重水4,金冠4,金戈4,龙阳4,金钟4,金风4,神天4,长江4,雾云4,阴魂4,阿特4,雷龙4,青竹4,游天4,流火4,擒龙4,飞灵4,爆炸4,高级4,聚元4,圣土4,麦克4,黑曜4,黑焰4,玄煞4,黑甲4,龙纹4,七剑4,七杀4,七龙4,万龙4,三清4,下品4,不败4,东南4,两界4,中品4,九大4,九字4,云岚4,云莱4,云雨4,云霞4,人鱼4,仙女4,佛门4,元婴4,克罗4,冰之4,冰海4,冰玉4,凌晨4,凌波4,凝元4,凝神4,刹那4,勿道4,化蛟4,化骨4,北山4,北海4,北灵4,十九4,半神4,南荒4,卡布4,卡特4,卡米4,卧龙4,合欢4,听风4,吴天4,呼延4,哈尔4,唐大4,四大4,四方4,四极4,四灵4,圆月4,土行4,地级4,埃斯4,域外4,大乘4,大乾4,大安4,大梦4,大河4,大海4,大清4,大雷4,天威4,天尘4,天帝4,天残4,天煞4,天蝉4,天象4,天马4,太元4,奇迹4,妖兽4,妖皇4,妖精4,始祖4,宇天4,寒霜4,小三4,岩浆4,岩石4,左丘4,巫天4,布罗4,希尔4,庞大4,张老4,强大4,往生4,忘情4,忠义4,恒宇4,悬浮4,惊涛4,惊雷4,手三4,抱元4,拉克4,控火4,文子4,斗战4,斩神4,断刃4,断龙4,斯图4,斯特4,旅者4,无限4,明心4,明日4,暗之4,月灵4,月舞4,木神4,本源4,朱元4,极品4,林老4,枯荣4,柳生4,永生4,汉月4,法神4,波尔4,泣血4,洛老4,流水4,浩渺4,浮屠4,浮空4,海之4,海妖4,滴血4,火山4,灵元4,灵动4,灵山4,灵界4,烽火4,狂暴4,玄机4,玄重4,瑶池4,登天4,白水4,百变4,真神4,破军4,神月4,神枪4,神虚4,神道4,神鹰4,离天4,离恨4,秘法4,秩序4,米特4,紫宵4,紫府4,紫清4,紫火4,紫背4,紫莲4,紫龙4,红尘4,缚龙4,缩地4,聚气4,草剃4,莫尔4,莱茵4,萧秋4,萨拉4,蓝光4,蓝月4,蓝梦4,藏天4,虚神4,蛇行4,蝶舞4,血影4,血河4,血炎4,血纹4,血莲4,赤月4,赤金4,赵小4,转生4,辉煌4,辟邪4,达克4,迷失4,追风4,邪灵4,邪魔4,郭老4,金叶4,金莲4,钟离4,长春4,问天4,阎王4,阎罗4,阿德4,雪山4,雪魔4,雷灵4,雾海4,青元4,青山4,青石4,风暴4,魔血4,魔鬼4,黄埔4,黄昏4,黄风4,黑袍4,黑鹞4,龙力4,龙灵4,龟息4,乱魔4,云若4,云青4,云风4,人间4,任东4,任天4,任青4,何丽4,何国4,余子4,俞小4,傅君4,公子4,养魂4,冯大4,冯小4,冰心4,凌若4,刀疤4,刘世4,刘伯4,刘光4,刘定4,刘德4,刘梦4,刘浩4,刘雪4,华云4,卡西4,古苍4,叶凌4,叶剑4,叶如4,叶玉4,叶轻4,叶长4,向之4,君子4,君无4,吴文4,周剑4,周芷4,唐云4,唐文4,大刀4,大剑4,太和4,姜天4,姬云4,姬天4,孟士4,宇无4,宋天4,宋文4,寒月4,小灵4,小石4,小青4,岳子4,左千4,巴图4,巴尔4,张东4,张二4,张仲4,张学4,张宇4,张少4,张振4,张海4,张清4,张百4,张秀4,张远4,张道4,徐世4,徐元4,徐文4,徐晓4,徐若4,徐青4,御灵4,怒蛟4,悬空4,慕玄4,慕飞4,扶桑4,捆仙4,斩天4,方令4,方大4,方如4,易大4,星神4,月天4,朝天4,木婉4,朱大4,朱子4,李一4,李三4,李世4,李东4,李乐4,李仲4,李剑4,李向4,李嘉4,李存4,李宗4,李家4,李师4,李建4,李忠4,李昌4,李易4,李武4,李爱4,李秋4,李红4,李飞4,杜文4,杜月4,杨如4,杨子4,杨崇4,杨明4,林一4,林元4,林冰4,林君4,林如4,林明4,林月4,林生4,林素4,林芷4,林远4,林长4,林飞4,柳嫣4,柳寒4,柳河4,柳清4,柳玉4,栖凤4,段小4,殷天4,水天4,水梦4,水若4,江小4,沉希4,海云4,海蓝4,滕永4,灵药4,灵鹫4,烈随4,牧野4,玉斩4,王世4,王建4,王泽4,王雪4,珍宝4,甘沐4,申建4,白君4,白小4,白文4,白景4,石头4,碧鳞4,秋水4,秦慕4,秦月4,程英4,红月4,花丽4,花大4,花月4,花瑷4,苏远4,苏雨4,荀天4,荆小4,萧子4,萧远4,萧风4,落魂4,蒋云4,血狼4,许明4,谢文4,谢晓4,谢灵4,谢玉4,贺丽4,贺子4,赵一4,赵丽4,赵公4,赵匡4,赵半4,赵国4,赵师4,赵德4,赵成4,迪卡4,郭云4,郭大4,郭子4,郭小4,金太4,金林4,钟无4,铁剑4,铁壁4,闪雷4,阴天4,阴无4,陆天4,陆子4,陆文4,陆老4,陈光4,陈凤4,陈友4,陈怡4,陈文4,陈春4,陈正4,陈永4,陈海4,陈淑4,雨师4,青光4,青岩4,韩玉4,项天4,顾大4,顾长4,风卷4,风行4,飘雪4,马晓4,马玉4,高天4,魏明4,魔拳4,魔礼4,黄建4,黄文4,黎明4,黑皇4,龙无4,龙玉4");
var ichar3=new Dictionary("3char",1,"天1815,大1054,神849,之811,李750,王679,小652,灵639,云625,龙613,林562,剑552,张548,玉525,魔514,金507,无440,青427,风411,仙410,白398,罗377,陈371,星362,月338,赵338,叶334,元319,道319,真314,雷314,文311,玄305,水304,血302,方300,海299,黄297,阳293,刘289,老284,圣284,周283,明281,火278,山276,杨270,雪265,子265,万257,一244,清241,黑236,公236,花233,冰232,东231,柳230,飞227,紫222,三219,心219,秦218,苏217,萧216,孙215,九210,古209,马203,长197,千196,铁192,石192,西192,魂189,凌189,帝185,太184,江182,唐180,师178,木175,尔174,世173,宝173,红172,光172,雨166,华166,德166,南165,朱165,楚159,斯157,皇156,莫156,武155,慕154,寒153,百152,兰152,阴151,若149,凤149,安146,中144,妖143,徐142,何141,战141,蓝141,地141,梦140,克140,晓140,如137,不136,高136,法135,吴135,君133,拉133,宋131,夏129,谢127,人126,少125,丽125,卡124,陆124,沈123,鬼123,阿123,七116,韩116,化115,国114,里114,家113,丹112,齐112,胡111,空110,气109,上107,杜107,五105,志105,成104,正103,洛103,北102,碧102,郭102,苍100,先99,生99,秋98,郑97,欧97,程97,八96,香96,赤95,刀94,破94,思94,四93,许93,田92,雅91,学91,烈91,伯91,幽91,顾91,燕91,夜90,美90,特90,宫89,建88,门88,女87,洪86,二86,秀86,银85,巴83,梅83,宇83,余83,奥82,莲81,钟81,冷80,永80,卫80,春80,纳80,孟80,虎79,连78,炎78,蛇77,炼77,行77,易77,流77,影77,布77,浩76,日76,落76,达76,羽76,邪75,夫75,于75,魏75,宗74,巨74,素74,十73,格73,梁72,冥71,凝70,毒70,吕70,姜70,杀69,沙69,虚69,书69,前69,乌69,精69,极68,平68,钱67,六67,米67,尊66,绝66,远66,容66,孤65,双65,骨65,幻65,袁65,修64,英64,宁64,菲64,丁64,维64,向64,死63,御63,镇63,姬63,贺61,贾60,灭60,晶60,伊60,狼59,曹59,莉59,兽59,瑞59,左59,通58,药58,迪58,焰58,烟57,亚57,姑57,波57,岳57,惊56,力56,河56,有55,尼55,薛55,重54,佛54,婉54,任54,贝53,利52,裂52,多52,福52,范52,轻51,鲁51,葛51,静51,震51,严51,离50,意50,狂50,霍50,竹50,侯50,爱50,冯50,傲49,莱49,淑49,乐49,定48,鹰48,温48,希48,逸47,辰47,穆47,孔47,牛47,蔡47,秘46,暗46,商45,新45,佳45,舞45,彩45,翠45,独44,墨44,博44,官44,藏44,振44,妙43,归43,卓43,斗43,军43,祖43,谷43,熊43,望43,回43,可42,承42,纪42,摩42,图42,黎42,断42,封42,开42,傅42,土42,依41,慧41,狐41,翼41,景41,塔41,霸40,应40,森40,斩40,腾40,加40,仲40,鸿40,屠39,狮39,吉39,乾39,诺39,奇39,丝39,常39,厉39,都39,凯39,鸣39,问38,章38,诗38,和38,至38,符38,荒38,比38,立38,欣37,混37,焚37,电37,科37,泽37,耀37,汉37,关37,知37,庆37,令36,洞36,合36,浮36,叔36,鹤36,哥36,庄36,董36,路35,松35,雾35,泰35,甲35,角35,颜35,头34,嘉34,玲34,音34,史34,哈34,源34,赫34,笑34,原34,殷34,崔34,汪34,邓34,威33,童33,聚33,得33,噬33,煞33,俊33,堂33,字33,兴33,岩33,廖33,曼32,伦32,暴32,尚32,普32,旋32,纹32,步32,怀32,启32,段32,辛32,轮31,聂31,经31,鱼31,苗31,吞30,机30,巫30,绿30,琴30,轩30,芷30,霞30,露30,乔30,锦30,半29,尘29,尸29,胜29,境29,初29,后29,芙29,帕29,杰29,兄29,倩29,来29,裴29,姚29,费29,賈29,守28,祝28,残28,阵28,凰28,飘28,游28,联28,士28,管28,城28,索28,申28,萨28,艳28,毛28,沐28,琳27,罡27,妮27,树27,桃27,散27,渊27,功27,蛟27,草27,虹27,隐27,霄27,爆27,项27,朝27,霜27,桑27,忠27,展27,陶27,念26,全26,乱26,嫣26,鹏26,贤26,戴26,曲26,拓26,尤25,巧25,语25,护25,沉25,逆25,智25,碎25,啸25,婷25,器25,亦25,雁25,伟24,艾24,追24,湘24,集24,折24,锁24,阎24,隆24,命24,拳24,恒24,恩24,黛24,昊24,牙24,珍24,自24,尾24,鳞24,馨24,蒙24,荣24,伏24,韦24,教23,盘23,掌23,蛮23,诸23,鼎23,分23,微23,刚23,界23,身23,本23,第23,端23,昌23,俞23,麦23,柯23,潘23,衣22,瑶22,甫22,赛22,冲22,主22,劫22,兵22,魄22,言22,贵22,仁22,象22,玛22,桂22,坦22,敬22,义22,崇22,晨22,鹿22,施22,阮22,妹21,靖21,枪21,禁21,锋21,铜21,解21,满21,凡21,手21,芳21,体21,广21,包21,蒂21,沧21,非21,藤21,昭21,宏21,毕21,惜20,名20,情20,同20,部20,琉20,强20,弥20,爷20,圆20,观20,闪20,塞20,泉20,形20,蕾20,富20,眼20,舒20,康20,薇20,喜20,闻20,張20,彭20,佩19,倾19,谭19,池19,怡19,坤19,别19,密19,超19,逐19,陵19,雄19,在19,酒19,皓19,列19,陀19,继19,冬19,柏19,庞19,狱18,迷18,寻18,印18,域18,穿18,造18,怒18,为18,柔18,蟒18,蝎18,亲18,瓦18,晴18,映18,庭18,礼18,临18,羊18,邵18,采18,彦18,麟18,醉18,枫18,蒋18,邹18,楼17,夺17,悠17,敏17,还17,禅17,骑17,猎17,琼17,季17,恶17,惠17,旭17,盈17,咏17,媚17,猿17,牧17,廷17,甘17,查17,丘17,越17,含17,雀17,善17,养17,奉17,蝶17,扬17,跋17,骆17,释16,须16,食16,运16,岚16,耶16,净16,宛16,领16,菩16,儿16,随16,麒16,托16,根16,婆16,弗16,其16,涯16,兆16,升16,坎16,席16,龟16,曾16,母15,良15,铭15,殿15,娘15,基15,留15,渡15,环15,盛15,珠15,乘15,弘15,虞15,潜15,库15,寿15,京15,衍15,色15,相15,茂15,存15,婴15,劉15,提15,荆15,辕15,纯14,囚14,傀14,怜14,葫14,息14,下14,野14,动14,果14,奔14,娜14,舍14,间14,脱14,崩14,潇14,爪14,居14,进14,皮14,遁14,柴14,练14,横14,浪14,戈14,仇14,麻14,宣14,瑟14,埃14,韵14,淳14,班14,狄14,友14,尹14,滕14,戚13,琪13,吟13,丰13,转13,统13,度13,穹13,总13,忘13,才13,峰13,疾13,翻13,信13,拜13,亡13,犀13,台13,芊13,欢13,始13,妃13,顺13,引13,湖13,翔13,芸13,冠13,跃13,刑13,晋13,涛13,见13,祁13,莹13,培13,汤13,品12,孝12,浅12,诛12,璇12,盖12,物12,弟12,芒12,陨12,猛12,出12,洁12,厚12,隋12,抱12,固12,焦12,线12,刃12,面12,倪12,宵12,川12,单12,扎12,髓12,娇12,苦12,幕12,涅12,简12,朴12,珊12,楊12,甄12,陳12,奕11,惟11,甜11,嗜11,镖11,异11,祭11,献11,盟11,虫11,玫11,时11,葬11,漫11,镜11,照11,晚11,鲨11,外11,潮11,祥11,迟11,刺11,理11,从11,奈11,付11,颖11,溪11,伍11,迦11,桐11,栖11,融11,寂11,灰11,放11,量11,赖11,软10,鸟10,冉10,暮10,凶10,蛛10,客10,擎10,深10,结10,未10,保10,沌10,曜10,麗10,眉10,夭10,年10,边10,熙10,帮10,骷10,降10,侠10,朵10,猪10,默10,珑10,民10,秉10,蓉10,慈10,车10,姆10,伽10,幼10,宜10,司10,切10,致10,卿10,恨10,淮10,延10,悟10,奎10,猴10,枯10,澹10,璃10,群10,肖10,邱10,龚10,复9,劲9,筱9,指9,無9,骄9,纵9,锐9,州9,遗9,贯9,导9,招9,入9,求9,内9,控9,哲9,卜9,雲9,秃9,蜜9,觉9,踏9,右9,蝴9,疯9,勒9,盾9,活9,判9,胎9,处9,副9,代9,刹9,育9,脉9,绍9,那9,铸9,雳9,岑9,沁9,妍9,扶9,拔9,炫9,补9,褚9,詹9,黃9,霓8,位8,蜈8,套8,宿8,蜘8,过8,我8,侍8,射8,登8,伤8,割8,移8,劈8,悦8,画8,悲8,锻8,政8,能8,业8,两8,魅8,卷8,执8,弦8,仪8,叉8,狗8,占8,澜8,郁8,劳8,悬8,芝8,必8,益8,背8,速8,目8,浑8,枭8,撒8,昆8,察8,尉8,忧8,摄8,撼8,敖8,東8,杏8,樊8,泥8,淬8,蒲8,邢8,鸡8,霹8,佑7,区7,牢7,逍7,蜃7,熔7,倚7,茹7,莽7,魁7,卦7,咒7,夕7,权7,鞭7,沃7,裘7,阁7,爾7,尖7,堪7,缠7,勇7,鸠7,萝7,锡7,欲7,呼7,诚7,梓7,足7,绣7,缘7,失7,央7,健7,炳7,茵7,亭7,崖7,煌7,以7,众7,农7,睿7,则7,遇7,蝉7,萍7,琅7,寰7,谦7,焕7,纤7,铃7,困7,宾7,禹7,肠7,炽7,禄7,奚7,寇7,彼7,术7,式7,律7,缚7,梧7,洗7,滴7,蜂7,翰7,甦7,瞬7,華7,郝7,顶7,驭7,首6,点6,哭6,茶6,会6,墓6,医6,考6,儒6,工6,腰6,唯6,姥6,蟾6,约6,汐6,燎6,换6,推6,郎6,萬6,准6,肉6,返6,叠6,听6,难6,辉6,技6,郡6,吹6,壁6,幸6,变6,窍6,事6,鸾6,岭6,乙6,婧6,茉6,佐6,豹6,钰6,魯6,岐6,味6,翡6,萱6,齿6,匡6,宮6,卧6,厄6,历6,积6,胖6,瓶6,汝6,具6,鼠6,止6,斧6,梨6,鲸6,弄6,醒6,然6,捆6,摘6,砚6,续6,翟6,珈6,暖6,朋6,逢6,浣6,渺6,涂6,烛6,的6,祈6,络6,绯6,耿6,翎6,鉴6,驱6,風5,弹5,寸5,父5,焱5,演5,怪5,借5,再5,盼5,蓬5,湮5,诀5,算5,轰5,維5,冻5,磷5,泣5,努5,绵5,要5,户5,直5,口5,召5,戮5,治5,审5,豆5,寺5,由5,吐5,巢5,契5,姗5,擒5,声5,峡5,盗5,财5,凉5,兹5,丛5,所5,歌5,府5,戒5,鲲5,济5,咆5,羅5,旗5,磁5,热5,燃5,坐5,矮5,劍5,逝5,蝠5,枝5,仞5,族5,箭5,裕5,沂5,弑5,禽5,什5,桥5,计5,传5,级5,佘5,俏5,做5,媛5,冶5,丫5,睛5,蚕5,疤5,忆5,焉5,夷5,贞5,毅5,翅5,反5,驼5,叫5,榭5,搏5,岸5,坚5,艺5,楞5,汗5,柱5,蚀5,曦5,豪5,完5,蕴5,龍5,栋5,菱5,润5,快5,覆5,吾5,筋5,砂5,闵5,浦5,萌5,螺5,莊5,槐5,檀5,濮5,鸯5,瞿5,蔺5,磐5,细5,久5,箫5,缩5,遮5,蟠5,谈5,霆5,迎5,避5,鹞5,塘4,截4,旺4,岛4,钧4,徽4,戏4,吊4,当4,昙4,钵4,姨4,鳄4,蝙4,唤4,墙4,疆4,捕4,号4,拍4,宙4,莎4,钓4,睺4,忒4,吸4,支4,姊4,迫4,茜4,疏4,恋4,棍4,鲍4,沼4,绫4,显4,弃4,灌4,僵4,披4,假4,液4,螳4,组4,瞳4,探4,俄4,凛4,灼4,偷4,举4,议4,津4,丙4,溟4,勃4,鸦4,裳4,闲4,阔4,井4,杖4,休4,催4,朗4,峥4,罚4,勋4,斌4,柄4,选4,论4,斐4,针4,泡4,陌4,苑4,榮4,洋4,薄4,麓4,呂4,宪4,曉4,夢4,因4,娄4,坠4,壮4,壶4,亮4,聪4,靈4,鳌4,诃4,捷4,好4,沛4,鲤4,谛4,将4,雯4,屏4,岁4,而4,巡4,絲4,沫4,廉4,蜀4,寶4,往4,赢4,麥4,打4,排4,接4,珂4,鼓4,状4,漪4,珞4,泪4,像4,弧4,潭4,霏4,棋4,橙4,氲4,鹫4,蘭4,脚4,癸4,鹭4,证4,稻4,粘4,粱4,翁4,瑷4,荀4,蕭4,饮4,鄂4,陰4,陸4,靳4,齊4");
var ilchar=new Dictionary("ichar",1,"山796,王692,子669,天661,儿636,城588,人478,剑478,宗452,丹436,诀423,云420,龙411,门409,斯403,国371,峰335,阵330,风322,海313,月305,术287,明275,族271,法270,境267,君260,殿253,宫250,道247,华246,师243,雪242,德223,石217,神215,阁214,生211,界209,阳206,兰204,尔202,经200,珠200,家199,火196,主195,玉195,哥189,星188,林186,虎184,刀184,功183,特179,兄178,域177,兽176,谷173,河170,灵169,仙166,印165,雨164,飞164,帝163,楼161,岛159,花158,皇158,文156,雷153,者153,拳152,青152,水150,手148,莲146,娘146,草145,东143,娜141,州141,府138,雅136,罗136,元134,杰133,堂133,院133,尊130,图129,陆127,帮126,期126,平126,决125,祖124,然124,成123,克123,清122,力122,塔121,心119,军119,羽118,轩115,光113,掌112,爷111,符110,教110,魔109,叔109,凤108,弟108,斩107,雄107,英106,会106,女106,江103,寒103,亚103,凡103,琳101,拉101,木101,炎101,南100,氏99,丽99,影98,涛98,地97,蛇96,狼96,气95,婷95,宇95,川94,士93,派93,瑶92,远92,宝91,步90,魂89,义89,脉88,鹏87,圣86,空86,香86,辰86,辉86,松85,红85,侯85,果84,玲84,强84,晶83,盟83,达83,武83,某82,行81,森81,妹81,菲81,刚80,奇80,书80,冰80,芳80,夫79,荣78,公78,真77,树77,劫77,体77,庄77,安77,通76,浩76,金76,尘75,芸73,翼73,焰73,波73,锋73,燕73,薇72,丝72,蓉72,枫72,令71,甲71,源71,柔71,烟71,镇71,鸟70,鹰70,洞70,伯70,扬69,豪69,鼎68,姬68,宁68,梅68,秋67,友67,岩67,伟66,琪66,眼66,竹65,志65,渊65,蝶65,老65,西65,言64,玄64,衣63,团63,辈63,倩63,烈63,舞62,霜62,利62,鸣62,凌61,恩61,环61,妍61,娟61,秀60,叶59,音59,晴59,指59,铁59,泽59,侠59,卫59,卿59,岚59,寺58,琴58,翔58,春58,镜57,霞57,昌57,猿56,之55,敏55,典55,鹤55,杀55,乐55,流54,身54,仁54,陵54,式53,仪53,园53,馨53,瑞53,白52,日52,劲52,狱52,梦52,兵52,洛52,牛52,慧52,欣52,祥52,佛51,雯51,原51,少51,威51,怡51,豹50,洋50,虹50,妮50,诺50,思50,蓝50,涵50,晨50,俊49,莹49,一49,芝49,级49,才49,正49,岭48,崖48,妃48,洲48,三48,曼48,莉48,逸48,良48,郡48,茹47,泉47,枪47,美47,兴47,母47,熊47,忠47,庆47,萱47,勇46,极46,旗46,马46,湖46,鱼46,头46,郎46,如46,博46,亮46,虚45,刃45,迪45,静45,记44,池44,嫣44,民44,毅44,痕43,韵43,沙43,胜43,顿43,萍42,离42,意42,凰42,弓42,罡42,都42,邪42,泰42,鸿42,超42,斌42,珍42,多41,爪41,露41,娇41,洪41,昊41,信41,贵41,妖40,变40,坤40,里40,尼40,易40,重39,夜39,柱39,情39,娅39,业39,霄39,璇39,年38,关38,器38,蛟38,媚38,颖38,福38,洁38,双38,岳38,贤38,若38,蟒37,球37,鲁37,北37,方37,依37,村37,楠37,芬37,盾36,血36,战36,司36,基36,丰36,蒙36,珊36,伦36,熙35,大35,下35,散35,轮35,怪35,台35,荒35,全35,七35,盈35,颜35,铭35,啸34,路34,虫34,狐34,和34,智34,隆34,素34,田34,佳34,进33,钟33,丸33,浪33,庭33,恒33,二33,哲33,康33,煞32,刺32,麟32,霸32,诗32,雁32,野32,根31,语31,盘31,帅31,后31,蛛31,卡31,立31,落31,维31,吉30,溪30,录30,骨30,精30,榜30,中30,九30,箭30,瞳30,萨30,藤30,化30,容30,惠30,琼30,幽30,亭30,宏30,艳30,笑29,修29,来29,鞭29,针29,男29,索29,土29,学29,雀29,堡29,汉29,澜29,京29,击28,楚28,长28,齐28,盛28,奴28,瑜28,诚28,夏27,涯27,领27,穹27,象27,莎27,勒27,姆27,旭27,姨27,晓27,眉27,凯27,曦27,墨26,鬼26,区26,队26,格26,魅26,财26,居26,廷26,客26,科26,磊26,斧25,舟25,幡25,四25,斋25,希25,彦25,苏25,铃25,彪25,彤25,富25,婉24,咒24,旋24,技24,猫24,品24,绝24,六24,牙24,桥24,丁24,桐24,礼24,太24,奥24,帆24,桑24,古24,冥24,猛24,娥24,嘉24,非24,破23,发23,棍23,雕23,观23,角23,世23,名23,越23,尚23,童23,间23,封23,傲23,升23,彬23,耀23,灭22,则22,罩22,冲22,液22,戒22,坚22,珑22,陀22,可22,壁22,蕾22,常22,五22,钰22,皓22,奎22,娴22,昆21,章21,炉21,尺21,号21,翰21,机21,千21,黎21,霖21,建21,璐21,凝21,朗21,樱21,顺21,萌21,牌20,鉴20,锁20,锤20,焱20,狮20,厉20,群20,阴20,姑20,儒20,邦20,定20,部20,茵20,歌20,鼠20,钧20,默20,芙20,贞20,媛20,新20,敬20,总20,臣19,猪19,猴19,芒19,局19,营19,巫19,纳19,托19,羊19,普19,启19,谦19,寿19,珂19,欢19,琦19,茜19,健19,兒18,卷18,座18,勋18,灯18,传18,登18,漠18,纹18,系18,璃18,龟18,婆18,狗18,婴18,震18,景18,微18,煌18,腾18,柳18,禹18,佑18,乾18,翠18,加18,杨18,承18,菱18,靖18,惜17,紫17,扇17,酒17,魄17,翎17,吟17,尸17,候17,事17,阶17,兹17,冬17,宜17,柏17,宣17,岗17,巴17,婵17,周17,高17,崇17,柯17,昭17,剧17,馆16,策16,动16,桃16,伞16,潭16,爾16,衍16,妈16,殇16,航16,莫16,忧16,卓16,鑫16,同16,舒16,芦15,弹15,戟15,省15,场15,梁15,布15,游15,度15,提15,官15,零15,艺15,蝎15,苑15,叉15,喜15,班15,芊15,戈15,欧15,秦15,政15,湘15,权15,弘15,悦15,钱14,妙14,鸾14,敌14,儡14,钻14,谱14,鳄14,目14,钢14,棒14,链14,矛14,毒14,蝠14,玛14,篇14,面14,息14,网14,连14,汗14,绫14,唐14,烨14,忌14,保14,徒14,睿14,银14,寨14,侄14,小14,贺14,萝14,玫14,宾14,愁14,魁14,龄14,蛮14,佩13,藏13,暴13,像13,梭13,贝13,曲13,本13,胎13,室13,杖13,窟13,髓13,悔13,莱13,得13,铜13,伤13,伊13,怜13,缺13,医13,姗13,菊13,蒂13,屏13,旺13,蕙13,廉13,昂13,望13,直13,穆13,摩13,悠13,永13,辛13,炼12,裳12,临12,电12,跃12,庙12,乡12,锐12,笔12,了12,驹12,位12,棠12,种12,起12,耶12,娃12,比12,蝉12,屠12,黄12,幻12,潮12,尉12,坊12,米12,狂12,闪12,聪12,闲12,栋12,桂12,甜12,禄12,晋12,市11,解11,蜥11,姿11,瀚11,瑰11,能11,纪11,命11,蟾11,刹11,夕11,上11,霆11,理11,运11,父11,照11,统11,潇11,蕊11,翁11,为11,隐11,嫂11,朔11,奕11,征11,焕11,迦11,善11,斐11,霓11,瑾11,荷11,苍11,吴11,津11,莺11,巧11,管11,振11,窍11,逍11,昱10,纯10,念10,船10,爆10,瓶10,纱10,犀10,乌10,冠10,貂10,崩10,峡10,衫10,药10,葛10,量10,横10,狸10,回10,初10,姥10,眸10,赤10,盖10,斗10,护10,茶10,因10,裂10,脚10,袖10,怀10,放10,声10,鹿10,孙10,圆10,尧10,纤10,其10,拓10,程10,仔10,胤10,晖10,先10,板10,魏10,茂10,严10,蜂10,佐10,淳10,融10,慈10,碧10,婶10,逊10,仲10,前10,沁10,均10,萧10,瑛10,爽10,芯9,臂9,犬9,岁9,碑9,的9,线9,僧9,穴9,镯9,装9,车9,噬9,鲸9,核9,史9,汀9,蛋9,鳞9,驰9,雲9,乔9,贼9,约9,口9,问9,督9,弦9,丘9,助9,缘9,港9,絲9,党9,农9,有9,钦9,绍9,蘭9,赐9,乙9,标9,归9,玟9,晔9,孝8,赋8,简8,蚣8,涎8,圈8,参8,开8,工8,铠8,复8,淑8,鲨8,赛8,盗8,集8,那8,满8,卦8,顶8,玑8,遥8,幕8,组8,怒8,店8,宙8,坦8,墟8,剪8,蚁8,瓦8,砂8,棋8,恭8,璋8,塞8,墓8,韩8,疆8,末8,十8,斑8,仇8,凉8,奉8,菁8,锦8,琛8,庸8,吾8,铎8,余8,衡8,万8,桓8,纬8,庵8,济8,列8,筠8,鸦8,伽8,沐8,董8,姣8,甫8,巍8,芷8,广8,徽8,牧8,婕8,狄8,显8,煜7,炮7,遁7,势7,笛7,转7,物7,踪7,断7,尾7,坛7,肃7,嵩7,叟7,璧7,禽7,鼓7,钩7,娑7,壮7,夭7,殊7,飛7,筝7,笼7,范7,库7,寻7,奔7,实7,爵7,皮7,髅7,葵7,巢7,恨7,絮7,识7,枭7,厚7,刑7,宵7,辅7,杏7,温7,壶7,谨7,坡7,培7,涧7,席7,仓7,琰7,伶7,户7,浦7,滨7,暄7,申7,唯7,丑7,晃7,应7,禾7,岐7,桦7,虏7,婧7,杭7,灿7,昕7,炫7,陌7,铮7,宋7,暮7,龍6,沛6,泪6,毛6,祭6,坞6,汤6,乳6,衰6,骑6,腿6,商6,捶6,刻6,论6,枝6,沃6,形6,醉6,败6,牢6,合6,栈6,哈6,外6,守6,扎6,阿6,宛6,朝6,币6,峻6,棺6,耳6,庐6,赵6,察6,漪6,杉6,展6,冉6,深6,鸡6,坠6,弱6,胶6,汐6,益6,芹6,留6,病6,茗6,尤6,傀6,研6,黑6,宿6,朋6,何6,迁6,胖6,致6,坎6,淮6,瑟6,舜6,勤6,琬6,薰6,休6,治6,荃6,徐6,鸢6,节6,密6,丙6,阙6,鹫6,戎6,函6,宽6,硕6,荆6,甘6,昔5,忆5,赫5,粉5,近5,套5,所5,移5,诏5,檀5,打5,砚5,时5,蜜5,们5,切5,无5,迟5,泊5,悲5,箓5,萼5,井5,死5,翅5,鲲5,伏5,辕5,儀5,陨5,等5,籍5,禁5,酿5,什5,弼5,狩5,知5,走5,恶5,雾5,莽5,姊5,沉5,碎5,淼5,端5,蔡5,國5,好5,厄5,岸5,八5,冢5,琅5,纶5,沟5,李5,恬5,忍5,沧5,華5,弗5,街5,韬5,绣5,睛5,举5,采5,笙5,鳳5,玺5,闻5,含5,蔓5,匡5,麓5,婭5,淇5,觉5,阔5,历5,左5,当5,邈5,溟5,姜5,苓5,谋5,旦5,苦5,诩5,孟5,宸5,棉5,霏5,飘5,导5,谢5,兆5,傅5,轲5,鹊5,漩5,宪5,枚5,亨5,夷5,娉5,于5,浮5,渡5,語5,羲5,冷5,麒5,捷5,雍5,娆4,盼4,存4,冯4,暗4,处4,瑚4,帖4,隼4,浆4,舰4,纲4,垒4,靴4,引4,峒4,内4,宴4,膏4,筑4,错4,钥4,骄4,郁4,竿4,壤4,沌4,现4,乘4,亞4,性4,我4,视4,结4,祀4,袍4,躯4,煙4,脊4,墙4,弩4,唤4,带4,享4,茫4,代4,朵4,達4,罕4,夙4,绒4,壳4,介4,涡4,纣4,庞4,埃4,坟4,射4,宅4,止4,芮4,舍4,徵4,彩4,菜4,边4,而4,芽4,蓬4,查4,裕4,难4,画4,巷4,胡4,湾4,俠4,剛4,陇4,愚4,珞4,兮4,擎4,遠4,响4,楷4,箫4,适4,珀4,油4,别4,予4,沅4,磐4,吼4,纵4,臻4,豆4,兔4,在4,驴4,键4,社4,椅4,阀4,妞4,瑤4,塘4,禅4,眠4,肯4,沫4,充4,珺4,妤4,绮4,苹4,仕4,滔4,蓓4,祯4,糖4,央4,协4,演4,菡4,歆4,鹃4,珏4,陶4,桢4,焚4,珪4,突4,允4,禧4,嫦4,翌4,桩4,敦4,梧4,昧4,圭4,苗4,峦4,右4,钗4,滟4,钊4,逵4,向4,蜀4,涅4,孜4,韦4,挺4,冕4,忘4,玮4,琨4,绿4,绪4,悟4,潜4,陈4,润4,辽4,攸4,枢4,俪4,慕4,笠4,闯4,固4,薙4");
function tokenizeName(t){
    if(! t[t.length-1] in ilchar){
        return t;
    }
    if(t.length == 3){
        var char2 = t.substring(0,2);
        if(ichar2.isPopular(char2)){
            return [char2 , t[2]];
        }
        if(ichar3.isPopular(t[0], 50) && ichar3.isPopular(t[1], 50)){
            return [t[0], t[1], t[2]];
        }
        if(ichar3.isPopular(t[0], 10) && ichar3.isPopular(t[1], 10) && ilchar.isPopular(t[2], 50)){
            return [t[0], t[1], t[2]];
        }
    }
    if(t.length == 4){
        var char2 = t.substring(0,2);
        if(ichar2.isPopular(char2) && ichar3.isPopular(t[2])){
            return [char2, t[2], t[3]];
        }
        if(ichar3.allIsPopular(t.substring(0,3), 50)){
            return [t[0], t[1], t[2], t[3]];
        }
        if(ichar3.allIsPopular(t.substring(0,3)) && ilchar.isPopular(t[3] , 50)){
            return [t[0], t[1], t[2], t[3]];
        }
    }
    if(t.length == 5){
        var char2 = t.substring(0,2);
        var char22 = t.substring(2,4);
        if(ichar2.isPopular(char2) && ichar2.isPopular(char22)){
            return [char2, char22, t[4]];
        }
        if(ichar2.isPopular(char2) && ichar3.allIsPopular(char22)){
            return [char2, ...char22.split(""), t[4]];
        }
        if(ichar2.isPopular(char22) && ichar3.allIsPopular(char2)){
            return [...char2.split(""), char2 , t[4]];
        }
        if(ichar3.allIsPopular(t.substring(0,4), 50)){
            return [t[0], t[1], t[2], t[3], t[4]];
        }
    }
    if(t.length > 5){
        var popularity = 0;
        for(var i = 0; i < t.length; i++){
            if(ichar3.isPopular(t[i],50)){
                popularity++;
            }
        }
        if(popularity > 4 && ichar3.isPopular(t[0])){ 
            return t.split("");
        }
        if(popularity > 3 && ichar2.isPopular(t.substring(0,2))){ 
            return t.split("");
        }
    }
    return t;
}
function parseNameRow(row){
	var row = e.split("=");
	if(row.length<2){}
	else{
		if(row[0]!=""){
			if(row[0].charAt(0)=="@"){
				row[0]=row[0].substring(1).split("|");
				if(row[1]!=null)
					row[1]=row[1].split("|");
				replaceByNode(row[0],row[1]);
			}else 
			if(row[0].charAt(0)=="#"){
				dictionary.set(row[0].substring(1),row[1]);
			}else 
			if(row[0].charAt(0)=="$"){

				var sear=row[0].substring(1);
				var rep=row.joinlast(1);
				if(sear.length==1){
					if(convertohanviets(sear)==rep.toLowerCase()){
						return;
					}
				}
				if(true){

					dictionary.set(sear,rep);
					nametree.setmean(sear,"="+rep);
				}else
				replaceOnline(sear,rep);
			}else 
			if(row[0].charAt(0)=="~"){
				meanengine(e.substr(1));
			}
			else{
				toeval2+="replaceByRegex(\""+eE(row[0])+"\",\""+eE(row[1])+"\");";
			}
		}
		
	}
}
function excuteContainer(){
	if(g(contentcontainer)==null)return;
	// if(getCookie("foreignlang") && getCookie("foreignlang") != "vi"){
	// 	return;
	// }
	// if(getCookie("transmode") == "chinese"){
	// 	return;
	// // }
	// if(dictionary.finished==false){
	// 	dictionary.readTextFile("//sangtacviet.com/wordNoChi.htm?update=1");
	// 	phrasetree.load();
	// 	tse.connect();
	// 	return;
	// }
	// if(tse.ws.readyState!=1){
	// 	tse.autoexcute=true;
	// 	tse.connect();
	// }
	var curl = document.getElementById("hiddenid").innerHTML.split(";");
	var book=curl[0];
	var chapter = curl[1];
	var host = curl[2];
	if(host=="sangtac")return;
	hideNb();
	//if(g("tmpcontentdiv")){
	//	pushFromView();
	//}
	
	if(host!="dich")
	fastNaming();
	prediction.enable=true;
	if(!window.appdb){
		return;
	}
	window.appdb.getName(host,book).then(function(namedata){
		if(namedata){
			for(var i = 0; i < namedata.length; i++){
				var e = namedata[i];
				parseNameRow(e);
			}
		}
		replaceVietphrase();
		if(window.setting&& window.setting.allownamev3){
			replaceName();
		}
		needbreak=false;
		meanengine.usedefault();
		if(!tse.connecting){
			if(invokeMeanSelector==null || invokeMeanSelector!==false){
				window.meanSelectorCheckpoint = 0;
				if(window.lazyProcessor){
					window.lazyProcessor.clear();
				}
				meanSelector();
			}
		}
		
		setTimeout(doeval,100);
		runned=true;
	});
}
function getEditSuggest(t,e,jn){
	var suggest = [];
	suggest.cleanDuplicate = function(){
		var newSuggest = [];
		for(var i = 0; i < suggest.length; i++){
			var e = suggest[i];
			if(!newSuggest.find(obj=>obj.text == e.text)){
				newSuggest.push(e);
			}
		}
		suggest.length = 0;
		newSuggest.sort(function(a,b){
			return b.priority - a.priority;
		});
		for(var i = 0; i < newSuggest.length; i++){
			suggest.push(newSuggest[i]);
		}
	}
	getTfcoreSuggest(t, function(sg){
		if(suggest.find(obj=>obj.text == sg)){
			var old = suggest.find(obj=>obj.text == sg);
			old.priority = 3;
			suggest.cleanDuplicate();
			suggest.onUpdate && suggest.onUpdate();
			return;
		}
		var isTitleCase = sg == titleCase(sg);
		suggest.push({ 
			text: sg,
			priority: 3,
			tag: isTitleCase ? "tf,name" : "tf,vp" 
		});
		suggest.cleanDuplicate();
		suggest.onUpdate && suggest.onUpdate();
	});
	if(phrasetree.getmean(t)!=""){
		var l = phrasetree.getmean(t).split('/');
		for(var i = 0; i < l.length; i++){
			suggest.push(
				{ 
					text: l[i],
					priority: 1,
					tag: "vp"
				});
		}
	}
	else{
		if(e && e.mean()){
			var l = e.mean().split('/');
			for(var i = 0; i < l.length; i++){
				suggest.push(
					{ 
						text: l[i],
						priority: 1,
						tag: "vp"
					});
			}
		}
	}
	ajax("sajax=getnamefromdb&name="+encodeURIComponent(t.trim()),function(down){
		var da=down.split("/");
		var sg = da[0];
		if(sg && !sg.match(/cẩu|nhật/i)){
			suggest.push({ 
				text: sg,
				priority: 4,
				tag: "db" 
			});
			suggest.cleanDuplicate();
			suggest.onUpdate && suggest.onUpdate();
		}
	});
	getBingSuggest(t,function(d){
		var isTitleCase = d == titleCase(d);
		if(isTitleCase){
			suggest.push({ 
				text: d,
				priority: 2,
				tag: "bing" 
			});
			suggest.push({ 
				text: titleCase(convertohanviets(t)),
				priority: 2,
				tag: "name" 
			});
			suggest.cleanDuplicate();
			suggest.onUpdate && suggest.onUpdate();
		}else{
			suggest.push({ 
				text: d,
				priority: 1,
				tag: "bing" 
			});
			suggest.cleanDuplicate();
			suggest.onUpdate && suggest.onUpdate();
		}
	});
	suggest.push({ 
		text: titleCase(convertohanviets(t)),
		priority: 0,
		tag: "name" 
	});
	suggest.base = t;
	if(jn && t.length < 8){
		getTfcoreNameSuggest(t, function(sg){
			if(sg.JAP){
				sg = sg.JAP;
			}else{
				return;
			}
			suggest.push({ 
				text: sg,
				priority: 2,
				tag: "tf,jp"
			});
			suggest.cleanDuplicate();
			suggest.onUpdate && suggest.onUpdate();
		});
		googletranslateNocache(t,function(sg){
			suggest.push({ 
				text: sg,
				priority: 1,
				tag: "gg"
			});
			suggest.cleanDuplicate();
			suggest.onUpdate && suggest.onUpdate();
		});
	}
	return suggest;
}
function appSelectNode(e){
	if(e.currentTarget){
		e=e.currentTarget;
	}
	if(typeof setting !="undefined"){
		if(setting.allowtaptoedit!=null&&!setting.allowtaptoedit){
			return;
		}
	}
	if(selNode!=null && selNode.indexOf(e)!=-1){
		return;
	}
	unlock();
	selNode=[];
	e.style.color="red";
	basestr=e.innerHTML;
	// if(true){
	// 	var offset = getPos(e);
	// 	if(offset.x+257>windowWidth){
	// 		nb.style.left=(windowWidth-256)+"px";
	// 	}else{
	// 		nb.style.left=offset.x+"px";
	// 	}
	// 	nb.style.top=(e.offsetTop + offset.h) +"px";
	// }
	//showNb();
	selNode.push(e);
	return true;
}
function appExpandRight(e){
	var nextNode = nextNSibling(e);
	if(!nextNode){return;}
	if(nextNode.nodeType==3){
		return appExpandRight(nextNode);
	}
	return nextNode.gT();
}
// function nextNSibling(e){
// 	var nod =selNode[selNode.length-1].nextSibling;
// 	if(nod.nodeType!=3)
// 	nod.style.color="red";
// 	selNode.push(nod);
// 	return selNode[selNode.length-1];
// }
function appExpandLeft(e){
	var nextNode = previousNSibling(e);
	if(!nextNode) return;
	if(nextNode.nodeType==3){
		leftflag=true;
		return appExpandLeft(nextNode);
	}
	return nextNode.gT();
}
function getSelectedNodeChinese(){
	var s = "";
	for(var i = 0 ;i < selNode.length; i++){
		if(selNode[i].nodeType==3){
			continue;
		}
		s+=selNode[i].gT();
	}
	return s;
}
function tfTokenizer(text){
	var sentences = [];
	var sentence = "";
	var lastChar = "";
	var tokens = {
		"。": true,
		"？": true,
		"！": true,
		"；": true,
		"”": true,
		".": true,
		"?": true,
		"!": true,
		";": true,
	}
	for(var i = 0; i < text.length; i++){
		var char = text[i];
		if(char in tokens){
			if(lastChar in tokens){
				sentence += char;
			}else{
				sentence += char;
				if(sentence.length < 99){
					sentences.push(sentence);
				}
				sentence = "";
			}
		}else{
			sentence += char;
		}
		lastChar = char;
	}
	if(sentence && sentence.length < 99){
		sentences.push(sentence);
	}
	return sentences;
}
function tfDetname(){
	if(window.detnameLock){
		return;
	}
	var c = g(contentcontainer);
	var z = "";
	for(var i=0;i<c.childNodes.length;i++){
		if(c.childNodes[i].nodeType == 3){
			z+=c.childNodes[i].textContent;
		}else{
			z+=c.childNodes[i].gT();
		}
	}
	z = tfTokenizer(z).join("");
	var xhttp =  new XMLHttpRequest();
	xhttp.open("POST","/tfcore.php?detname=true");
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState==4 && xhttp.status==200){
			var w=ui.win.create("Lọc name");
			w.id = "detnamewin";
			window.detnameLock = false;
			var l = JSON.parse(xhttp.responseText);
			var lnames = l.lownames.join("\n");
			var names = l.names.join("\n");
			var r = w.body.row()
			r.addText("Name đã phát hiện");
			var r = w.body.row();
			r.innerHTML = `<textarea id="detectedName" class="w-100" style="min-height: 250px">${names}</textarea>`;
			var r = w.body.row();
			r.addText("Từ ngữ phổ biến đã phát hiện");
			if(lnames.length<2){
				r.style.display = "none";
			}
			var r = w.body.row();
			r.innerHTML = `<textarea id="detectedLowName" class="w-100" style="min-height: 90px">${lnames}</textarea>`;
			if(lnames.length<2){
				r.style.display = "none";
			}
			var r = w.body.row();

			var btn = r.addButton("Chỉ dùng names", "useAllNameDetected()");
			if(lnames.length<2){
				btn.style.display = "none";
			}
			r.addButton("Dùng tất cả", "useAllNameAndLowNameDetected()");
			w.show();
		}
	}
	xhttp.send(z.replace(/ +/g, "").replace(/\./g,"。").replace(/“/g,"“").replace(/”/g,"”"));
	window.detnameLock = true;
}
function useAllNameDetected(){
	var t = g("detectedName").value;
	namew.value = t+"\n"+namew.value;
	saveNS();
	excute();
	if(g("detnamewin")){
		g("detnamewin").hide();
	}
}
function useAllNameAndLowNameDetected(){
	var t = g("detectedName").value;
	var t2 = g("detectedLowName").value;
	namew.value =t2 +"\n" + t+"\n"+namew.value;
	saveNS();
	excute();
	if(g("detnamewin")){
		g("detnamewin").hide();
	}
}
var stvTts = {
	server: "wss://staticvn.sangtacvietcdn.xyz/audio/",
	ws: null,
	ready: false,
	voiceid:0,
	init: function(){
		this.ws = new WebSocket(this.server);
		this.ws.binaryType = "arraybuffer";
		this.ws.onmessage = this.decodeMessage.bind(this);
		this.ws.onopen = (function(){
			this.ready = true;
		}).bind(this);
	},
	getMessageId: function(){
		var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for (var i = 0; i < 20; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));
	    return text;
	},
	base64ToArrayBuffer: function(base64) {
	    var binary_string =  window.atob(base64);
	    var len = binary_string.length;
	    var bytes = new Uint8Array( len );
	    for (var i = 0; i < len; i++)        {
	        bytes[i] = binary_string.charCodeAt(i);
	    }
	    return bytes.buffer;
	},
	decodeMessage: function(e){
	    var messageId = e.data.substring(0, 20);
	    var data = e.data.substring(20);
	    var arrayBuffer = this.base64ToArrayBuffer(data);
	    var blob = new Blob([arrayBuffer], {type: "audio/wav"});
	    var url = URL.createObjectURL(blob);
	    var audio = new Audio(url);
	    audio.play();
	},
	synth: function(text){
	    var voiceid = ("00" + this.voiceid).slice(-2);
	    var messageId = this.getMessageId();
	    var data = messageId + voiceid + text;
	    this.ws.send(data);
	},
	getVoices: function(){
		var vcs = [];
		for(var i=0;i<64;i++) vcs.push("Giọng "+(i+1));
		return vcs;
	},
	setVoice: function(voiceName){
		this.voiceid = parseInt(voiceName.substring(6)) - 1;
	}
}