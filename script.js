window.onload = on();
function setWzor(){
    document.getElementById("wzor").addEventListener("click",function(){
        patternEvent();
    })

}
function restart(){
    document.getElementById("res").addEventListener("click",function(){
        new make("pattern",250,100).init();
        new make("image",500,200).init();
        //patternEvent();
    })

}
function setClear(){
    document.getElementById("clear").addEventListener("click",function(){
        var x = getRects("pattern");
        for(var i=0;i<x.length;i++){
            var oneRect = x[i];
            //console.log("R"+oneRect);
            if(oneRect.getAttribute("fill") == "purple"){
                oneRect.setAttribute("fill","transparent")
            }
        }
        //patternEvent();
    })

}
function imageEvent(){
    var x = getRects("image");
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
    document.getElementById('image').getElementsByTagName('svg')[0].innerHTML+="";
    addEvents("mouseover",x,function(){draw(this);/*console.log(this.getAttribute("class"))*/;});
    var els = document.getElementById('image').getElementsByTagName("rect");
    for(var i=0;i<els.length;i++){
            if(els[i].getAttribute("class")=="b"){
                els[i].addEventListener("mousedown",fillTransparent);
            }
    }


}
function test(pos){
    var x = getRects("image");
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
    document.getElementById('image').getElementsByTagName('svg')[0].innerHTML+="";
    addEvents("mouseover",x,function(){draw(this);/*console.log(this.getAttribute("class"))*/;});
    var els = document.getElementById('image').getElementsByTagName("rect");
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
    return [[0,0],[Math.abs(x[0]-y[0]),Math.abs(x[1]-y[1])]]
}
function fillWithPattern(pat){
    var xSize = pat[1][0]+10;
    var ySize = pat[1][1]+10;
    var width = 500;
    var height = 200;
    do{
        test(pat)
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
            //console.log("hi");
        }
        else{
            test(pat);
            pat[0][0]+=xSize;
            pat[1][0]+=xSize;
        }
    }while(true)
}

function getRects(id){
    return document.getElementById(id).getElementsByTagName('svg')[0].getElementsByTagName("rect");
}
function patternEvent(){
    var x = getRects('pattern');
    var pos=[[10000,10000],[0,0]];
    for(var i=0;i<x.length;i++){
        var oneRect = x[i];
        //console.log("R"+oneRect);
        if(oneRect.getAttribute("fill") == "purple"){
            var cords= getPosition(x[i]);
            pos=compare(pos,cords);
        }
    }
    console.log("pos "+pos,absolutePos(pos));
    fillWithPattern(absolutePos(pos));
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
    document.getElementById('pattern').getElementsByTagName('svg')[0].innerHTML+="";
    addEvents("mouseover",x,function(){draw(this);/*console.log(this.getAttribute("class"))*/;});
    //var els = document.getElementById('pattern').getElementsByTagName("rect");
    var els = getRects('pattern');
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
        //var els = document.getElementById('image').getElementsByTagName("rect");
        var els = getRects('image');
        for(var i=0;i<els.length;i++){
            if(els[i].getAttribute("fill")==color)
            els[i].setAttribute("fill","transparent");
            //els[i].setAttribute("class","c");
        }
    }
}
function createColor(){
    var rand = Math.random();
    while(rand<0.1){
        rand = Math.random();
    }
    return '#'+(rand*0xFFFFFF<<0).toString(16);
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
        else{return false;};
    }
    else{return false;}
}
function getPosition(self){
    return [Number(self.getAttribute("x")),Number(self.getAttribute("y"))]
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
    setWzor();
    setClear();
    restart();
    document.getElementById('pattern').addEventListener("mousedown",function(){
        this.setAttribute("data-click-status","1");
    })
document.getElementById('image').addEventListener("mousedown",function(){
    this.setAttribute("data-click-status","1");
    //console.log("ok");
    //ifClicked=1;
})
    document.getElementById("pattern").addEventListener("mouseup",function(){
        this.setAttribute("data-click-status","0");
    });
    document.getElementById("image").addEventListener("mouseup",function(){
        this.setAttribute("data-click-status","0");
        imageEvent();
    });
    new make("pattern",250,100).init();
    new make("image",500,200).init();
}
function make(id,width,height){
    var self=this;
    this.width=width;
    this.height=height;
    this.id=id;
    this.squares=function(){
        var elems="";
        for(var i=0;i<self.width/10;i++){
            for(var j=0;j<self.height/10;j++){
                elems+=makeSquare(10*i,10*j);
            }
        }
        return elems;
    }
    this.setParams=function(){
        //console.log(self.width,self.height);
        var elems = self.squares();
        //console.log(elems);
        var el=document.getElementById(self.id).getElementsByTagName("svg")[0];
        el.innerHTML="";
        el.innerHTML+=elems;
        el.setAttribute("viewBox", '0 0 '+self.width+" "+self.height+'');
        el.setAttribute("width", self.width +'px');
        el.setAttribute("height",self.height+ "px");
        //console.log(el);
    }
    this.init=function(){
    self.setParams();
    var rects = getRects('pattern');
    addEvents("mouseover",rects,function(){draw(this)});

    }
}
function clear(list){
    for(var i=0;i<list.length;i++){
        var oneRect = list[i];
        oneRect.setAttribute("fill","transparent");
    }
}
function draw(self){
    var status=self.parentNode.parentNode.getAttribute("data-click-status");
    //console.log(self.parentNode.parentNode,self)
    if(status=="1")
        self.setAttribute("fill","purple");
}
function makeSquare(i,j) {
    return '<rect x="'+i+'" y="'+j+'" width="10" height="10" stroke-width="0px" stroke="black" class="a" fill="transparent"/>'
}
