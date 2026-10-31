'use client'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase'
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const up=async file=>{const n=Date.now()+'-'+file.name.replace(/[^\w.]/g,'_');const{error}=await supabase.storage.from('product-images').upload(n,file);if(error)throw error;return supabase.storage.from('product-images').getPublicUrl(n).data.publicUrl}
function Login(){const[e,setE]=useState(''),[p,setP]=useState(''),[m,setM]=useState('')
const go=async ev=>{ev.preventDefault();const{error}=await supabase.auth.signInWithPassword({email:e,password:p});error?setM(error.message):location.reload()}
return<form onSubmit={go} className="max-w-sm mx-auto bg-white p-6 rounded shadow space-y-3 mt-10"><h1 className="font-bold text-xl">Admin Login</h1>
<input className="inp" type="email" placeholder="Email" value={e} onChange={x=>setE(x.target.value)} required/><input className="inp" type="password" placeholder="Password" value={p} onChange={x=>setP(x.target.value)} required/>
<button className="btn w-full">Login</button>{m&&<p className="text-red-600 text-sm">{m}</p>}</form>}
const empty={name:'',brand:'',original_price:'',price:'',category_id:'',subcategory_id:'',affiliate_url:'',trending:false,image_url:''}
function Products({cats,subs}){const[list,setL]=useState([]),[f,setF]=useState(empty),[file,setFile]=useState(null),[msg,setM]=useState('')
const load=()=>supabase.from('products').select('*').order('created_at',{ascending:false}).then(({data})=>setL(data||[]));useEffect(()=>{load()},[])
const set=o=>setF({...f,...o})
const save=async ev=>{ev.preventDefault();try{const row={...f,original_price:+f.original_price,price:+f.price,category_id:f.category_id||null,subcategory_id:f.subcategory_id||null,affiliate_url:f.affiliate_url||null}
if(file)row.image_url=await up(file);delete row.created_at
const{error}=f.id?await supabase.from('products').update(row).eq('id',f.id):await supabase.from('products').insert(row);if(error)throw error
setF(empty);setFile(null);setM('Saved ✔');load()}catch(x){setM(x.message)}}
const del=async id=>{if(confirm('Delete this product?')){await supabase.from('products').delete().eq('id',id);load()}}
return<div className="grid lg:grid-cols-2 gap-4"><form onSubmit={save} className="bg-white p-4 rounded space-y-2"><h2 className="font-bold">{f.id?'Edit':'Add'} product</h2>
<input className="inp" placeholder="Product name" value={f.name} onChange={e=>set({name:e.target.value})} required/><input className="inp" placeholder="Brand" value={f.brand||''} onChange={e=>set({brand:e.target.value})}/>
<div className="flex gap-2"><input className="inp" type="number" placeholder="Original price" value={f.original_price} onChange={e=>set({original_price:e.target.value})} required/><input className="inp" type="number" placeholder="Discounted price" value={f.price} onChange={e=>set({price:e.target.value})} required/></div>
<select className="inp" value={f.category_id||''} onChange={e=>set({category_id:e.target.value,subcategory_id:''})} required><option value="">Category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
<select className="inp" value={f.subcategory_id||''} onChange={e=>set({subcategory_id:e.target.value})}><option value="">Subcategory</option>{subs.filter(s=>s.category_id===f.category_id).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
<input className="inp" type="url" placeholder="Your Flipkart affiliate link (https://...)" value={f.affiliate_url||''} onChange={e=>set({affiliate_url:e.target.value})}/>
<input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])}/>{f.image_url&&!file&&<img src={f.image_url} className="h-16"/>}
<label className="block text-sm"><input type="checkbox" checked={!!f.trending} onChange={e=>set({trending:e.target.checked})}/> Show in Trending</label>
<button className="btn">{f.id?'Update':'Add'}</button>{f.id&&<button type="button" className="ml-2 underline" onClick={()=>setF(empty)}>Cancel</button>}<p className="text-sm">{msg}</p></form>
<div className="bg-white p-4 rounded space-y-2 max-h-[80vh] overflow-auto"><h2 className="font-bold">{list.length} products</h2>{list.map(p=><div key={p.id} className="flex justify-between gap-2 border-b py-1 text-sm"><span>{p.name} — ₹{p.price}{!p.affiliate_url&&<em className="text-red-500"> (no affiliate link)</em>}</span>
<span className="shrink-0"><button className="text-blue-700" onClick={()=>{setF({...empty,...p});scrollTo(0,0)}}>Edit</button> <button className="text-red-600" onClick={()=>del(p.id)}>Delete</button></span></div>)}</div></div>}
function Cats({cats,subs,reload}){const[n,setN]=useState(''),[ic,setIc]=useState('🛍️'),[sn,setSn]=useState(''),[sc,setSc]=useState('')
const add=async(t,row,r)=>{const{error}=await supabase.from(t).insert(row);error?alert(error.message):r()}
const del=async(t,id)=>{if(confirm('Delete? Subcategories/products may be affected.')){await supabase.from(t).delete().eq('id',id);reload()}}
return<div className="grid md:grid-cols-2 gap-4"><div className="bg-white p-4 rounded space-y-2"><h2 className="font-bold">Categories</h2>
<div className="flex gap-2"><input className="inp" placeholder="Name" value={n} onChange={e=>setN(e.target.value)}/><input className="inp w-16" value={ic} onChange={e=>setIc(e.target.value)}/><button className="btn" onClick={()=>n&&add('categories',{name:n,slug:slug(n),icon:ic,sort:cats.length+1},()=>{setN('');reload()})}>Add</button></div>
{cats.map(c=><div key={c.id} className="flex justify-between border-b text-sm py-1"><span>{c.icon} {c.name}</span><button className="text-red-600" onClick={()=>del('categories',c.id)}>Delete</button></div>)}</div>
<div className="bg-white p-4 rounded space-y-2"><h2 className="font-bold">Subcategories</h2><div className="flex gap-2"><select className="inp" value={sc} onChange={e=>setSc(e.target.value)}><option value="">Category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
<input className="inp" placeholder="Name" value={sn} onChange={e=>setSn(e.target.value)}/><button className="btn" onClick={()=>sn&&sc&&add('subcategories',{name:sn,slug:slug(sn),category_id:sc},()=>{setSn('');reload()})}>Add</button></div>
{subs.map(s=><div key={s.id} className="flex justify-between border-b text-sm py-1"><span>{cats.find(c=>c.id===s.category_id)?.name} › {s.name}</span><button className="text-red-600" onClick={()=>del('subcategories',s.id)}>Delete</button></div>)}</div></div>}
const eb={title:'',subtitle:'',link:'/',image_url:'',active:true,sort:0}
function Banners(){const[l,setL]=useState([]),[f,setF]=useState(eb),[file,setFile]=useState(null)
const load=()=>supabase.from('banners').select('*').order('sort').then(({data})=>setL(data||[]));useEffect(()=>{load()},[])
const save=async ev=>{ev.preventDefault();try{const row={...f};if(file)row.image_url=await up(file);const{error}=f.id?await supabase.from('banners').update(row).eq('id',f.id):await supabase.from('banners').insert(row);if(error)throw error;setF(eb);setFile(null);load()}catch(x){alert(x.message)}}
return<div className="grid md:grid-cols-2 gap-4"><form onSubmit={save} className="bg-white p-4 rounded space-y-2"><h2 className="font-bold">{f.id?'Edit':'Add'} banner</h2>
<input className="inp" placeholder="Title" value={f.title||''} onChange={e=>setF({...f,title:e.target.value})}/><input className="inp" placeholder="Subtitle" value={f.subtitle||''} onChange={e=>setF({...f,subtitle:e.target.value})}/>
<input className="inp" placeholder="Link (e.g. /c/mobiles)" value={f.link||''} onChange={e=>setF({...f,link:e.target.value})}/><input className="inp" type="number" placeholder="Order" value={f.sort} onChange={e=>setF({...f,sort:+e.target.value})}/>
<input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])}/><label className="block text-sm"><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})}/> Active</label><button className="btn">Save</button></form>
<div className="bg-white p-4 rounded">{l.map(b=><div key={b.id} className="flex justify-between border-b text-sm py-1"><span>{b.title} {!b.active&&'(hidden)'}</span><span><button className="text-blue-700" onClick={()=>setF({...eb,...b})}>Edit</button> <button className="text-red-600" onClick={async()=>{await supabase.from('banners').delete().eq('id',b.id);load()}}>Delete</button></span></div>)}</div></div>}
export default function Admin(){const[ok,setOk]=useState(null),[tab,setTab]=useState('Products'),[cats,setC]=useState([]),[subs,setS]=useState([])
const reload=()=>{supabase.from('categories').select('*').order('sort').then(({data})=>setC(data||[]));supabase.from('subcategories').select('*').then(({data})=>setS(data||[]))}
useEffect(()=>{(async()=>{const{data:{session}}=await supabase.auth.getSession();if(!session)return setOk(false)
const{data}=await supabase.from('admin_users').select('email').eq('email',session.user.email).maybeSingle();if(data){setOk(true);reload()}else{await supabase.auth.signOut();alert('This account is not an admin.');setOk(false)}})()},[])
if(ok===null)return<p>Loading…</p>;if(!ok)return<Login/>
return<div><div className="flex gap-2 mb-4 items-center">{['Products','Categories','Banners'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded font-medium ${tab===t?'bg-blue-700 text-white':'bg-white'}`}>{t}</button>)}
<button className="ml-auto underline text-sm" onClick={async()=>{await supabase.auth.signOut();location.reload()}}>Logout</button></div>
{tab==='Products'&&<Products cats={cats} subs={subs}/>}{tab==='Categories'&&<Cats cats={cats} subs={subs} reload={reload}/>}{tab==='Banners'&&<Banners/>}</div>}
