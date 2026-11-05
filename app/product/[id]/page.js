'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {inr,disc} from '@/components/ProductCard'
import {supabase} from '@/lib/supabase'
export default function ProductPage({params}){const[p,setP]=useState(null),[error,setError]=useState('')
useEffect(()=>{(async()=>{let result=await supabase.from('partner_products').select('*,categories(name),subcategories(name)').eq('id',params.id).maybeSingle();if(!result.data)result=await supabase.from('products').select('*,categories(name),subcategories(name)').eq('id',params.id).maybeSingle();if(result.error||!result.data)setError('Product not found.');else setP(result.data)})()},[params.id])
if(error)return <p className="rounded bg-white p-8 text-center text-red-600">{error}</p>
if(!p)return <p className="p-8">Loading…</p>
return <main className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-sm sm:p-8"><Link href="/" className="text-sm text-blue-700">← Back to SmartChoice</Link><div className="mt-4 grid gap-6 sm:grid-cols-2"><div className="flex min-h-64 items-center justify-center rounded-lg bg-slate-50">{p.image_url&&<img src={p.image_url} alt={p.name} className="max-h-72 w-full object-contain"/>}</div><div><p className="text-sm text-slate-500">{p.brand}</p><h1 className="text-2xl font-bold text-blue-950">{p.name}</h1><p className="mt-3 text-2xl font-bold">{inr(p.price)} {disc(p)>0&&<span className="text-sm text-green-600">{disc(p)}% OFF</span>}</p>{p.description&&<p className="mt-4 text-slate-600">{p.description}</p>}<a href={p.affiliate_url||'#'} target="_blank" rel="noopener noreferrer sponsored nofollow" className="btn mt-6">Buy Now</a></div></div></main>}
