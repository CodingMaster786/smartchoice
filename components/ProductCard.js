export const disc=p=>p.original_price>p.price?Math.round(100-p.price*100/p.original_price):0
export const inr=n=>'₹'+Number(n).toLocaleString('en-IN')
export default function ProductCard({p}){
// Uses the product's own affiliate link; falls back to a plain Flipkart search until one is added.
const url=p.affiliate_url||'https://www.flipkart.com/search?q='+encodeURIComponent(p.name)
const shareUrl=()=>{const productUrl=typeof window==='undefined'?`/product/${p.id}`:`${window.location.origin}/product/${p.id}`;const text=`${p.name} - ${inr(p.price)} ${productUrl}`;window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer')}
return(<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-2 sm:p-3 flex flex-col min-w-0">
<div className="relative h-52 w-full bg-slate-100 rounded p-2 flex items-center justify-center overflow-hidden">
{p.image_url?<img src={p.image_url} alt={p.name} loading="lazy" className="block !w-full !h-full max-w-none max-h-none object-contain"/>:<span className="text-5xl">{p.categories?.icon||'🛍️'}</span>}
{disc(p)>0&&<span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">{disc(p)}% OFF</span>}</div>
{p.brand&&<div className="text-xs text-slate-500 mt-2">{p.brand}</div>}
<h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
<div className="mt-1 flex items-baseline gap-2"><b className="text-lg">{inr(p.price)}</b>{disc(p)>0&&<s className="text-xs text-slate-400">{inr(p.original_price)}</s>}{disc(p)>0&&<span className="text-xs text-green-600 font-bold">{disc(p)}% off</span>}</div>
<div className="mt-3 flex items-center gap-2">
<a href={url} target="_blank" rel="noopener noreferrer sponsored nofollow" className="btn flex-1">Buy Now</a>
<button type="button" onClick={shareUrl} aria-label={`Share ${p.name} on WhatsApp`} title="Share on WhatsApp" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.3h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.3-6.1-3.5-8.3Zm-8.4 18.1h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.2 2.2 1 2.2.7 2.6.7.4 0 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.2-.3-.2-.6-.4Z"/></svg>
</button>
</div></div>)}
export const Grid=({list})=>list.length?<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">{list.map(p=><ProductCard key={p.id} p={p}/>)}</div>:<p className="text-slate-500 p-8 text-center bg-white rounded">No products found.</p>
