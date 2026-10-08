const SRC="<!DOCTYPE html>\n"+document.documentElement.outerHTML;
const SAMPLE_P=[
{title:"Brand Identity System",category:"Brand Identity",year:"Year",client:"Client / Organization",desc:"Logo, colour and typography system for an organization.",ratio:"4/5",c1:"#111",c2:"#f4f2ee"},
{title:"Wordmark Study",category:"Logo Design",year:"Year",client:"Client / Organization",desc:"A logo exploration from sketch to final mark.",ratio:"1/1",c1:"#c8401c",c2:"#fff"},
{title:"Awareness Campaign",category:"Social Media Campaign",year:"Year",client:"Client / Organization",desc:"A consistent social series across several posts.",ratio:"3/4",c1:"#d9d5ce",c2:"#111"},
{title:"Event Poster Series",category:"Poster / Campaign",year:"Year",client:"Client / Organization",desc:"Poster and campaign visuals for an event.",ratio:"16/10",c1:"#2b3a35",c2:"#f4f2ee"},
{title:"Organizational Collateral",category:"Corporate / Organizational",year:"Year",client:"Client / Organization",desc:"Documents, templates and brand applications.",ratio:"4/3",c1:"#5d5a55",c2:"#fff"},
{title:"Report Layout",category:"Editorial / Layout",year:"Year",client:"Client / Organization",desc:"Editorial layout with a clear typographic hierarchy.",ratio:"4/5",c1:"#e3c9b8",c2:"#111"},
{title:"Digital Interface Visuals",category:"Digital Design",year:"Year",client:"Client / Organization",desc:"Digital graphics and visual assets for screens.",ratio:"1/1",c1:"#1c2a44",c2:"#f4f2ee"},
{title:"Print Collection",category:"Print Design",year:"Year",client:"Client / Organization",desc:"Print-ready pieces designed with production in mind.",ratio:"16/9",c1:"#111",c2:"#c8401c"}
].map(p=>({placeholder:true,cover:"",gallery:[],tools:"Tools used",brief:"Placeholder brief — what the project was and who it was for.",challenge:"Placeholder — what needed to be solved.",approach:"Placeholder — how the direction was developed.",process:"Placeholder — sketches, iterations and key decisions.",final:"Placeholder — final design presentation.",outcome:"",...p}));
const SAMPLE_C=[1,2,3].map(()=>({name:"Certificate Name",org:"Organization",year:"Year",image:""}));

