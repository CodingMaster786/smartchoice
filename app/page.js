'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase'
import {loadProducts} from '@/components/Catalog'
import {Grid,disc} from '@/components/ProductCard'
const S=({t,children,href})=><section className="mt-6"><div className="flex justify-between items-center mb-2"><h2 className="text-lg font-bold text-blue-900 border-l-4 border-yellow-400 pl-2">{t}</h2>{href&&<Link href={href} className="text-sm text-blue-700">View all</Link>}</div>{children}</section>
const categoryImages={mobiles:'/images/categories/mobiles.jpg',electronics:'/images/categories/electronics.jpg',fashion:'/images/categories/fashion.jpg','home-kitchen':'/images/categories/home-kitchen.jpg',beauty:'/images/categories/beauty.jpg',grocery:'/images/categories/grocery.jpg',sports:'/images/categories/sports.jpg',toys:'/images/categories/toys.jpg',appliances:'/images/categories/appliances.jpg',accessories:'/images/categories/accessories.jpg'}
export default function Home(){
const[cats,setC]=useState([]),[ban,setB]=useState([]),[prods,setP]=useState([]),[i,setI]=useState(0)
useEffect(()=>{supabase.from('categories').select('*').order('sort').then(({data})=>setC(data||[]))
supabase.from('banners').select('*').eq('active',true).order('sort').then(({data})=>setB(data||[]));loadProducts().then(({data})=>setP(data||[]))},[])
useEffect(()=>{if(ban.length<2)return;const t=setInterval(()=>setI(x=>(x+1)%ban.length),4000);return()=>clearInterval(t)},[ban])
const b=ban[i],brands=[...new Set(prods.map(p=>p.brand).filter(Boolean))]
return(<div>
<div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 md:p-10 text-center"><h1 className="text-2xl md:text-4xl font-extrabold">Find the Right Product at the Right Price.</h1><p className="mt-1 text-blue-100">Choose Smart. Shop Better.</p></div>
{b&&<Link href={b.link||'/'} className="block mt-3 rounded-xl bg-yellow-400 text-blue-900 p-6 relative overflow-hidden min-h-[110px]" style={b.image_url?{background:`url(${b.image_url}) center/cover`}:{}}>
<div className={b.image_url?'bg-white/80 inline-block p-3 rounded':''}><b className="text-2xl block">{b.title}</b><span>{b.subtitle}</span></div>
<span className="absolute bottom-2 right-3 text-xs">{ban.map((_,k)=><span key={k}>{k===i?'●':'○'} </span>)}</span></Link>}
<S t="Shop by Category"><div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">{cats.map(c=><Link key={c.id} href={'/c/'+c.slug} className="group bg-white rounded-xl overflow-hidden text-center shadow-sm hover:shadow-lg transition-shadow duration-200"><div className="aspect-square overflow-hidden bg-blue-50"><img src={categoryImages[c.slug]} alt={c.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/></div><div className="px-2 py-3 text-xs font-semibold text-blue-900">{c.name}</div></Link>)}</div></S>
<S t="🔥 Trending Products"><Grid list={prods.filter(p=>p.trending).slice(0,10)}/></S>
<S t="💰 Best Deals"><Grid list={[...prods].sort((a,b)=>disc(b)-disc(a)).slice(0,10)}/></S>
<S t="⚡ Today's Offers (40% off or more)"><Grid list={prods.filter(p=>disc(p)>=40).slice(0,10)}/></S>
<S t="Popular Brands"><div className="flex flex-wrap gap-2">{brands.map(x=><Link key={x} href={'/search?q='+encodeURIComponent(x)} className="bg-white border rounded-full px-4 py-2 text-sm font-medium hover:bg-yellow-100">{x}</Link>)}</div></S>
</div>)}
