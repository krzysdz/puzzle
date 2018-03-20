window.onload = on();
var ifClicked=0;
window.addEventListener("mousedown",function(){
	//console.log("ok");
	ifClicked=1;
});
function imageEvent(){
	var x = document.getElementById("image").getElementsByTagName("svg")[0].getElementsByTagName("rect");
	var pos=[[10000,10000],[0,0]];
	for(var i=0;i<x.length;i++){
		var oneRect = x[i];
		//console.log("R"+oneRect);
		if(oneRect.getAttribute("fill") == "purple"){
			var cords= getPosition(x[i]);
			pos=compare(pos,cords);
		}
		//console.log(x.filter(function(el){compare2(pos,getPosition(el))}));
		//console.log(oneRect.getAttribute("fill"));
	}
	//console.log("pos "+pos)
	//console.log("elems "+ x);
	//console.log(document.getElementById('image').getElementsByTagName('svg')[0]);
	var color=createColor();
	for(var j=0;j<x.length;j++){
		var oneRect = x[j];
		var cords= getPosition(oneRect);
		//console.log(oneRect);
		if(compare2(pos,cords)){
			if(oneRect.getAttribute("class")=="a"){
				oneRect.setAttribute("fill",color);
			}
			if(oneRect.getAttribute("fill")==color){
				oneRect.setAttribute("class","b");
			}
		}
	}
	document.getElementById("image").getElementsByTagName("svg")[0].innerHTML+="";
	addEvents("mouseover",x,function(){draw(this);/*console.log(this.getAttribute("class"))*/});
	var els = document.getElementById("image").getElementsByTagName("rect");
	for(var i=0;i<els.length;i++){
		if(els[i].getAttribute("class")=="b"){
			els[i].addEventListener("mousedown",fillTransparent);
		}
	}


}
function test(pos){
	var x = document.getElementById("image").getElementsByTagName("svg")[0].getElementsByTagName("rect");
	var color=createColor();
	for(var j=0;j<x.length;j++){
		var oneRect = x[j];
		var cords= getPosition(oneRect);
		//console.log(oneRect);
		if(compare2(pos,cords)){
			if(oneRect.getAttribute("class")=="a"){
				oneRect.setAttribute("fill",color);
			}
			if(oneRect.getAttribute("fill")==color){
				oneRect.setAttribute("class","b");
			}
		}
	}
	document.getElementById("image").getElementsByTagName("svg")[0].innerHTML+="";
	addEvents("mouseover",x,function(){draw(this);/*console.log(this.getAttribute("class"))*/});
	var els = document.getElementById("image").getElementsByTagName("rect");
	for(var i=0;i<els.length;i++){
		if(els[i].getAttribute("class")=="b"){
			els[i].addEventListener("mousedown",fillTransparent);
		}
	}
	return;
}
function absolutePos(pos){
	var x = pos[0];
	var y = pos[1];

	return [[0,0],[Math.abs(x[0]-y[0]),Math.abs(x[1]-y[1])]];
}
function fillWithPattern(pat){
	var xSize = pat[1][0]+10;
	var ySize = pat[1][1]+10;
	var width = 500;
	var height = 200;
	var x=0;
	do{
		//pat[0][0]+=xSize;
		//pat[1][0]+=xSize;
		console.log(pat);
		test(pat);
		pat[0][0]+=xSize;
		pat[1][0]+=xSize;
		if(pat[1][0]>=width+xSize){
			//pat[1][0]=width;
			//test(pat);
			pat[0][1]+=ySize;
			pat[1][1]+=ySize;
			pat[1][0]=xSize-10;
			pat[0][0]=0;
			if(pat[1][1]>=height+ySize){
				break;
			}
			console.log("hi");
		}
		else{
			test(pat);
			pat[0][0]+=xSize;
			pat[1][0]+=xSize;
			/*if(pat[1][1]>height){
				pat[1][1]=height;
			}*/
		}

	//}while(pat[1][1]<height)
	}while(x<2);


}