const $=s=>document.querySelector(s),esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7),clone=o=>JSON.parse(JSON.stringify(o));
let S=null,EDIT=false,drag=null;
const isImg=u=>{u=u||"";return u.startsWith("data:")?/^data:image\//.test(u):/\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i.test(u)},fnm=u=>{if(u&&!u.startsWith("data:")){try{return decodeURIComponent(u.split("/").pop()).replace(/^[0-9a-f]{8}-/,"")}catch(e){return"File"}}const m=/;name=([^;,]+)/.exec((u||"").slice(0,400));try{return m?decodeURIComponent(m[1]):"File"}catch(e){return"File"}};
const BU=new Map(),blobUrl=u=>{if(!u.startsWith("data:"))return u;if(BU.has(u))return BU.get(u);let url="#";try{const i=u.indexOf(","),b=atob(u.slice(i+1)),a=new Uint8Array(b.length);for(let k=0;k<b.length;k++)a[k]=b.charCodeAt(k);url=URL.createObjectURL(new Blob([a],{type:u.slice(5,i).split(";")[0]}))}catch(e){}BU.set(u,url);return url};
const fileTile=u=>{const pdf=isPdf(u);return `<a class="ftile" href="${blobUrl(u)}" target="_blank" rel="noopener"${pdf?"":` download="${esc(fnm(u))}"`}>📄 <span>${esc(fnm(u))}</span><em>${pdf?"Open PDF":"Download file"}</em></a>`};
const pcv=p=>p.cover||(p.gallery||[]).find(isImg)||p.thumb||"",isPdf=u=>{u=u||"";return u.startsWith("data:")?/^data:application\/pdf/.test(u):/\.pdf$/i.test(u)};
let pdfP=null;const loadPdf=()=>pdfP||(pdfP=new Promise((res,rej)=>{if(window.pdfjsLib)return res(window.pdfjsLib);const s=document.createElement("script");s.src="lib/pdf.min.js";s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc="lib/pdf.worker.min.js";res(window.pdfjsLib)};s.onerror=()=>{pdfP=null;rej(new Error("pdfjs"))};document.head.appendChild(s)}));
async function pdfThumb(u){try{const L=await loadPdf();let a;if(u.startsWith("data:")){const b=atob(u.slice(u.indexOf(",")+1));a=new Uint8Array(b.length);for(let k=0;k<b.length;k++)a[k]=b.charCodeAt(k)}else a=new Uint8Array(await(await fetch(u)).arrayBuffer());const pg=await(await L.getDocument({data:a}).promise).getPage(1),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:Math.min(2,1000/v0.width)}),c=document.createElement("canvas");c.width=Math.round(v.width);c.height=Math.round(v.height);const cx=c.getContext("2d");cx.fillStyle="#fff";cx.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:cx,viewport:v}).promise;return{img:c.toDataURL("image/jpeg",.85),ratio:c.width+"/"+c.height}}catch(e){return null}}
async function fixThumbs(){let ch=false;for(const p of S.projects){if(p.thumb||p.cover||(p.gallery||[]).some(isImg))continue;const pdf=(p.gallery||[]).find(isPdf);if(!pdf)continue;const t=await pdfThumb(pdf);if(t){p.thumb=t.img;p.ratio=t.ratio;ch=true}}
for(const c of S.certs){if(c.thumb||!isPdf(c.image))continue;const t=await pdfThumb(c.image);if(t){c.thumb=t.img;ch=true}}if(ch){await save();render()}}
const certMedia=c=>{const u=c.image;if(isImg(u))return media(u,c.name);if(c.thumb)return `<a href="${blobUrl(u)}" target="_blank" rel="noopener" aria-label="Open ${esc(c.name)}"><img src="${esc(c.thumb)}" alt="${esc(c.name)}" draggable="false" loading="lazy" decoding="async"></a>`;return fileTile(u)};
const media=(u,alt)=>isImg(u)?`<img src="${esc(u)}" alt="${esc(alt||"")}" draggable="false" loading="lazy" decoding="async">`:fileTile(u);
/* ---- storage (IndexedDB) ---- */
const DB={open(){return new Promise((res,rej)=>{const r=indexedDB.open("mah-portfolio",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})},
async get(){const d=await this.open();return new Promise((res,rej)=>{const q=d.transaction("kv").objectStore("kv").get("data");q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})},
async set(v){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction("kv","readwrite");t.objectStore("kv").put(v,"data");t.oncomplete=res;t.onerror=t.onabort=()=>rej(t.error)})}};
async function save(){try{await DB.set(S)}catch(e){alert("Could not save to this browser's storage (private mode or storage full). Use Export Portfolio Data to keep a backup.")}}
const seed=()=>({projects:SAMPLE_P.map(({brief,...p})=>({id:uid(),...p})),certs:SAMPLE_C.map(c=>({id:uid(),placeholder:true,desc:"",credId:"",url:"",...c}))});
/* ---- render ---- */
const adm=()=>`<div class="adm"><button data-a="edit">Edit</button><button data-a="dup">Duplicate</button><button data-a="del">Delete</button><button data-a="up" aria-label="Move up">↑ Up</button><button data-a="down" aria-label="Move down">↓ Down</button></div>`;
const cardP=p=>`<div class="card reveal" role="button" tabindex="0" data-id="${p.id}" draggable="${EDIT}" aria-label="View case study: ${esc(p.title)}">
<div class="frame"><div class="ph" style="--c1:${p.c1||"#111"};--c2:${p.c2||"#f4f2ee"};aspect-ratio:${p.ratio||"4/5"}">${pcv(p)?`<img src="${esc(pcv(p))}" alt="${esc(p.title)}" draggable="false" loading="lazy" decoding="async">`:`<span class="big">${esc(p.category)}</span>`}${p.placeholder?'<span class="tag">Sample placeholder</span>':""}</div></div>
<div class="meta"><h3>${esc(p.title)}</h3><span class="cat">${[p.category,p.year].filter(Boolean).map(esc).join(" · ")}</span></div>
${p.desc?`<p>${esc(p.desc)}</p>`:""}<span class="view">View Case Study →</span>${adm()}</div>`;
const cardC=c=>{let u=(c.url||"").trim();if(u&&!/^https?:\/\//i.test(u))u="https://"+u;
return `<div class="cert reveal" data-id="${c.id}" draggable="${EDIT}">${c.image?`<div class="img">${certMedia(c)}</div>`:(c.placeholder?'<div class="img">[Certificate Image]</div>':"")}
<p><b>${esc(c.name)}</b>${[c.org,c.year].filter(Boolean).map(esc).join(" · ")}</p>${c.desc?`<p style="margin-top:8px">${esc(c.desc)}</p>`:""}${c.image&&!isImg(c.image)&&c.thumb?`<p style="margin-top:8px"><a class="lnk" href="${blobUrl(c.image)}" target="_blank" rel="noopener">Open certificate ↗</a></p>`:""}${c.credId?`<p style="margin-top:8px">Credential ID: ${esc(c.credId)}</p>`:""}${u?`<p style="margin-top:8px"><a class="lnk" href="${esc(u)}" target="_blank" rel="noopener">View credential ↗</a></p>`:""}${adm()}</div>`};
function render(){$("#grid").innerHTML=S.projects.filter(p=>EDIT||!p.placeholder).map(cardP).join("");$("#certs").innerHTML=S.certs.filter(c=>EDIT||!c.placeholder).map(cardC).join("");
document.querySelectorAll("#grid .reveal,#certs .reveal").forEach(el=>io.observe(el))}
/* ---- case study ---- */
const dlg=$("#dlg");
function openCase(p){const f=(k,v)=>v&&String(v).trim()?`<dt>${k}</dt><dd>${esc(v)}</dd>`:"";const g=p.gallery||[];
$("#dlbody").innerHTML=`<p class="eyebrow">${[p.category,p.year].filter(Boolean).map(esc).join(" · ")}${p.placeholder?" · Sample placeholder":""}</p><h2 style="font-size:clamp(32px,6vw,64px);margin-bottom:0">${esc(p.title)}</h2>
${pcv(p)?`<img class="ccover" src="${esc(pcv(p))}" alt="${esc(p.title)}">`:""}
<dl>${f("Overview",p.desc)}${f("Client",p.client)}${f("Role",p.role)}${f("Challenge",p.challenge)}${f("Approach",p.approach)}${f("Design process",p.process)}${f("Final design",p.final)}${f("Tools",p.tools)}${f("Outcome",p.outcome)}${f("Notes",p.notes)}</dl>
${g.length?`<div class="gal real">${g.map(x=>isImg(x)?`<img src="${esc(x)}" alt="" loading="lazy">`:fileTile(x)).join("")}</div>`:(p.placeholder?'<div class="gal"><div></div><div></div><div></div></div>':"")}
<p style="margin-top:28px"><button class="btn" id="close">Close</button></p>`;dlg.showModal();$("#close").onclick=()=>dlg.close()}
dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
/* ---- list actions ---- */
function act(key,id,a){const arr=S[key],i=arr.findIndex(x=>x.id===id);if(i<0)return;
if(a==="edit")return editor(key,arr[i]);
if(a==="dup"){const c=clone(arr[i]);c.id=uid();const t=key==="projects"?"title":"name";c[t]=(c[t]||"")+" (Copy)";arr.splice(i+1,0,c)}
else if(a==="del"){if(!confirm("Delete this item? This cannot be undone."))return;arr.splice(i,1)}
else{const j=a==="up"?i-1:i+1;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]]}
save();render()}
function wire(box,key,open){
box.addEventListener("click",e=>{const el=e.target.closest("[data-id]");if(!el)return;const b=e.target.closest(".adm button");
if(b)return act(key,el.dataset.id,b.dataset.a);if(!e.target.closest(".adm,a")&&open)open(S[key].find(x=>x.id===el.dataset.id))});
box.addEventListener("keydown",e=>{const el=e.target.closest(".card");if(el&&e.target===el&&(e.key==="Enter"||e.key===" ")){e.preventDefault();open(S[key].find(x=>x.id===el.dataset.id))}});
box.addEventListener("dragstart",e=>{const el=e.target.closest("[data-id]");if(!EDIT||!el)return e.preventDefault();drag=el.dataset.id;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",drag)});
box.addEventListener("dragover",e=>{if(drag)e.preventDefault()});
box.addEventListener("drop",e=>{e.preventDefault();const el=e.target.closest("[data-id]"),a=S[key];if(!drag||!el||el.dataset.id===drag){drag=null;return}
const from=a.findIndex(x=>x.id===drag),to=a.findIndex(x=>x.id===el.dataset.id);const [m]=a.splice(from,1);a.splice(to,0,m);drag=null;save();render()});
box.addEventListener("dragend",()=>{drag=null})}
/* ---- editor ---- */
const FIELDS={projects:[["h","Project information"],["title","Project Title","t"],["category","Category","t"],["year","Year","t"],["client","Client / Organization","t"],["role","Role","t"],["desc","Short Description","a",""],["h","Images"],["IMG"],["h","Case study"],["challenge","Challenge","a","What needed to be solved"],["approach","Approach","a","How the direction was developed"],["process","Design Process","a","Sketches, iterations and key decisions"],["final","Final Design","a","Final design presentation"],["tools","Tools","t","Tools used for the project"],["outcome","Outcome (optional)","a",""],["notes","Additional Notes (optional)","a",""]],
certs:[["name","Certificate Name","t"],["org","Issuing Organization","t"],["year","Date / Year","t"],["IMG"],["desc","Short Description","a",""],["credId","Credential ID (optional)","t"],["url","Credential URL (optional)","t"]]};
function toData(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;
if(!/^image\//.test(file.type)){if(file.size>40e6)return rej(new Error("too large"));r.onload=()=>res(String(r.result).replace(/^data:([^;,]*)/,(m,t)=>"data:"+(t||"application/octet-stream")+";name="+encodeURIComponent(file.name)));r.readAsDataURL(file);return}
r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const s=Math.min(1,2400/Math.max(im.width,im.height));if(s===1&&file.size<1.5e6)return res(r.result);
const c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL(file.type==="image/jpeg"?"image/jpeg":"image/webp",.9))};im.src=r.result};r.readAsDataURL(file)})}
function editor(key,item){const isP=key==="projects",ik=isP?"cover":"image",d=item?clone(item):(isP?{ratio:"4/5",c1:"#111",c2:"#f4f2ee",cover:"",gallery:[]}:{image:""}),ed=$("#ed");
const names=FIELDS[key].filter(x=>x.length>2).map(x=>x[0]);
const html=FIELDS[key].map(x=>{if(x[0]==="h")return `<p class="sub">${x[1]}</p>`;
if(x[0]==="IMG")return `<div class="imgs"><p class="sub" style="margin-top:0">${isP?"Cover Image":"Certificate Image"}</p><div id="cvp"></div><div class="ctl"><label class="ab">${isP?"Choose Image":"Upload Certificate"}<input type="file" id="cvf"${isP?' accept="image/*"':""} hidden></label><button type="button" class="ab" id="cvr">Remove</button></div>
${isP?`<p class="sub">Project Gallery <span class="mute" style="text-transform:none;letter-spacing:0">(images, PDFs or any file)</span></p><div id="glp" class="thumbs"></div><div class="ctl"><label class="ab">Select Files<input type="file" id="glf" multiple hidden></label></div>`:""}</div>`;
return `<label>${x[1]}${x[2]==="a"?`<textarea id="f_${x[0]}" rows="3" placeholder="${esc(x[3]||"")}">${esc(d[x[0]]||"")}</textarea>`:`<input id="f_${x[0]}" value="${esc(d[x[0]]||"")}" placeholder="${esc(x[3]||"")}">`}</label>`}).join("");
$("#edbody").innerHTML=`<h2 style="font-size:clamp(28px,5vw,48px);margin-bottom:8px">${item?"EDIT":"ADD"} ${isP?"PROJECT":"CERTIFICATE"}</h2><div class="edf">${html}</div><p class="ctl" style="margin-top:24px"><button class="btn solid" id="sv" type="button">Save</button><button class="btn" id="cn" type="button">Cancel</button></p>`;
const paint=()=>{$("#cvp").innerHTML=d[ik]?(isImg(d[ik])?`<img class="th big" src="${esc(d[ik])}" alt="">`:`<span class="mute">📄 ${esc(fnm(d[ik]))}</span>`):'<span class="mute">No image selected</span>';
if(isP)$("#glp").innerHTML=(d.gallery||[]).map((g,i)=>`<div class="tw">${isImg(g)?`<img class="th" src="${esc(g)}" alt="">`:`<span class="th file">📄<br>${esc(fnm(g))}</span>`}<button type="button" data-i="${i}" aria-label="Remove image">×</button></div>`).join("")||'<span class="mute">No gallery images</span>'};paint();
const rd=async(files)=>{const out=[];for(const f of files){try{out.push(await toData(f))}catch(e){alert("Could not read "+f.name)}}return out};
$("#cvf").onchange=async e=>{const r=await rd(e.target.files);if(r[0]){d[ik]=r[0];paint()}e.target.value=""};
$("#cvr").onclick=()=>{d[ik]="";paint()};
if(isP){$("#glf").onchange=async e=>{d.gallery=(d.gallery||[]).concat(await rd(e.target.files));paint();e.target.value=""};
$("#glp").onclick=e=>{const b=e.target.closest("button");if(b){d.gallery.splice(+b.dataset.i,1);paint()}}}
$("#cn").onclick=()=>ed.close();
$("#sv").onclick=async()=>{const o={...d,placeholder:false};names.forEach(n=>o[n]=$("#f_"+n).value.trim());
const rq=isP?"title":"name";if(!o[rq]){$("#f_"+rq).focus();alert((isP?"Project Title":"Certificate Name")+" is required.");return}
$("#sv").textContent="Saving…";
if(isP){o.thumb="";const has=o.cover||(o.gallery||[]).some(isImg),pdf=(o.gallery||[]).find(isPdf);if(!has&&pdf){const t=await pdfThumb(pdf);if(t){o.thumb=t.img;o.ratio=t.ratio}}}
else{o.thumb="";if(isPdf(o.image)){const t=await pdfThumb(o.image);if(t)o.thumb=t.img}}
if(item){S[key][S[key].findIndex(x=>x.id===item.id)]=o}else{o.id=uid();S[key].push(o)}
await save();render();ed.close()};
ed.showModal()}
/* ---- edit mode & data tools ---- */
function setEdit(on){EDIT=on;document.body.classList.toggle("editing",on);$("#editbtn").textContent=on?"Exit Edit Mode":"Edit Portfolio";$("#editTop").style.cssText=on?"background:var(--acc);color:#fff;border-color:var(--acc)":"";if(!on)persistSite();if(S){render();on?decorate():undecorate()}}
$("#addP").onclick=()=>editor("projects");$("#addC").onclick=()=>editor("certs");
$("#exp").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({app:"mah-portfolio",version:1,projects:S.projects,certs:S.certs,site:S.site})],{type:"application/json"}));a.download="portfolio-data-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
$("#imp").onclick=()=>$("#impf").click();
$("#impf").onchange=e=>{const f=e.target.files[0];e.target.value="";if(!f)return;const r=new FileReader();r.onload=async()=>{try{const j=JSON.parse(r.result);if(!Array.isArray(j.projects)||!Array.isArray(j.certs))throw 0;
if(!confirm("Import this file? It will replace all current projects and certificates."))return;S={projects:j.projects,certs:j.certs,site:j.site||{}};S.projects.forEach(x=>x.id=x.id||uid());S.certs.forEach(x=>x.id=x.id||uid());await save();location.reload()}catch(err){alert("This file is not valid portfolio data.")}};r.readAsText(f)};
$("#rst").onclick=async()=>{if(!confirm("Reset Portfolio Data?\n\nThis deletes all your projects, certificates and uploaded images and restores the original examples."))return;if(!confirm("Are you absolutely sure? This cannot be undone unless you exported a backup."))return;S=seed();await save();location.reload()};
/* ---- editable site sections ---- */
const OWNER_PASS="Boots2026";
const ZONES=[
{k:"hero",sel:".hero .wrap>div:first-child",ed:".roles span,.intro",lists:[]},
{k:"case",sel:"#case .wrap",ed:"h2,.cs h3,.cs p,.final span,.final small,.sw",lists:[[".cs","+ Add Section"],[".swatches>.sw","+ Add Color"]]},
{k:"about",sel:"#about .reveal",ed:"p",lists:[["p","+ Add Paragraph"]]},
{k:"journey",sel:"#journey .wrap",ed:"h2,.tl .start,.tl .k,.tl .d",lists:[[".tl li","+ Add Step"]]},
{k:"exp",sel:"#experience .wrap",ed:"h2,.row .mute,.role,.row li,.row .role+div",lists:[[".row","+ Add Experience"]]},
{k:"skills",sel:"#skills .wrap",ed:"h2,.chips span,.sub",lists:[[".chips>span","+ Add Skill"]]},
{k:"edu",sel:"#education .wrap",ed:"h2,.role,.row p,.row .role+div,.sub",lists:[["div.row:nth-of-type(2)>div:last-child>p","+ Add Training"]]}];
const mk=(t,c,l)=>{const b=document.createElement("button");b.type="button";b.className=c;b.textContent=t;b.setAttribute("contenteditable","false");if(l)b.setAttribute("aria-label",l);return b};
function applySite(){ZONES.forEach(z=>{const h=S.site&&S.site[z.k],c=document.querySelector(z.sel);if(h!=null&&c){c.innerHTML=h;c.querySelectorAll(".reveal").forEach(x=>x.classList.add("in"))}})}
const hexOf=e=>"#"+(getComputedStyle(e).backgroundColor.match(/\d+/g)||[0,0,0]).slice(0,3).map(n=>(+n).toString(16).padStart(2,"0")).join("");
function setSw(sw,h){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);sw.style.background=h;sw.style.color=(r*299+g*587+b*114)/255000>.6?"#111":"#fff";sw.style.border="1px solid rgba(128,128,128,.35)"}
function undecorate(){document.querySelectorAll(".x-ui").forEach(x=>x.remove());document.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable"));document.querySelectorAll(".x-item").forEach(x=>x.classList.remove("x-item"))}
function decorate(){undecorate();ZONES.forEach(z=>{const c=document.querySelector(z.sel);if(!c)return;
c.querySelectorAll(z.ed).forEach(e=>e.setAttribute("contenteditable","true"));
z.lists.forEach(([it,label])=>{const items=[...c.querySelectorAll(it)];
items.forEach(i=>{i.classList.add("x-item");const b=mk("×","x-ui x-del","Delete");b.onclick=ev=>{ev.preventDefault();ev.stopPropagation();if(confirm("Delete this item?")){i.remove();persistSite();decorate()}};i.appendChild(b)});
[...new Set(items.map(i=>i.parentElement))].forEach(p=>{const last=items.filter(i=>i.parentElement===p).pop(),w=document.createElement(p.tagName==="OL"?"li":"div");w.className="x-ui xwrap";
const a=mk(label,"ab x-add");a.onclick=()=>{const n=last.cloneNode(true);n.querySelectorAll(".x-ui").forEach(x=>x.remove());n.classList.remove("x-item");
if(p.classList.contains("chips"))n.textContent="New skill";else if(p.classList.contains("swatches"))n.textContent="Color";last.after(n);persistSite();decorate();n.scrollIntoView({block:"center"})};w.appendChild(a);last.after(w)})})});
document.querySelectorAll("#case .sw").forEach(sw=>{const i=document.createElement("input");i.type="color";i.className="x-ui swc";i.setAttribute("contenteditable","false");i.title="Change color";i.value=hexOf(sw);i.oninput=()=>setSw(sw,i.value);i.onchange=()=>persistSite();sw.appendChild(i)});
const fin=document.querySelector("#case .final");if(fin){const w=document.createElement("div");w.className="x-ui finctl";const l=document.createElement("label");l.className="ab";l.textContent="Upload Final Image";const f=document.createElement("input");f.type="file";f.accept="image/*";f.hidden=true;
f.onchange=async e=>{const fl=e.target.files[0];if(!fl)return;try{const d=await toData(fl);fin.style.background="url("+d+") center/cover no-repeat";fin.classList.add("has-img");persistSite()}catch(x){alert("Could not read image")}};
l.appendChild(f);const r=mk("Remove Image","ab");r.onclick=()=>{fin.style.background="";fin.classList.remove("has-img");persistSite()};w.append(l,r);fin.appendChild(w)}}
function snap(){ZONES.forEach(z=>{const c=document.querySelector(z.sel);if(!c)return;const n=c.cloneNode(true);n.querySelectorAll(".x-ui").forEach(x=>x.remove());n.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable"));n.querySelectorAll(".x-item").forEach(x=>x.classList.remove("x-item"));S.site[z.k]=n.innerHTML})}
let pt;function persistSite(){clearTimeout(pt);pt=setTimeout(()=>{snap();save()},300)}
document.addEventListener("focusout",e=>{if(EDIT&&e.target.closest&&e.target.closest("[contenteditable]"))persistSite()});
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return b=>{let c=-1;for(let i=0;i<b.length;i++)c=t[(c^b[i])&255]^(c>>>8);return(c^-1)>>>0}})();
function makeZip(files){const enc=new TextEncoder(),parts=[],cd=[];let off=0,cs=0;
for(const f of files){const nm=enc.encode(f.name),crc=CRC(f.data),sz=f.data.length,lh=new DataView(new ArrayBuffer(30));
lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(12,0x21,true);lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);parts.push(lh.buffer,nm,f.data);
const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(14,0x21,true);ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);cd.push(ch.buffer,nm);cs+=46+nm.length;off+=30+nm.length+sz}
const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);return new Blob([...parts,...cd,e.buffer],{type:"application/zip"})}
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,"0")};
$("#pub").onclick=()=>{snap();const files=[],seen=new Map(),rx=/data:[\w.+\/-]+(?:;[^;,"'&)\s]+)*;base64,[A-Za-z0-9+\/=]+/g,EXT={"application/pdf":"pdf","image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","image/svg+xml":"svg"};
const conv=u=>{if(seen.has(u))return seen.get(u);const i=u.indexOf(","),head=u.slice(5,i),type=head.split(";")[0],nm=(/;name=([^;,]+)/.exec(head)||[])[1];let orig="";try{orig=nm?decodeURIComponent(nm):""}catch(e){}
const ext=EXT[type]||((/\.(\w{1,5})$/.exec(orig)||[])[1])||"bin";let base=orig.replace(/\.[^.]*$/,"").replace(/[^A-Za-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,50)||"file";
const path="assets/"+hash(u)+"-"+base+"."+ext,b=atob(u.slice(i+1)),a=new Uint8Array(b.length);for(let k=0;k<b.length;k++)a[k]=b.charCodeAt(k);files.push({name:path,data:a});seen.set(u,path);return path};
const data=JSON.stringify({projects:S.projects,certs:S.certs,site:S.site}).replace(rx,conv).replace(/</g,"\\u003c");
const html=SRC.replace(new RegExp("<"+'script id="seed"[^>]*>[\\s\\S]*?<'+"/script>"),()=>"<"+'script id="seed" type="application/json">'+data+"<"+"/script>");
files.unshift({name:"index.html",data:new TextEncoder().encode(html)});
const a=document.createElement("a");a.href=URL.createObjectURL(makeZip(files));a.download="website-update.zip";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)};
$("#lock").onclick=()=>{try{localStorage.removeItem("mah-owner")}catch(e){}location.reload()};
$("#editTop").onclick=()=>{setEdit(!EDIT);if(EDIT)$("#work").scrollIntoView()};
$("#editbtn").onclick=()=>{if(OWNER)return setEdit(!EDIT);const p=prompt("Owner passcode:");if(p===null)return;if(p!==OWNER_PASS){alert("Wrong passcode.");return}
try{localStorage.setItem("mah-owner","1");sessionStorage.setItem("mah-go","1")}catch(e){alert("This browser blocks storage, so editing cannot be saved.");return}location.reload()};
wire($("#grid"),"projects",openCase);wire($("#certs"),"certs",null);
const nav=$("#nav"),menu=$("#menu");
menu.onclick=()=>{const o=nav.classList.toggle("open");menu.setAttribute("aria-expanded",o)};
nav.addEventListener("click",e=>{if(e.target.tagName==="A"){nav.classList.remove("open");menu.setAttribute("aria-expanded","false")}});
$("#theme").onclick=()=>{const r=document.documentElement,d=r.dataset.theme==="dark"||(!r.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);r.dataset.theme=d?"light":"dark"};
$("#form").addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);
location.href="mailto:Bootsfinity@gmail.com?subject="+encodeURIComponent("Portfolio enquiry from "+d.get("n"))+"&body="+encodeURIComponent(d.get("m")+"\n\n"+d.get("n")+" · "+d.get("e"))});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.1});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

