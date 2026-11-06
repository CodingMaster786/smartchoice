'use client'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect,useRef,useState} from 'react'
import {supabase} from '@/lib/supabase'
import {Camera,Crown,Search,Send,ShoppingCart,UserRound} from 'lucide-react'
const navCategories=[
{name:'Mobiles',slug:'mobiles',image:'mobiles.jpg'},
{name:'Electronics',slug:'electronics',image:'electronics.jpg'},
{name:'Footwear',slug:'footwear',image:'footwear.jpg'},
{name:'Watches & Sun...',slug:'watches-sunglasses',image:'watches-sunglasses.jpg'},
{name:'Accessories',slug:'accessories',image:'accessories.jpg'},
{name:'Kids & Toys',slug:'kids-toys',image:'kids-toys.jpg'},
{name:"Girls' Wear",slug:'girls-wear',image:'girls-wear.jpg'},
{name:"Men's Wear",slug:'mens-wear',image:'mens-wear.jpg'},
{name:'Fashion',slug:'fashion',image:'fashion.jpg'},
{name:'Home & Kitchen',slug:'home-kitchen',image:'home-kitchen.jpg'},
{name:'Beauty & Care',slug:'beauty',image:'beauty.jpg'},
{name:'Grocery',slug:'grocery',image:'grocery.jpg'},
{name:'Appliances',slug:'appliances',image:'appliances.jpg'},
{name:'Sports & Fitness',slug:'sports-fitness',image:'sports-fitness.jpg'},
{name:'Health Care',slug:'health-care',image:'health-care.jpg'},
{name:'Auto Accessories',slug:'auto-accessories',image:'auto-accessories.jpg'}]
export const Logo=()=>(<Link href="/" className="flex items-center gap-2 shrink-0">
<svg width="34" height="34" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#facc15"/><path d="M9 13h4l3 12h13l3-9H15" stroke="#1e3a8a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="31" r="2.5" fill="#1e3a8a"/><circle cx="28" cy="31" r="2.5" fill="#1e3a8a"/></svg>
<span className="leading-none"><b className="text-xl text-white block">Smart<span className="text-yellow-300">Choice</span></b><i className="text-[10px] text-blue-100">Choose Smart. Shop Better.</i></span></Link>)
export default function Header(){
const r=useRouter();const[q,setQ]=useState('');const[collapsed,setCollapsed]=useState(false);const[uploading,setUploading]=useState(false);const[uploadMessage,setUploadMessage]=useState('');const fileInput=useRef(null);const frame=useRef(0)
const uploadImage=async event=>{
const file=event.target.files?.[0];event.target.value='';if(!file)return
setUploadMessage('')
const allowed=['image/jpeg','image/png','image/webp','image/gif']
if(!allowed.includes(file.type))return setUploadMessage('Please choose a JPG, PNG, WEBP, or GIF image.')
if(file.size>5*1024*1024)return setUploadMessage('Images must be 5 MB or smaller.')
setUploading(true)
try{
const extension=file.name.split('.').pop()?.toLowerCase()||'jpg'
const path=`anonymous/${crypto.randomUUID()}.${extension}`
const{error:uploadError}=await supabase.storage.from('user-uploaded-images').upload(path,file,{contentType:file.type,upsert:false})
if(uploadError)throw new Error(`Image upload failed: ${uploadError.message}`)
const imageUrl=`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/user-uploaded-images/${path}`
const{error:recordError}=await supabase.from('user_uploaded_images').insert({storage_path:path,image_url:imageUrl,file_type:file.type,file_size_bytes:file.size})
if(recordError){await supabase.storage.from('user-uploaded-images').remove([path]);throw new Error(`Image record failed: ${recordError.message}`)}
setUploadMessage('Image uploaded successfully.')
}catch(error){setUploadMessage(error.message||'Image upload failed.')}
finally{setUploading(false)}
}
useEffect(()=>{const onScroll=()=>{if(frame.current)return;frame.current=requestAnimationFrame(()=>{setCollapsed(window.scrollY>32);frame.current=0})};window.addEventListener('scroll',onScroll,{passive:true});return()=>{window.removeEventListener('scroll',onScroll);if(frame.current)cancelAnimationFrame(frame.current)}},[])
return(<header className="shadow">
<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1">
<div className="max-w-7xl mx-auto">
<div className={`overflow-hidden transition-[max-height,opacity] duration-200 ${collapsed?'max-h-0 opacity-0':'max-h-40 opacity-100'}`}>
<div className="flex gap-3 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth:'none'}}>
<Link href="/" className="snap-start shrink-0 w-64 rounded-xl border border-white/30 bg-white/10 px-3 py-2 flex items-center gap-3 text-white shadow-sm backdrop-blur-sm">
<ShoppingCart className="text-yellow-300 shrink-0" size={30}/><span><b className="text-lg block font-bold text-white">Smart<span className="text-yellow-300">Choice</span></b><i className="text-[10px] text-blue-50">Choose Smart. Shop Better.</i></span>
</Link>
<Link href="/c/course" className="snap-start shrink-0 w-36 rounded-xl bg-[#FFF9DB] px-3 py-2 flex flex-col items-center text-gray-800"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=120&h=60&fit=crop&auto=format" alt="Courses" loading="lazy" decoding="async" className="h-8 w-20 rounded-lg object-cover"/><b className="mt-1">Courses</b></Link>
<Link href="/c/auto-accessories" className="snap-start shrink-0 w-36 rounded-xl bg-[#E8F8F0] px-3 py-2 flex flex-col items-center text-gray-800"><img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&h=60&fit=crop&auto=format" alt="Bike and Car" loading="lazy" decoding="async" className="h-8 w-20 rounded-lg object-cover"/><b className="mt-1">Bike &amp; Car</b></Link>
<Link href="/c/real-estate" className="snap-start shrink-0 w-36 rounded-xl bg-[#FFEBEA] px-3 py-2 flex flex-col items-center text-gray-800"><img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120&h=60&fit=crop&auto=format" alt="Real Estate" loading="lazy" decoding="async" className="h-8 w-20 rounded-lg object-cover"/><b className="mt-1">Real Estate</b></Link>
</div>
<div className="mt-1 flex justify-center gap-4 sm:gap-5">
<a href="https://whatsapp.com/channel/0029VbEb3bxCXC3I7ZzWtu0z" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full bg-green-500 p-2 text-white transition-transform hover:scale-110"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.3h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.3-6.1-3.5-8.3Zm-8.4 18.1h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.2 2.2 1 2.2.7 2.6.7.4 0 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.2-.3-.2-.6-.4Z"/></svg></a>
<a href="https://www.instagram.com/topbranddeals.in?xtok=MTlqejYyYjJxNmo5Ng==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400 p-2 text-white transition-transform hover:scale-110"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
<a href="https://youtube.com/" aria-label="YouTube" className="rounded-full bg-red-600 p-2 text-white transition-transform hover:scale-110"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.5-.45-5.15a2.7 2.7 0 0 0-1.9-1.9C19 4.5 12 4.5 12 4.5s-7 0-8.65.45a2.7 2.7 0 0 0-1.9 1.9C1 8.5 1 12 1 12s0 3.5.45 5.15a2.7 2.7 0 0 0 1.9 1.9c1.65.45 8.65.45 8.65.45s7 0 8.65-.45a2.7 2.7 0 0 0 1.9-1.9C23 15.5 23 12 23 12Z"/><path d="m10 15.5 5-3.5-5-3.5v7Z" fill="#dc2626"/></svg></a>
<a href="https://t.me/Smart_Choos" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="rounded-full bg-sky-500 p-2 text-white transition-transform hover:scale-110"><Send size={19}/></a>
<Link href="/admin" aria-label="VIP admin" className="rounded-full border-2 border-yellow-300 bg-[#0B2545] p-1.5 text-yellow-300 transition-transform hover:scale-110"><Crown size={20}/></Link>
<Link href="/partner" aria-label="Partner Login" title="Partner Login" className="inline-flex items-center justify-center rounded-full bg-yellow-400 p-2 text-blue-950 transition hover:bg-yellow-300"><UserRound size={19}/></Link>
</div>
</div>
</div>
 </div>
<div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 shadow-md">
<div className="relative mx-auto flex w-full max-w-7xl items-center gap-2">
<form className="relative flex min-w-0 flex-1 rounded-full bg-white px-3 py-1 shadow-sm" onSubmit={e=>{e.preventDefault();r.push('/search?q='+encodeURIComponent(q))}}>
<Search className="my-auto text-gray-400 shrink-0" size={20}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="tv shoes" className="min-w-0 flex-1 px-3 outline-none text-gray-800"/>
<button type="submit" className="rounded-full bg-yellow-400 px-4 py-2 font-semibold text-blue-900 hover:bg-yellow-300">Search</button>
</form>
<button type="button" aria-label="Upload an image" title="Upload an image" disabled={uploading} onClick={()=>fileInput.current?.click()} className="rounded-full bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-100 disabled:opacity-60"><Camera size={20}/></button>
<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={uploadImage}/>
{uploadMessage&&<span role="status" className="absolute right-0 top-full z-40 mt-1 max-w-[260px] rounded bg-white px-3 py-2 text-xs text-slate-700 shadow">{uploadMessage}</span>}
</div>
<nav className="mt-1 bg-transparent overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth:'none'}}><div className="max-w-7xl mx-auto px-3 flex gap-3 py-0.5" style={{scrollbarWidth:'none'}}>
{navCategories.map(c=><Link key={c.slug} href={'/c/'+c.slug} className="group shrink-0 w-24 text-center text-xs text-white">
<span className="block w-14 h-14 mx-auto rounded-full border border-gray-200 bg-white overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
<img src={'/images/categories/'+c.image} alt={c.name} loading="lazy" decoding="async" className="w-full h-full object-cover"/>
</span><span className="block mt-1 truncate">{c.name}</span></Link>)}</div></nav></div></header>)}
