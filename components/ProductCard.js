export const disc=p=>p.original_price>p.price?Math.round(100-p.price*100/p.original_price):0
export const inr=n=>'₹'+Number(n).toLocaleString('en-IN')
export default function ProductCard({p}){
// Uses the product's own affiliate link; falls back to a plain Flipkart search until one is added.
const url=p.affiliate_url||'https://www.flipkart.com/search?q='+encodeURIComponent(p.name)
return(<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-2 sm:p-3 flex flex-col min-w-0">
<div className="relative h-32 sm:h-40 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
{p.image_url?<img src={p.image_url} alt={p.name} loading="lazy" className="h-full object-contain"/>:<span className="text-5xl">{p.categories?.icon||'🛍️'}</span>}
{disc(p)>0&&<span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">{disc(p)}% OFF</span>}</div>
{p.brand&&<div className="text-xs text-slate-500 mt-2">{p.brand}</div>}
<h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
<div className="mt-1 flex items-baseline gap-2"><b className="text-lg">{inr(p.price)}</b>{disc(p)>0&&<s className="text-xs text-slate-400">{inr(p.original_price)}</s>}{disc(p)>0&&<span className="text-xs text-green-600 font-bold">{disc(p)}% off</span>}</div>
<a href={url} target="_blank" rel="noopener noreferrer sponsored nofollow" className="btn mt-3">Buy Now</a></div>)}
export const Grid=({list})=>list.length?<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">{list.map(p=><ProductCard key={p.id} p={p}/>)}</div>:<p className="text-slate-500 p-8 text-center bg-white rounded">No products found.</p>