const pr=$("#prog");addEventListener("scroll",()=>{pr.style.transform="scaleX("+scrollY/(document.documentElement.scrollHeight-innerHeight)+")"},{passive:true});
document.querySelectorAll("h2").forEach(el=>{el.classList.add("reveal");io.observe(el)});
const links=[...document.querySelectorAll("nav a")];
const so=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){links.forEach(a=>a.style.color=a.getAttribute("href")==="#"+x.target.id?"var(--acc)":"")}}),{rootMargin:"-45% 0px -50% 0px"});
["home","work","about","journey","experience","contact"].forEach(i=>so.observe(document.getElementById(i)));
let OWNER=false;try{OWNER=localStorage.getItem("mah-owner")==="1"}catch(e){}
if(OWNER)document.documentElement.classList.add("owner");$("#editbtn").textContent=OWNER?"Edit Portfolio":"Owner Login";
const okD=x=>x&&Array.isArray(x.projects)&&Array.isArray(x.certs);
const embedded=()=>{try{const j=JSON.parse($("#seed").textContent);return okD(j)?j:null}catch(e){return null}};
(async()=>{const em=embedded();if(OWNER){try{S=await DB.get()}catch(e){}}
if(!okD(S)){S=em?clone(em):seed();if(OWNER)await save()}
S.site=S.site||{};applySite();render();
let go=false;try{go=OWNER&&sessionStorage.getItem("mah-go");sessionStorage.removeItem("mah-go")}catch(e){}
if(go)setEdit(true);if(OWNER)fixThumbs()})();