function patternEvent(){
	var x = document.getElementById("pattern").getElementsByTagName("svg")[0].getElementsByTagName("rect");
	var pos=[[10000,10000],[0,0]];
	for(var i=0;i<x.length;i++){
		var oneRect = x[i];
		//console.log("R"+oneRect);
		if(oneRect.getAttribute("fill") == "purple"){
			var cords= getPosition(x[i]);
			pos=compare(pos,cords);
		}
		//console.log(x.filter(function(el){compare2(pos,getPosition(el))}));
		//console.log(oneRect.getAttribute("fill"));
	}
	//var math = new Math();
	console.log("pos "+pos,absolutePos(pos));
	fillWithPattern(absolutePos(pos));
	//test(pos);
	//console.log("elems "+ x);
	//console.log(document.getElementById('image').getElementsByTagName('svg')[0]);
	var color=createColor();
	for(var j=0;j<x.length;j++){
		var oneRect = x[j];
		var cords= getPosition(oneRect);
		//console.log(oneRect);
		if(compare2(pos,cords)){
			if(oneRect.getAttribute("class")=="a"){
				oneRect.setAttribute("fill",color);
			}
			if(oneRect.getAttribute("fill")==color){
				oneRect.setAttribute("class","b");
			}
		}
	}
	document.getElementById("pattern").getElementsByTagName("svg")[0].innerHTML+="";
	addEvents("mouseover",x,function(){draw(this);/*console.log(this.getAttribute("class"))*/});
	var els = document.getElementById("pattern").getElementsByTagName("rect");
	for(var i=0;i<els.length;i++){
		if(els[i].getAttribute("class")=="b"){
			els[i].addEventListener("mousedown",fillTransparent);
		}
	}


}
function fillTransparent(){
	var time = new Date().getTime();
	var x = this.getAttribute("data-time");
	this.setAttribute("data-time",time);
	if(time-x<500){
		var color = this.getAttribute("fill");
		var els = document.getElementById("image").getElementsByTagName("rect");
		for(var i=0;i<els.length;i++){
			if(els[i].getAttribute("fill")==color)
				els[i].setAttribute("fill","transparent");
			//els[i].setAttribute("class","c");
		}
	}
}
//console.log(document.getElementById('image').getElementsByTagName('svg')[0]);
function drawBigRect(pos,labal){
	var color=createColor();
	var width = pos[1][0]-pos[0][0]+10;
	var height=pos[1][1]-pos[0][1]+10;
	return "<rect x=\""+pos[0][0]+"\" y=\""+pos[0][1]+"\" width=\""+width+"\" height=\""+height+"\" stroke-width=\"0px\" stroke=\"black\" class=\"b\" fill=\""+color+"\"/>";
}
function createColor(){
	var rand = Math.random();
	while(rand<0.1){
		rand = Math.random();
	}
	return "#"+(rand*0xFFFFFF<<0).toString(16);
}
function compare(pos,cords){
	if(pos[0][0]>cords[0])
		pos[0][0]=cords[0];
	if(pos[0][1]>cords[1])
		pos[0][1]=cords[1];
	if(pos[1][0]<cords[0])
		pos[1][0]=cords[0];
	if(pos[1][1]<cords[1])
		pos[1][1]=cords[1];
	return pos;

}
function compare2(pos,cords){
	if(pos[1][0]>=cords[0] && pos[1][1]>=cords[1]){
		//console.log("x"+cords);
		if(pos[0][0]<=cords[0] && pos[0][1]<=cords[1]){
			//console.log(cords);
			return true;
		}
		else{return false;}
	}
	else{return false;}
}
function getPosition(self){
	return [Number(self.getAttribute("x")),Number(self.getAttribute("y"))];
}
function addEvents(type,list,event){
	for(var i=0;i<list.length;i++){
		var oneRect = list[i];
		if(oneRect.getAttribute("class")=="a")
			oneRect.addEventListener(type,event);
		else{
		//oneRect.addEventListener("mouseover",function(){ifClicked=0;})
		}
	}
}

function on(){
	document.getElementById("pattern").addEventListener("mouseup",function(){
	//console.log("ok");
		ifClicked=0;
		//imageEvent();
		patternEvent();

	});
	document.getElementById("image").addEventListener("mouseup",function(){
		//console.log("ok");
		ifClicked=0;
		imageEvent();
		//patternEvent();
	});
	pattern();
	//document.getElementById("navbar_settings").addEventListener("dblclick",function(el){console.log(this)});
	var width=500;
	var height=200;
	var el = document.getElementById("image").getElementsByTagName("svg")[0];
	var elems="";
	for(var i=0;i<width/10;i++){
		for(var j=0;j<height/10;j++){
			//oneElem=array.points[i];
			elems+=defPoint(10*i,10*j);
		//makePoint(oneElem);
		}
	}
	//console.log('elems',elems);
	el.innerHTML+=elems;
	el.setAttribute("viewBox", "0 0 "+width+" "+height+"");
	el.setAttribute("width", width +"px");
	el.setAttribute("height",height+ "px");
	console.log(el);
	var x = el.getElementsByTagName("rect");
	addEvents("mouseover",x,function(){draw(this);});
}
function pattern(){
	//document.getElementById("navbar_settings").addEventListener("dblclick",function(el){console.log(this)});
	var width=250;
	var height=100;
	var el = document.getElementById("pattern").getElementsByTagName("svg")[0];
	var elems="";
	for(var i=0;i<width/10;i++){
		for(var j=0;j<height/10;j++){
			//oneElem=array.points[i];
			elems+=defPoint(10*i,10*j);
		//makePoint(oneElem);
		}
	}
	//console.log('elems',elems);
	el.innerHTML+=elems;
	el.setAttribute("viewBox", "0 0 "+width+" "+height+"");
	el.setAttribute("width", width +"px");
	el.setAttribute("height",height+ "px");
	console.log(el);
	var x = el.getElementsByTagName("rect");
	addEvents("mouseover",x,function(){draw(this);});
}
function clear(list){
	for(var i=0;i<list.length;i++){
		var oneRect = list[i];
		oneRect.setAttribute("fill","transparent");
	}
}
function draw(self){
	if(ifClicked==1)
		self.setAttribute("fill","purple");
	//self.style.fill = "purple";

}
function defPoint(i,j) {
	return "<rect x=\""+i+"\" y=\""+j+"\" width=\"10\" height=\"10\" stroke-width=\"0px\" stroke=\"black\" class=\"a\" fill=\"transparent\"/>";
//return '<circle cx="0" cy="0" r="0" stroke-width="0.5px" stroke="black"  fill="red" />';
}
