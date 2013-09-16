/***
* MEItoVexFlow
* 
* Author: Richard Lewis
* Contributors: Zoltan Komives, Raffaele Viglianti
* 
* See README for details of this library
* 
* Copyright © 2012, 2013 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
* University of Maryland
* 
* Licensed under the Apache License, Version 2.0 (the "License"); you
* may not use this file except in compliance with the License.  You may
* obtain a copy of the License at
* 
*    http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
* implied.  See the License for the specific language governing
* permissions and limitations under the License.
***/
var MeiLib={};MeiLib.JSON={};MeiLib.RuntimeError=function(a,b){this.errorcode=a;this.message=b};MeiLib.RuntimeError.prototype.toString=function(){return"MeiLib.RuntimeError: "+this.errorcode+": "+this.message?this.message:""};MeiLib.createPseudoUUID=function(){return("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).substr(-4)};MeiLib.EventEnumerator=function(a){this.init(a)};MeiLib.EventEnumerator.prototype.init=function(a){if(!a){throw new MeiLib.RuntimeError("MeiLib.EventEnumerator.init():E01","node is null or undefined")}this.node=a;this.next_evnt=null;this.EoI=true;this.children=$(this.node).children();this.i_next=-1;this.read_ahead()};MeiLib.EventEnumerator.prototype.nextEvent=function(){if(!this.EoI){var a=this.next_evnt;this.read_ahead();return a}throw new MeiLib.RuntimeError("MeiLib.LayerEnum:E01","End of Input.")};MeiLib.EventEnumerator.prototype.read_ahead=function(){if(this.beam_enumerator){if(!this.beam_enumerator.EoI){this.next_evnt=this.beam_enumerator.nextEvent();this.EoI=false}else{this.EoI=true;this.beam_enumerator=null;this.step_ahead()}}else{this.step_ahead()}};MeiLib.EventEnumerator.prototype.step_ahead=function(){++this.i_next;if(this.i_next<this.children.length){this.next_evnt=this.children[this.i_next];var a=$(this.next_evnt).prop("localName");if(a==="note"||a==="rest"||a==="mRest"||a==="chord"){this.EoI=false}else{if(a==="beam"){this.beam_enumerator=new MeiLib.EventEnumerator(this.next_evnt);if(!this.beam_enumerator.EoI){this.next_evnt=this.beam_enumerator.nextEvent();this.EoI=false}else{this.EoI=true}}}}else{this.EoI=true}};MeiLib.durationOf=function(f,c){IsSimpleEvent=function(g){return(g==="note"||g==="rest"||g==="space")};var e=function(h,i){var g=$(h).attr("dur");if(!g){throw new MeiLib.RuntimeError("MeiLib.durationOf:E04","@dur of <note>, <rest> or <space> must be specified.")}return MeiLib.dotsMult(h)*MeiLib.dur2beats(Number(g),i)};var d=function(j,h,i){if(!i){i="1"}var g=$(j).attr("dur");var k=MeiLib.dotsMult(j);if(g){return k*MeiLib.dur2beats(Number(g),h)}$(j).find("note").each(function(){lyr_n=$(this).attr("layer");if(!lyr_n||lyr_n===i){var m=$(this).attr("dur");var l=MeiLib.dotsMult(j);if(!g&&m){g=m;k=l}else{if(g&&g!=m){throw new MeiLib.RuntimeError("MeiLib.durationOf:E05","duration of <chord> is ambiguous.")}}}});if(g){return k*MeiLib.dur2beats(Number(g),h)}throw new MeiLib.RuntimeError("MeiLib.durationOf:E06","@dur of chord must be specified either in <chord> or in at least one of its <note> elements.")};var a=function(g,i){var h=0;g.children().each(function(){var l;var k;var j=this.prop("localName");if(IsSimpleEvent(j)){l=e(this,i)}else{if(j==="chord"){l=d(this,i)}else{throw new MeiLib.RuntimeError("MeiLib.durationOf:E03","Not supported element '"+j+"'")}}h+=l});return h};var b=$(f).prop("localName");if(IsSimpleEvent(b)){return e(f,c)}else{if(b==="mRest"){return c.count}else{if(b==="chord"){return d(f,c)}else{if(b==="beam"){return a(f,c)}else{throw new MeiLib.RuntimeError("MeiLib.durationOf:E05","Not supported element: '"+b+"'")}}}}};MeiLib.tstamp2id=function(i,h,c){var j=Number(i);var b=0;var f=function(){return b+1};var g=function(){return j-f()};var a=new MeiLib.EventEnumerator(h);var n;var l;var k;var d;while(!a.EoI&&(l===undefined||l>0)){k=n;d=l;n=a.nextEvent();l=g();b+=MeiLib.durationOf(n,c)}if(l===undefined){return undefined}var e;if(l<0){if(k&&d<Math.abs(l)){e=k}else{e=n}}else{e=n}var m;m=$(e).attr("xml:id");if(!m){m=MeiLib.createPseudoUUID();$(e).attr("xml:id",m)}return m};MeiLib.XMLID=function(a){xml_id=$(a).attr("xml:id");if(!xml_id){xml_id=MeiLib.createPseudoUUID();$(a).attr("xml:id",xml_id)}return xml_id};MeiLib.id2tstamp=function(b,d){var f;var e=false;for(var c=0;c<d.length&&!e;++c){if(d[c].meter){f=d[c].meter}if(c===0&&!f){throw new MeiLib.RuntimeError("MeiLib.id2tstamp:E001","No time signature specified")}var a=MeiLib.sumUpUntil(b,d[c].layer,f);if(a.found){e=true;return c.toString()+"m"+"+"+(a.beats+1).toString()}}throw new MeiLib.RuntimeError("MeiLib.id2tstamp:E002",'No event with xml:id="'+b+'" was found in the given MEI context.')};MeiLib.dur2beats=function(a,b){return(b.unit/a)};MeiLib.beats2dur=function(a,b){return(b.unit/a)};MeiLib.dotsMult=function(a){var c=$(a).attr("dots");c=Number(c||"0");var b=1;for(;c>0;--c){b+=(1/Math.pow(2,c))}return b};MeiLib.sumUpUntil=function(b,c,d){var a=function(o){var g=$(o);var l=g.prop("localName");if(l==="note"||l==="rest"){if(g.attr("xml:id")===b){return{beats:0,found:true}}else{var e=Number(g.attr("dur"));if(!e){throw new MeiLib.RuntimeError("MeiLib.sumUpUntil:E001","Duration is not a number ('breve' and 'long' are not supported).")}var j=g.attr("dots");j=Number(j||"0");var m=MeiLib.dotsMult(g)*MeiLib.dur2beats(e,d);return{beats:m,found:false}}}else{if(l==="mRest"){if(g.attr("xml:id")===b){p=true;return{beats:0,found:true}}else{return{beats:d.count,found:false}}}else{if(l==="layer"||l==="beam"){var m=0;var f=g.children();var p=false;for(var h=0;h<f.length&&!p;++h){var k=a(f[h]);m+=k.beats;p=k.found}return{beats:m,found:p}}else{if(l==="chord"){var n=g.attr("dur");if(g.attr("xml:id")===b){return{beats:0,found:true}}else{var n=g.attr("dur");if(n){if(g.find("[xml\\:id='"+b+"']").length){return{beats:0,found:true}}else{return{beats:MeiLib.dur2beats(n,d),found:p}}}else{var f=g.children();var p=false;for(var h=0;h<f.length&&!p;++h){var k=a(f[h]);m=k.beats;p=k.found}return{beats:m,found:p}}}}}}}return{beats:0,found:false}};return a(c)};MeiLib.App=function(a,b){this.xmlID=a;this.variants=[];this.parentID=b};MeiLib.AppReplacement=function(b,a){this.tagname=b;this.xmlID=a};MeiLib.Variant=function(a,c,b){this.xmlID=a;this.tagname=c;this.source=b};MeiLib.VariantMei=function(a){if(a){this.init(a)}};MeiLib.VariantMei.prototype.init=function(a){this.xmlDoc=a;this.head=a.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei","meiHead");this.score=a.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei","score");this.parseSourceList();this.parseAPPs()};MeiLib.VariantMei.prototype.getVariantScore=function(){return this.score};MeiLib.VariantMei.prototype.getAPPs=function(){return this.APPs};MeiLib.VariantMei.prototype.getSourceList=function(){return this.sourceList};MeiLib.VariantMei.prototype.parseSourceList=function(){var d=$(this.head).find("sourceDesc").children();this.sourceList={};var a;for(a=0;a<d.length;++a){var e=d[a];var c=$(e).attr("xml:id");var b=new XMLSerializer();this.sourceList[c]=b.serializeToString(e)}return this.sourceList};MeiLib.VariantMei.prototype.parseAPPs=function(){this.APPs={};var b=$(this.score).find("app");for(var f=0;f<b.length;f++){var c=b[f];var k=c.parentNode;var g=$(c).find("rdg, lem");var h=new MeiLib.App(MeiLib.XMLID(c),MeiLib.XMLID(k));h.variants={};for(var e=0;e<g.length;e++){var d=g[e];var a=$(d).attr("source");var m=$(d).prop("localName");var l=MeiLib.XMLID(d);h.variants[l]=new MeiLib.Variant(l,m,a)}this.APPs[MeiLib.XMLID(c)]=h}};MeiLib.VariantMei.prototype.getSlice=function(b){var a=new MeiLib.VariantMei();a.xmlDoc=this.xmlDoc;a.head=this.head;a.score=[MeiLib.SliceMEI(this.score[0],b)];a.sourceList=this.sourceList;a.APPs=this.APPs;return a};MeiLib.SingleVariantPathScore=function(a,b){this.init(a,b)};MeiLib.SingleVariantPathScore.prototype.init=function(c,g){g=g||{};this.variant_score=c.score[0];this.APPs=c.APPs;this.score=this.variant_score.cloneNode(true);this.variantPath={};var b=$(this.score).find("app");var e;var i;var d=this.score;var f=this.variantPath;var a=this.APPs;var h=c.xmlDoc;$(b).each(function(m,k){var p=MeiLib.XMLID(k);var j=g[p];if(j){i=j.xmlID;var t=j.tagname;var q=$(d).find(t+'[xml\\:id="'+i+'"]')[0];if(!q){throw new MeiLib.RuntimeError("MeiLib.SingleVariantPathScore.prototype.init():E01","Cannot find <lem> or <rdg> with @xml:id '"+i+"'.")}e=q.childNodes}else{var o=$(k).find("lem")[0];if(o){i=MeiLib.XMLID(o);e=o.childNodes}else{var n=$(k).find("rdg")[0];i=MeiLib.XMLID(n);e=n.childNodes}}var s=k.parentNode;var r=h.createProcessingInstruction("MEI2VF",'rdgStart="'+p+'"');s.insertBefore(r,k);$.each(e,function(){s.insertBefore(this.cloneNode(true),k)});var l=h.createProcessingInstruction("MEI2VF",'rdgEnd="'+p+'"');s.insertBefore(l,k);s.removeChild(k);f[p]=a[p].variants[i]});return this.score};MeiLib.SingleVariantPathScore.prototype.updateVariantPath=function(b){for(appID in b){var a=this.APPs[appID].variants[b[appID]];this.replaceVariantInstance({appXmlID:appID,replaceWith:a})}};MeiLib.SingleVariantPathScore.prototype.replaceVariantInstance=function(e){var j=e.replaceWith.xmlID;var k=$(this.variant_score).find(e.replaceWith.tagname+'[xml\\:id="'+j+'"]')[0];var f=e.appXmlID;var g=k.childNodes;var b=function(m,n){m=m.replace("'",'"');n=n.replace("'",'"');return m===n};var h=$(this.score).find("[xml\\:id="+this.APPs[f].parentID+"]")[0];var c=h.childNodes;var a=false;var l=false;var i=null;$(c).each(function(){var m=this;if(m.nodeType===7){if(m.nodeName==="MEI2VF"&&b(m.nodeValue,'rdgStart="'+f+'"')){a=true;l=true}else{if(m.nodeName==="MEI2VF"&&b(m.nodeValue,'rdgEnd="'+f+'"')){a=false;i=m}}}else{if(a){h.removeChild(m)}}});if(!l){throw"processing instruction not found"}if(a){throw"Unmatched <?MEI2VF rdgStart?>"}var d;if(i){d=function(m){h.insertBefore(m,i)}}else{d=function(m){h.appendChild(m)}}$.each(g,function(){d(this.cloneNode(true))});this.variantPath[f]=e.replaceWith;return this.score};MeiLib.SingleVariantPathScore.prototype.getSlice=function(a){return MeiLib.SliceMEI(this.score,a)};MeiLib.SliceMEI=function(f,d){var p=function(i,q){$.each(i,function(r,s){if(q.noClef){$(s).attr("clef.visible","false")}if(q.noKey){$(s).attr("key.sig.show","false")}if(q.noMeter){$(s).attr("meter.rend","false")}})};var m=d.staves;if(m){var j="";var c="";var b="";for(var e=0;e<m.length;e++){j+=b+'[n="'+m[e]+'"]';c+=b+'[staff="'+m[e]+'"]';if(e===0){b=", "}}}var l=f.cloneNode(true);var o;if(m){$(l).find("staffDef").remove(":not("+j+")")}if(d.noClef||d.noKey||d.noMeter){var h=$(l).find("staffDef");var o=$(l).find("scoreDef");p(o,d);p(h,d)}if(d.noConnectors){$(l).find("staffGrp").removeAttr("symbol")}var k=$(l).find("section")[0];var g=false;var n=false;var a=k.childNodes;$(a).each(function(){var q=this;if(!g){if(q.localName==="measure"&&Number($(q).attr("n"))===d.start_n){g=true;n=true}else{k.removeChild(q)}}if(g){if(m){$(q).find("[staff]").remove(":not("+c+")");var i=$(q).find("staff");$(i).each(function(){var r=this;if($.inArray(Number($(r).attr("n")),m)===-1){var s=this.parentNode;s.removeChild(this)}})}if(q.localName==="measure"&&Number($(q).attr("n"))===d.end_n){g=false}}});return l};mei2vexflowTables={};mei2vexflowTables.positions={"above":Vex.Flow.Modifier.Position.ABOVE,"below":Vex.Flow.Modifier.Position.BELOW};mei2vexflowTables.hairpins={"cres":Vex.Flow.StaveHairpin.type.CRESC,"dim":Vex.Flow.StaveHairpin.type.DECRESC};mei2vexflowTables.articulations={"acc":"a>","stacc":"a.","ten":"a-","stacciss":"av","marc":"a^","dnbow":"am","upbow":"a|","snap":"ao","lhpizz":"a+","dot":"a.","stroke":"a|"};Node.prototype.attrs=function(){var b;var a={};for(b in this.attributes){a[this.attributes[b].name]=this.attributes[b].value}return a};Array.prototype.all=function(b){b=b||function(c){return c==true};var a;for(a=0;a<this.length;a++){if(b(this[a])===false){return false}}return true};Array.prototype.any=function(b){b=b||function(c){return c==true};var a;for(a=0;a<this.length;a++){if(b(this[a])===true){return true}}return false};MEI2VF={};MEI2VF.RUNTIME_ERROR=function(a,b){this.error_code=a;this.message=b};MEI2VF.RUNTIME_ERROR.prototype.toString=function(){return"MEI2VF.RUNTIME_ERROR: "+this.error_code+": "+this.message};MEI2VF.render_notation=function(F,T,aq,p){var aq=aq||800;var p=p||350;var L;var a;var av=13;var ac;var ap=[];var q=[];var au=[];var P=[];var k={};var f=[];var ah=[];var D=[];var B=[];var ag=[];var ae=50;var aC=20;var aB=0;var al=aC;var z=0;var G=0;var ay=0;var b=false;var ad=true;var M=new Array();var at=[];var aE=0;var h={};var E=new MEI2VF.StaveVoices();var O=function(aG){Vex.Log("count_measures_siblings_till_sb() {}");if(aG.length===0){return 0}switch($(aG).prop("localName")){case"measure":return 1+O($(aG).next());case"sb":return 0;default:return O($(aG).next())}};var X=function(aG){L=O(aG);a=Math.round((aq-aC)/L);Vex.LogDebug("update_measure_width(): "+L+", width:"+a)};var r=function(aG){X(aG);Vex.LogDebug("startSystem() {enter}");if(ad){ay=0;al=aC;G+=1;aB=z+ae*(aB>0?1:0);ad=false;b=false;$.each(M,function(aH,aI){if(aI){aI.renderWith.clef=true;aI.renderWith.keysig=true;aI.renderWith.timesig=true}})}else{if(b){ay=0;al=aC;G+=1;aB=z+ae;b=false;$.each(M,function(aH,aI){if(aI){aI.renderWith.clef=true;aI.renderWith.keysig=true}})}}};var n=function(){if(ap[ap.length-1]){var aG=ap[ap.length-1][0];al=aG.x+aG.width;Vex.LogDebug("moveOneMeasure(): measure_left:"+al)}else{al=aC}};var N=function(){return(ad||b)};var I=function(aH,aI){var aG=ai(aH,aI);if(!aG){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.MissingAttribute","Attribute "+aI+" is mandatory.")}return aG};var ai=function(aH,aI){var aG=$(aH).attr(aI);return aG};var H=function(aH){aH=(typeof aH==="number"&&arguments.length===2&&typeof arguments[1]==="object")?arguments[1]:aH;var aI=$(aH).attr("pname");var aG=$(aH).attr("oct");if(!aI||!aG){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.MissingAttribute","pname and oct attributes must be specified for <note>")}return aI+"/"+aG};var aw=function(aG){var aI=$(aG).find("syl");var aH="";$(aI).each(function(aK,aL){var aM=($(aL).attr("wordpos")=="i"||$(aL).attr("wordpos")=="m")?"-":"";aH+=(aK>0?"\n":"")+$(aL).text()+aM});var aJ=(aI.attr("wordpos")=="i"||aI.attr("wordpos")=="m")?"-":"";return aH};var s=function(aK,aH){var aI=$(aK).find("dir");var aG="";var aJ="";$(aI).each(function(){var aN=I(this,"startid");var aM=I(aH,"xml:id");var aL=I(this,"place");if(aN===aM){aG+=$(this).text().trim();aJ=aL}});return[aG,aJ]};var S=function(aH,aG){aH={pitch:aH.split("/")[0][0],octave:Number(aH.split("/")[1])};aG={pitch:aG.split("/")[0][0],octave:Number(aG.split("/")[1])};if(aH.octave===aG.octave){if(aH.pitch===aG.pitch){return 0}else{if(aH.pitch<aG.pitch){return -1}else{if(aH.pitch>aG.pitch){return 1}}}}else{if(aH.octave<aG.octave){return -1}else{if(aH.octave>aG.octave){return 1}}}};var az=function(aG){aG=String(aG);if(aG==="breve"){if(Vex.Flow.durationToTicks.durations["0"]!=undefined){return"0"}return"w"}if(aG==="1"){return"w"}if(aG==="2"){return"h"}if(aG==="4"){return"q"}if(aG==="8"){return"8"}if(aG==="16"){return"16"}if(aG==="32"){return"32"}if(aG==="64"){return"64"}throw new Vex.RuntimeError("BadArguments",'The MEI duration "'+aG+'" is not supported.')};var i=function(aG,aJ){aJ=aJ||true;aG=(typeof aG==="number"&&arguments.length===2&&typeof arguments[1]==="object")?arguments[1]:aG;var aH=$(aG).attr("dur");if(aH===undefined){alert("Could not get duration from:\n"+JSON.stringify(aG,null,"\t"))}var aI=az(aH);if(aJ===true&&$(aG).attr("dots")==="1"){aI+="d"}return aI};var U=function(aG){if(aG==="n"){return"n"}if(aG==="f"){return"b"}if(aG==="s"){return"#"}if(aG==="ff"){return"bb"}if(aG==="ss"){return"##"}throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadAttributeValue","Invalid attribute value: "+aG)};var W=function(aH,aG){var aI=$(aH).attr("stem.dir");if(aI!==undefined){return(aI==="up")?Vex.Flow.StaveNote.STEM_UP:(aI==="down")?Vex.Flow.StaveNote.STEM_DOWN:undefined}else{var aJ=J($(aG).attr("n"));if(aJ==="treble"){return(S("a/5",H(aH))===1)?Vex.Flow.StaveNote.STEM_UP:Vex.Flow.StaveNote.STEM_DOWN}else{if(aJ==="bass"){return(S("c/3",H(aH))===-1)?Vex.Flow.StaveNote.STEM_DOWN:Vex.Flow.StaveNote.STEM_UP}}}};var ao=function(aG){if($(aG).attr("key.pname")!==undefined){var aJ=$(aG).attr("key.pname").toUpperCase();var aI=$(aG).attr("key.accid");if(aI!==undefined){switch(aI){case"s":aJ+="#";break;case"f":aJ+="b";break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.UnexpectedAttributeValue","Value of key.accid must be 's' or 'f'")}}var aH=$(aG).attr("key.mode");if(aH!==undefined){aJ+=aH==="major"?"":"m"}return aJ}else{return"C"}};var g=function(aG){var aH=I(aG,"clef.shape");var aK=ai(aG,"clef.line");var aI=ai(aG,"clef.dis");var aJ=ai(aG,"clef.dis.place");if(aH==="G"&&(!aK||aK==="2")){if(aI==="8"&&aJ==="below"&&Vex.Flow.clefProperties.values["octave"]!=undefined){return"octave"}return"treble"}else{if(aH==="F"&&(!aK||aK==="4")){return"bass"}else{if(aH==="C"&&aK==="3"){return"alto"}else{if(aH==="C"&&aK==="4"){return"tenor"}else{throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported",'Clef definition is not supported: [ clef.shape="'+aH+'" '+(aK?('clef.line="'+aK+'"'):"")+" ]")}}}}};var J=function(aG){if(aG>=M.length){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.staff_clef():E01","No staff definition for staff n="+aG)}var aH=M[aG].staffDef;return g(aH)};var aF=function(aG){if($(aG).attr("meter.count")!==undefined&&$(aG).attr("meter.unit")!==undefined){return $(aG).attr("meter.count")+"/"+$(aG).attr("meter.unit")}};var ak=function(aG){var aH=new Vex.Flow.Renderer(aG,Vex.Flow.Renderer.Backends.CANVAS);ac=aH.getContext()};var x=function(aG){return 100};var l=function(aI){var aG=0;var aH;for(aH=0,exit=0;aH<at.length&&!exit;aH++){if($(at[aH]).attr("n")!==aI.toString()){aG+=x(aH)}else{exit=true}}return aG};var j=function(aI){var aG=aB+l(aI);var aH=aG+x(aI);if(aH>z){z=aH}return aG};var af=function(aI,aH){if(!aI){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArgument",'Cannot render staff without attribute "n".')}var aJ=M[aI].staffDef;var aG=new Vex.Flow.Stave(al,j(aI),aH);if(M[aI].renderWith.clef){if($(aJ).attr("clef.visible")==="true"||$(aJ).attr("clef.visible")===undefined){aG.addClef(g(aJ));M[aI].renderWith.clef=false}}if(M[aI].renderWith.keysig){if($(aJ).attr("key.sig.show")==="true"||$(aJ).attr("key.sig.show")===undefined){aG.addKeySignature(ao(aJ))}M[aI].renderWith.keysig=false}if(M[aI].renderWith.timesig){if($(aJ).attr("meter.rend")==="norm"||$(aJ).attr("meter.rend")===undefined){aG.addTimeSignature(aF(aJ))}M[aI].renderWith.timesig=false}aG.setContext(ac).draw();aE=aG.bar_x_shift;Vex.LogDebug("initialise_staff_n(): staffXShift="+aE);return aG};var aj=function(){var aG=$(F).find("scoreDef")[0];if(!aG){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadMEIFile","No <scoreDef> found.")}u(aG);$(F).find("section").children().each(R);$.each(au,function(aI,aH){aH.setContext(ac).draw()});Q(ah);Q(D);aD(B)};var Q=function(aG){$(aG).each(function(aK,aL){var aI=k[aL.getFirstId()];var aM=k[aL.getLastId()];var aJ;if(aI){aJ=aI.vexNote}var aH;if(aM){aH=aM.vexNote}new Vex.Flow.StaveTie({first_note:aJ,last_note:aH}).setContext(ac).draw()})};var aD=function(aG){$(aG).each(function(aJ,aO){var aP=k[aO.getFirstId()];var aL=k[aO.getLastId()];var aN;if(aP){aN=aP.vexNote}var aH;if(aL){aH=aL.vexNote}var aI=mei2vexflowTables.positions[aO.params.place];var aM=mei2vexflowTables.hairpins[aO.params.form];var aK=0;var aR=0;var aQ={height:10,y_shift:0,left_shift_px:aK,r_shift_px:aR};new Vex.Flow.StaveHairpin({first_note:aN,last_note:aH,},aM).setContext(ac).setRenderOptions(aQ).setPosition(aI).draw()})};var ax=function(){for(var aJ in h){var aK=h[aJ];var aG=aK.vexType();var aH=f[aK.top_staff_n];var aI=f[aK.bottom_staff_n];if(aG&&aH&&aI){var aL=new Vex.Flow.StaveConnector(aH,aI);aL.setType(aK.vexType());aL.setContext(ac);aL.draw()}}};var R=function(aG,aI){switch($(aI).prop("localName")){case"measure":var aH;if(N()){r(aI);aH=true}else{n();aH=false}E.reset();v(aI);if(aH){ax();aH=false}E.format(a-aE-20);E.draw(ac,f);aA(aI,"tie",ah);aA(aI,"slur",D);aA(aI,"hairpin",B);break;case"scoreDef":u(aI);break;case"staffDef":y(aI);break;case"sb":ab(aI);break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported","Element <"+$(aI).prop("localName")+"> is not supported in <section>")}};var ab=function(aG){b=true};var u=function(aG){at.length=0;$(aG).children().each(Z)};var Z=function(aG,aH){switch($(aH).prop("localName")){case"staffGrp":c(aH);break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported","Element <"+$(aH).prop("localName")+"> is not supported in <scoreDef>")}};var c=function(aI){var aG={};var aH=aI.attrs().symbol;$(aI).children().each(function(aK,aL){var aJ=am(aK,aL);Vex.LogDebug("process_staffGrp() {1}.{a}: local_result.first_n:"+aJ.first_n+" local_result.last_n:"+aJ.last_n);if(aK===0){aG.first_n=aJ.first_n;aG.last_n=aJ.last_n}else{aG.last_n=aJ.last_n}});Vex.LogDebug("process_staffGrp() {2}: symbol:"+aH+" result.first_n:"+aG.first_n+" result.last_n:"+aG.last_n);h[aG.first_n.toString()+":"+aG.last_n.toString()]=new MEI2VF.StaveConnector(aH,aG.first_n,aG.last_n);return aG};var am=function(aG,aI){switch($(aI).prop("localName")){case"staffDef":var aH=y(aI);return{first_n:aH,last_n:aH};break;case"staffGrp":return c(aI);break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported","Element <"+$(aI).prop("localName")+"> is not supported in <staffGrp>")}};var y=function(aG){var aH=Number(aG.attrs().n);var aI=M[aH];if(aI){M[aH].updateDef(aG)}else{M[aH]=new MEI2VF.StaffInfo(aG,true,true,true)}at.push(aG);return aH};var v=function(aG){ap.push($(aG).find("staff").map(function(aI,aH){return an(aI,aH,aG)}).get())};var an=function(aJ,aM,aL){var aP,aH,aO;var aI=Number(aM.attrs().n);var aG=Number(aL.attrs().n);aP=af(aI,a);var aN=$(aM).find("layer").map(function(aR,aQ){return Y(aR,aQ,aM,aL)}).get();var aK=[];$(aN).each(function(){var aQ=$(this.events).get().map(function(aR){return aR.vexNote?aR.vexNote:aR});E.addVoice(V(null,aQ),aI)});f[aI]=aP;if(q[aG]===undefined){q[aG]=[]}q[aG][aI]=aP;return aP};var Y=function(aJ,aK,aM,aL){var aG=aL.attrs().n;if(!aG){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_events:","<measure> must have @n specified")}var aI=aM.attrs().n;if(!aI){aI="1"}var aH=aK.attrs().n;if(!aH){aH="1"}var aN=M[aI].staffDef;var aO=aG+":"+aI+":"+aH;if(ag[aO]){$(ag[aO]).each(function(aP,aQ){var aS=$(aN).attr("meter.count");var aR=$(aN).attr("meter.unit");var aT={count:Number(aS),unit:Number(aR)};aQ.setContext({layer:aK,meter:aT});ag[aO][aP]=null});ag[aO]=null}return{layer:aJ,events:$(aK).children().map(function(aQ,aP){return K(aP,aK,aM,aL)}).get()}};var aA=function(aM,aN,aI){var aG=function(aQ){var aP=aQ.attrs().staff;if(!aP){aP="1"}var aO=aQ.attrs().layer;if(!aO){aO="1"}return{staff_n:aP,layer_n:aO}};var aH=function(aS,aQ,aO){var aU=aG(aQ);var aW=$(aO).find('staff[n="'+aU.staff_n+'"]');var aR=$(aW).find('layer[n="'+aU.layer_n+'"]').get(0);if(!aR){var aV=$(aW).find("layer");if(aV&&!aV.attr("n")){aR=aV}if(!aR){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_linkingElements:E01","Cannot find layer")}}var aT=M[aU.staff_n].staffDef;if(!aT){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_linkingElements:E02","Cannot determine staff definition.")}var aP={count:Number(aT.attrs()["meter.count"]),unit:Number(aT.attrs()["meter.unit"])};if(!aP.count||!aP.unit){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_linkingElements:E03","Cannot determine meter; missing or incorrect @meter.count or @meter.unit.")}return MeiLib.tstamp2id(aS,aR,aP)};var aL=function(aP){var aO;return aP.substring(0,aP.indexOf("m"))};var aJ=function(aP){var aO;return aP.substring(aP.indexOf("+")+1)};var aK=$(aM).find(aN);$.each(aK,function(aY,aW){var aR=new MEI2VF.EventLink(null,null);if(aN==="hairpin"){var aQ=aW.attrs().form;if(!aQ){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:extract_linkingElements","@form is mandatory in <hairpin> - make sure the xml is valid.")}var aU=aW.attrs().place;aR.setParams({form:aQ,place:aU})}var aT=aW.attrs().startid;if(aT){aR.setFirstId(aT)}else{var aZ=aW.attrs().tstamp;if(aZ){aT=aH(aZ,aW,aM);aR.setFirstId(aT)}else{}}var aX=aW.attrs().endid;if(aX){aR.setLastId(aX)}else{var aV=aW.attrs().tstamp2;if(aV){var aS=Number(aL(aV));if(aS>0){aR.setLastTStamp(aJ(aV));var aP=aG(aW);var aO=aM.attrs().n;var a0=Number(aO)+aS;var a1=a0.toString()+":"+aP.staff_n+":"+aP.layer_n;if(!ag[a1]){ag[a1]=new Array()}ag[a1].push(aR)}else{aX=aH(aJ(aV),aW,aM);aR.setLastId(aX)}}else{}}aI.push(aR)})};var t=function(aJ,aI,aG){var aH=new MEI2VF.EventLink(aJ,aI);aG.push(aH)};var w=function(aJ,aG,aH){var aI=new MEI2VF.EventLink(aJ,null);aI.setParams({linkCond:aG});aH.push(aI)};var A=function(aL,aG){var aH=function(aN,aM){return(aN&&aM&&aN.pname===aM.pname&&aN.oct===aM.oct&&aN.system===aM.system)};if(!aG.pname||!aG.oct){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:TermTie01","no pitch or specified for the tie")}var aK=false;var aI;var aJ;for(aI=0;!aK&&aI<ah.length;++aI){aJ=ah[aI];if(!aJ.getLastId()){if(aH(aJ.params.linkCond,aG)){aK=true;aJ.setLastId(aL)}else{}}}if(!aK){var aJ=new MEI2VF.EventLink(null,aL);ah.push(aJ)}};var e=function(aM,aG){var aI=function(aO,aN){return aO.nesting_level===aN.nesting_level&&aO.system===aN.system};var aL=false;var aK=0;var aH;for(aK=0;!aL&&aK<D.length;++aK){var aJ=D[aK];if(aJ&&!aJ.getLastId()&&aI(aJ.params.linkCond,aG)){aL=true;aJ.setLastId(aM)}}if(!aL){var aJ=new MEI2VF.EventLink(null,aM);D.push(aJ)}};var d=function(aH){var aG=[];var aI=aH.split(" ");$.each(aI,function(aK,aL){var aJ;if(aL.length===1){aG.push({letter:aL,nesting_level:0})}else{if(aL.length===2){if(!(aJ=Number(aL[1]))){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:ParseSlur01","badly formed slur attribute")}aG.push({letter:aL[0],nesting_level:aJ})}else{throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:ParseSlur01","badly formed slur attribute")}}});return aG};var m=function(aH,aM,aX,aO){var aV=function(aY){return(new Vex.Flow.Annotation(aY)).setFont("Times",av).setBottom(true)};var aG=function(aY){return(new Vex.Flow.Annotation(aY)).setFont("Times",av)};try{var aJ=new Vex.Flow.StaveNote({keys:[H(aH)],clef:J($(aX).attr("n")),duration:i(aH),stem_direction:W(aH,aX)});aJ.addAnnotation(2,aV(aw(aH)));var aP=s(aO,aH);aJ.addAnnotation(2,aP[1]=="below"?aV(aP[0]):aG(aP[0]));try{var aW;for(aW=0;aW<parseInt($(aH).attr("dots"));aW++){aJ.addDotToAll()}}catch(aQ){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the dots of <note>: "+JSON.stringify(aH.attrs())+'. "'+aQ.toString()+'"')}var aL=$(aH).attr("accid");if(aL){aJ.addAccidental(0,new Vex.Flow.Accidental(U(aL)))}$.each($(aH).find("artic"),function(aZ,aY){aJ.addArticulation(0,new Vex.Flow.Articulation(mei2vexflowTables.articulations[$(aY).attr("artic")]).setPosition(mei2vexflowTables.positions[$(aY).attr("place")]))});$.each($(aH).children(),function(aY,aZ){$(aZ).remove()});var aN=$(aH).attr("xml:id");if(!aN){aN=MeiLib.createPseudoUUID();$(aH).attr("xml:id",aN)}var aR=$(aH).attr("tie");if(!aR){aR=""}var aI=$(aH).attr("pname");if(!aI){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments","mei:note must have pname attribute")}var aU=$(aH).attr("oct");if(!aU){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments","mei:note must have oct attribute")}for(var aW=0;aW<aR.length;++aW){switch(aR[aW]){case"i":w(aN,{pname:aI,oct:aU,system:G},ah);break;case"t":A(aN,{pname:aI,oct:aU,system:G});break}}var aK=$(aH).attr("slur");if(aK){var aS=d(aK);$.each(aS,function(aZ,aY){switch(aY.letter){case"i":w(aN,{nesting_level:aY.nesting_level,system:G},D);break;case"t":e(aN,{nesting_level:aY.nesting_level,system:G});break}})}var aT={vexNote:aJ,id:aN};P.push(aT);k[aN]={meiNote:aH,vexNote:aJ};return aT}catch(aQ){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <note>: "+JSON.stringify(aH.attrs())+'. "'+aQ.toString()+'"')}};var aa=function(aJ,aI,aH,aL){try{var aK=new Vex.Flow.StaveNote({keys:["c/5"],duration:i(aJ,false)+"r"});if($(aJ).attr("dots")==="1"){aK.addDotToAll()}return aK}catch(aG){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <rest>: "+JSON.stringify(aJ.attrs())+'. "'+aG.toString()+'"')}};var ar=function(aJ,aI,aH,aL){try{var aK=new Vex.Flow.StaveNote({keys:["c/5"],duration:"wr"});return aK}catch(aG){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <mRest>: "+JSON.stringify(aJ.attrs())+'. "'+aG.toString()+'"')}};var o=function(aI,aH,aG,aK){var aJ=$(aI).children().map(function(aL,aM){var aN=K(aM,aH,aG,aK);return aN.vexNote?aN.vexNote:aN}).get();au.push(new Vex.Flow.Beam(aJ));return aJ};var C=function(aJ,aG,aM,aL){try{var aO=$(aJ).children().map(H).get();var aH=az(Math.max.apply(Math,$(aJ).children().map(function(){return Number($(this).attr("dur"))}).get()));var aK=$(aJ).children().map(function(){return $(this).attr("dots")==="1"}).get().any();if(aK===true){aH+="d"}var aI=new Vex.Flow.StaveNote({keys:aO,clef:J($(aM).attr("n")),duration:aH});if(aK===true){aI.addDotToAll()}$(aJ).children().each(function(aQ,aR){var aP=$(aR).attr("accid");if(aP!==undefined){aI.addAccidental(aQ,new Vex.Flow.Accidental(U(aP)))}});return aI}catch(aN){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <chord>:"+aN.toString())}};var K=function(aI,aH,aG,aK){var aJ=$(aI).prop("localName");if(aJ==="rest"){return aa(aI,aH,aG,aK)}else{if(aJ==="mRest"){return ar(aI,aH,aG,aK)}else{if(aJ==="note"){return m(aI,aH,aG,aK)}else{if(aJ==="beam"){return o(aI,aH,aG,aK)}else{if(aJ==="chord"){return C(aI,aH,aG,aK)}else{throw new Vex.RuntimeError("BadArguments",'Rendering of element "'+aJ+'" is not supported.')}}}}}};var V=function(aH,aG){if(!$.isArray(aG)){throw new Vex.RuntimeError("BadArguments","make_voice() voice_contents argument must be an array.")}var aI=new Vex.Flow.Voice({num_beats:Number($(F).find("staffDef").attr("meter.count")),beat_value:Number($(F).find("staffDef").attr("meter.unit")),resolution:Vex.Flow.RESOLUTION});aI.setStrict(false);aI.addTickables(aG);return aI};ak(T);aj();MEI2VF.rendered_measures=q};MEI2VF.EventLink=function(b,a){this.init(b,a)};MEI2VF.EventLink.prototype.init=function(b,a){this.first_ref=new MEI2VF.EventReference(b);this.last_ref=new MEI2VF.EventReference(a);this.params={}};MEI2VF.EventLink.prototype.setParams=function(a){this.params=a};MEI2VF.EventLink.prototype.setFirstRef=function(a){this.first_ref=a};MEI2VF.EventLink.prototype.setLastRef=function(a){this.last_ref=a};MEI2VF.EventLink.prototype.setFirstId=function(a){this.first_ref.setId(a)};MEI2VF.EventLink.prototype.setLastId=function(a){this.last_ref.setId(a)};MEI2VF.EventLink.prototype.setFirstTStamp=function(a){this.first_ref.setTStamp(a)};MEI2VF.EventLink.prototype.setLastTStamp=function(a){this.last_ref.setTStamp(a)};MEI2VF.EventLink.prototype.setContext=function(a){this.meicontext=a};MEI2VF.EventLink.prototype.getFirstId=function(){return this.first_ref.getId({meicontext:this.meicontext})};MEI2VF.EventLink.prototype.getLastId=function(){return this.last_ref.getId({meicontext:this.meicontext})};MEI2VF.EventReference=function(a){this.xmlid=a};MEI2VF.EventReference.prototype.setId=function(a){this.xmlid=a};MEI2VF.EventReference.prototype.setTStamp=function(a){this.tstamp=a;if(this.xmlid){this.tryResolveReference(true)}};MEI2VF.EventReference.prototype.tryResolveReference=function(b){var a=this.tstamp;var c=this.meicontext;if(!a){throw new MEI2VF.RUNTIME_ERROR("MEI2VF:RERR:BADARG:EventRef001","EventReference: tstamp must be set in order to resolve reference.")}if(this.meicontext){this.xmlid=MeiLib.tstamp2id(this.tstamp,this.meicontext.layer,this.meicontext.meter)}else{this.xmlid=null}};MEI2VF.EventReference.prototype.getId=function(a){if(a&&a.meicontext){this.setContext(a.meicontext)}if(this.xmlid){return this.xmlid}if(this.tstamp){if(this.meicontext){this.tryResolveReference(a&&a.strict);return this.xmlid}}return null};MEI2VF.EventReference.prototype.setContext=function(a){this.meicontext=a};MEI2VF.StaffInfo=function(b,d,c,a){this.renderWith={clef:d,keysig:c,timesig:a};this.staffDef=b};MEI2VF.StaffInfo.prototype.look4changes=function(c,d){var a={clef:false,keysig:false,timesig:false};if(!c&&d){a.clef=true;a.keysig=true;a.keysig=true;return a}else{if(c&&!d){a.clef=false;a.keysig=false;a.keysig=false;return a}else{if(!c&&!d){throw new MEI2VF_RUNTIME_ERROR("BadArgument","Cannot compare two undefined staff definitions.")}}}var b=function(g,e,f){return $(g).attr(f)===$(e).attr(f)};if(!b(c,d,"clef.shape")||!b(c,d,"clef.line")){a.clef=true}if((!b(c,d,"key.pname")||!b(c,d,"key.accid")||!b(c,d))){a.keysig=true}if(!b(c,d,"meter.count")||!b(c,d,"meter.unit")){a.timesig=true}return a};MEI2VF.StaffInfo.prototype.updateDef=function(a){this.renderWith=this.look4changes(this.staffDef,a);this.staffDef=a};MEI2VF.StaveConnector=function(b,a,c){this.init(b,a,c)};MEI2VF.StaveConnector.prototype.init=function(b,a,c){this.symbol=b;this.top_staff_n=a;this.bottom_staff_n=c};MEI2VF.StaveConnector.prototype.vexType=function(){switch(this.symbol){case"line":return Vex.Flow.StaveConnector.type.SINGLE;case"brace":return Vex.Flow.StaveConnector.type.BRACE;case"bracket":return Vex.Flow.StaveConnector.type.BRACKET;case"none":return null;default:return Vex.Flow.StaveConnector.type.SINGLE}};MEI2VF.StaffVoice=function(b,a){this.voice=b;this.staff_n=a};MEI2VF.StaveVoices=function(){this.all_voices=new Array()};MEI2VF.StaveVoices.prototype.addStaffVoice=function(a){this.all_voices.push(a)};MEI2VF.StaveVoices.prototype.addVoice=function(b,a){this.addStaffVoice(new MEI2VF.StaffVoice(b,a))};MEI2VF.StaveVoices.prototype.reset=function(){this.all_voices=[]};MEI2VF.StaveVoices.prototype.format=function(b){var a=$.map(this.all_voices,function(d,c){return d.voice});new Vex.Flow.Formatter().format(a,b)};MEI2VF.StaveVoices.prototype.draw=function(d,e){var c=this.all_voices;var b;for(var a=0;a<c.length;++a){b=c[a];b.voice.draw(d,e[b.staff_n])}};