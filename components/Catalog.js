'use client'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {supabase} from '@/lib/supabase'
import {Grid,disc} from './ProductCard'
const PAGE_SIZE=60
const productPageCache=new Map()
export const loadProducts=async(page=0)=>{
const cached=productPageCache.get(page)
if(cached&&Date.now()-cached.time<30000)return cached.value
const from=page*PAGE_SIZE,to=from+PAGE_SIZE-1
const value=Promise.all([
supabase.from('products').select('id,name,brand,image_url,original_price,price,affiliate_url,trending,category_id,subcategory_id,created_at,categories(name,slug,icon),subcategories(name,slug)').order('created_at',{ascending:false}).range(from,to),
supabase.from('partner_products').select('id,name,brand,image_url,original_price,price,affiliate_url,status,category_id,subcategory_id,created_at,categories(name,slug,icon),subcategories(name,slug)').order('created_at',{ascending:false}).range(from,to)
]).then(([base,partner])=>{
if(base.error)throw base.error
if(partner.error)throw partner.error
return {
 data:[...(base.data||[]).filter(p=>p.image_url),...(partner.data||[])],
 hasMore:(base.data||[]).length===PAGE_SIZE||(partner.data||[]).length===PAGE_SIZE
}
})
productPageCache.set(page,{time:Date.now(),value})
return value
}
export default function Catalog({cat,sub,q}){
const[all,setAll]=useState(null),[error,setError]=useState(''),[page,setPage]=useState(0),[hasMore,setHasMore]=useState(false),[loadingMore,setLoadingMore]=useState(false),[subs,setSubs]=useState([]),[f,setF]=useState({max:'',brands:[],disc:0,cat:'',sort:''}),[open,setOpen]=useState(false)
useEffect(()=>{setAll(null);setError('');setPage(0);loadProducts(0).then(({data,hasMore:more})=>{setAll(data||[]);setHasMore(more)}).catch(e=>setError(e.message||'Unable to load products.'))
if(cat)supabase.from('subcategories').select('*,categories!inner(slug)').eq('categories.slug',cat).then(({data})=>setSubs(data||[]))},[cat])
const loadMore=async()=>{setLoadingMore(true);try{const next=page+1,result=await loadProducts(next);setAll(current=>[...(current||[]),...(result.data||[])]);setPage(next);setHasMore(result.hasMore)}catch(e){setError(e.message||'Unable to load more products.')}finally{setLoadingMore(false)}}
const base=useMemo(()=>(all||[]).filter(p=>(!cat||p.categories?.slug===cat)&&(!sub||p.subcategories?.slug===sub)&&
(!q||q.toLowerCase().split(/\s+/).every(w=>[p.name,p.brand,p.categories?.name,p.subcategories?.name].join(' ').toLowerCase().includes(w)))),[all,cat,sub,q])
const brands=useMemo(()=>[...new Set(base.map(p=>p.brand).filter(Boolean))],[base])
const cats=useMemo(()=>[...new Map(base.filter(p=>p.categories).map(p=>[p.categories.slug,p.categories.name]))],[base])
const list=useMemo(()=>{let result=base.filter(p=>(!f.max||p.price<=+f.max)&&(!f.brands.length||f.brands.includes(p.brand))&&disc(p)>=f.disc&&(!f.cat||p.categories?.slug===f.cat));if(f.sort==='low')result=[...result].sort((a,b)=>a.price-b.price);if(f.sort==='high')result=[...result].sort((a,b)=>b.price-a.price);if(f.sort==='disc')result=[...result].sort((a,b)=>disc(b)-disc(a));return result},[base,f])
const set=o=>setF({...f,...o})
if(error)return<p className="rounded bg-white p-8 text-center text-red-600">{error}</p>
if(!all)return<p className="p-8">Loading…</p>
return(<div>
{cat&&<div className="flex gap-2 overflow-x-auto pb-3">{subs.map(s=><Link key={s.id} href={`/c/${cat}/${s.slug}`} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border ${sub===s.slug?'bg-blue-700 text-white':'bg-white'}`}>{s.name}</Link>)}</div>}
{q!==undefined&&<h1 className="font-bold mb-2">Results for “{q}”</h1>}
<button className="md:hidden btn mb-3" onClick={()=>setOpen(!open)}>Filters</button>
<div className="md:flex gap-4"><aside className={`${open?'block':'hidden'} md:block w-full md:w-56 shrink-0 bg-white rounded p-4 mb-3 space-y-4 text-sm self-start`}>
<div><b>Sort</b><select className="inp mt-1" value={f.sort} onChange={e=>set({sort:e.target.value})}><option value="">Newest</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="disc">Discount</option></select></div>
<div><b>Max price (₹)</b><input type="number" className="inp mt-1" value={f.max} onChange={e=>set({max:e.target.value})} placeholder="e.g. 2000"/></div>
<div><b>Min discount</b>{[0,20,40,60].map(d=><label key={d} className="block"><input type="radio" checked={f.disc===d} onChange={()=>set({disc:d})}/> {d?d+'% or more':'Any'}</label>)}</div>
{!cat&&cats.length>1&&<div><b>Category</b><select className="inp mt-1" value={f.cat} onChange={e=>set({cat:e.target.value})}><option value="">All</option>{cats.map(([s,n])=><option key={s} value={s}>{n}</option>)}</select></div>}
{brands.length>0&&<div><b>Brand</b>{brands.map(b=><label key={b} className="block"><input type="checkbox" checked={f.brands.includes(b)} onChange={e=>set({brands:e.target.checked?[...f.brands,b]:f.brands.filter(x=>x!==b)})}/> {b}</label>)}</div>}
</aside><div className="flex-1"><p className="text-xs text-slate-500 mb-2">{list.length} products</p><Grid list={list}/>{hasMore&&<div className="mt-4 text-center"><button type="button" className="btn" onClick={loadMore} disabled={loadingMore}>{loadingMore?'Loading…':'Load more products'}</button></div>}</div></div></div>)}
