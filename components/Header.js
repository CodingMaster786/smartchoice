'use client'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase'
export const Logo=()=>(<Link href="/" className="flex items-center gap-2 shrink-0">
<svg width="34" height="34" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#facc15"/><path d="M9 13h4l3 12h13l3-9H15" stroke="#1e3a8a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="31" r="2.5" fill="#1e3a8a"/><circle cx="28" cy="31" r="2.5" fill="#1e3a8a"/></svg>
<span className="leading-none"><b className="text-xl text-white block">Smart<span className="text-yellow-300">Choice</span></b><i className="text-[10px] text-blue-100">Choose Smart. Shop Better.</i></span></Link>)
export default function Header(){
const r=useRouter();const[q,setQ]=useState('');const[cats,setCats]=useState([])
useEffect(()=>{supabase.from('categories').select('*').order('sort').then(({data})=>setCats(data||[]))},[])
return(<header className="sticky top-0 z-20 shadow">
<div className="bg-blue-700 px-3 py-3 flex flex-wrap items-center gap-3 md:gap-6 max-w-none"><Logo/>
<form className="flex flex-1 min-w-[220px] order-3 md:order-none w-full md:w-auto" onSubmit={e=>{e.preventDefault();r.push('/search?q='+encodeURIComponent(q))}}>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, brands and categories" className="flex-1 px-4 py-2 rounded-l outline-none"/>
<button className="bg-yellow-400 px-5 font-bold text-blue-900 rounded-r">Search</button></form>
<Link href="/admin" className="text-white text-sm ml-auto">Admin</Link></div>
<nav className="bg-white border-b overflow-x-auto whitespace-nowrap text-sm"><div className="max-w-7xl mx-auto px-3 flex gap-5 py-2">
{cats.map(c=><Link key={c.id} href={'/c/'+c.slug} className="hover:text-blue-700 font-medium">{c.icon} {c.name}</Link>)}</div></nav></header>)}
