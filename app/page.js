'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase'
import {loadProducts} from '@/components/Catalog'
import {Grid,disc} from '@/components/ProductCard'
const S=({t,children,href})=><section className="mt-6"><div className="flex justify-between items-center mb-2"><h2 className="text-lg font-bold text-blue-900 border-l-4 border-yellow-400 pl-2">{t}</h2>{href&&<Link href={href} className="text-sm text-blue-700">View all</Link>}</div>{children}</section>
const categories=[
{name:'Mobiles',slug:'mobiles',image:'mobiles.jpg'},
{name:'Electronics',slug:'electronics',image:'electronics.jpg'},
{name:'Footwear',slug:'footwear',image:'footwear.jpg'},
{name:'Watches & Sun...',slug:'watches-sunglasses',image:'watches-sunglasses.jpg'},
{name:'Accessories',slug:'accessories',image:'accessories.jpg'},
{name:'Kids & Toys',slug:'kids-toys',image:'kids-toys.jpg'},
{name:"Girls' Wear",slug:'girls-wear',image:'girls-wear.jpg'},
{name:"Men's Wear",slug:'mens-wear',image:'mens-wear.jpg'}]
export default function Home(){
const[cats,setC]=useState([]),[ban,setB]=useState([]),[prods,setP]=useState([]),[i,setI]=useState(0)
useEffect(()=>{supabase.from('categories').select('*').order('sort').then(({data})=>setC(data||[]))
supabase.from('banners').select('*').eq('active',true).order('sort').then(({data})=>setB(data||[]));loadProducts().then(({data})=>setP(data||[]))},[])
useEffect(()=>{if(ban.length<2)return;const t=setInterval(()=>setI(x=>(x+1)%ban.length),4000);return()=>clearInterval(t)},[ban])
const b=ban[i],brands=[...new Set(prods.map(p=>p.brand).filter(Boolean))]
return(<div>
{b&&<Link href={b.link||'/'} className="block mt-2 rounded-xl bg-yellow-400 text-blue-900 p-3 sm:p-6 relative overflow-hidden min-h-[88px] sm:min-h-[110px]" style={b.image_url?{background:`url(${b.image_url}) center/cover`}:{}}>
<div className={b.image_url?'bg-white/80 inline-block p-2 sm:p-3 rounded':''}><b className="text-xl sm:text-2xl block">{b.title}</b><span className="text-sm sm:text-base">{b.subtitle}</span></div>
<span className="absolute bottom-2 right-3 text-xs">{ban.map((_,k)=><span key={k}>{k===i?'●':'○'} </span>)}</span></Link>}
<S t="🔥 Trending Products"><Grid list={prods.filter(p=>p.trending).slice(0,10)}/></S>
<S t="💰 Best Deals"><Grid list={[...prods].sort((a,b)=>disc(b)-disc(a)).slice(0,10)}/></S>
<S t="⚡ Today's Offers (40% off or more)"><Grid list={prods.filter(p=>disc(p)>=40).slice(0,10)}/></S>
<S t="Popular Brands"><div className="flex flex-wrap gap-2">{brands.map(x=><Link key={x} href={'/search?q='+encodeURIComponent(x)} className="bg-white border rounded-full px-4 py-2 text-sm font-medium hover:bg-yellow-100">{x}</Link>)}</div></S>
</div>)}
