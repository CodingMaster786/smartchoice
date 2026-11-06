'use client'
import {useState} from 'react'
import * as XLSX from 'xlsx'
import {supabase} from '@/lib/supabase'

const REQUIRED=['Product Name','Brand','Category','Original Price','Discount Price','Affiliate Link']
const aliases={
  name:['product name','name','product title','title'],
  brand:['brand','brand name','manufacturer'],
  category:['category','product category'],
  original_price:['original price','mrp','list price','regular price'],
  price:['discount price','sale price','selling price','offer price','price'],
  affiliate_url:['affiliate link','affiliate url','affiliate_link','product link','buy link']
}
const clean=v=>String(v??'').replace(/^\uFEFF/,'').trim()
const normal=v=>clean(v).toLowerCase().replace(/[_-]+/g,' ').replace(/[^a-z0-9% ]+/g,'').replace(/\s+/g,' ').trim()
const number=v=>{const n=Number(String(v??'').replace(/[₹,%\s]/g,''));return Number.isFinite(n)?n:null}
const validUrl=v=>{try{const u=new URL(clean(v));return ['http:','https:'].includes(u.protocol)}catch{return false}}
const findColumns=headers=>Object.fromEntries(Object.entries(aliases).map(([field,names])=>{
  const index=headers.findIndex(header=>names.some(name=>normal(name)===normal(header)))
  return [field,index]
}))

const categoryMatch=(value,cats=[])=>{
  const key=normal(value)
  return cats.find(category=>normal(category.name)===key||normal(category.slug)===key)||null
}
export default function BulkProductUpload({cats,onImported}){
  const[file,setFile]=useState(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[progress,setProgress]=useState(0),[preview,setPreview]=useState(null)
  const parse=async selected=>{
    setFile(selected);setMessage('');setPreview(null);setProgress(0)
    if(!selected)return
    try{
      const workbook=XLSX.read(await selected.arrayBuffer(),{type:'array',cellDates:false})
      const sheet=workbook.Sheets[workbook.SheetNames[0]]
      if(!sheet)throw new Error('The file does not contain a worksheet.')
      const rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:''})
      const headers=(rows[0]||[]).map(clean),columns=findColumns(headers)
      const missing=Object.entries(columns).filter(([,index])=>index<0).map(([field])=>REQUIRED[Object.keys(aliases).indexOf(field)])
      if(missing.length)throw new Error(`Missing required column(s): ${missing.join(', ')}. Found: ${headers.join(', ')}`)
      const data=rows.slice(1).map((values,index)=>({values,row:index+2})).filter(({values})=>values.some(v=>clean(v)))
      if(data.length>1000)throw new Error('A single upload can contain at most 1,000 products.')
      const errors=[],products=[]
      data.forEach(({values,row})=>{
        const get=field=>clean(values[columns[field]]),name=get('name'),brand=get('brand'),category=get('category'),original=get('original_price'),price=get('price'),affiliate=get('affiliate_url'),rowErrors=[]
        if(!name)rowErrors.push(`Product Name is missing`)
        if(!brand)rowErrors.push(`Brand is missing`)
        const matchedCategory=categoryMatch(category,cats)
        if(!category)rowErrors.push(`Category is missing`)
        else if(!matchedCategory)rowErrors.push(`Category "${category}" was not found in the existing category mapping`)
        const originalNumber=number(original),priceNumber=number(price)
        if(originalNumber===null||originalNumber<0)rowErrors.push(`Original Price must be a non-negative number`)
        if(priceNumber===null||priceNumber<0)rowErrors.push(`Discount Price must be a non-negative number`)
        if(originalNumber!==null&&priceNumber!==null&&priceNumber>originalNumber)rowErrors.push(`Discount Price cannot exceed Original Price`)
        if(!validUrl(affiliate))rowErrors.push(`Affiliate Link must be a valid http(s) URL`)
        if(rowErrors.length)errors.push({row,details:rowErrors})
        else products.push({row,name,brand,category_id:matchedCategory.id,original_price:originalNumber,price:priceNumber,affiliate_url:affiliate,image_url:null})
      })
      const existing=products.length?await supabase.from('products').select('affiliate_url').in('affiliate_url',products.map(p=>p.affiliate_url)):null
      if(existing?.error)throw existing.error
      const seen=new Set((existing?.data||[]).map(p=>p.affiliate_url)),within=new Set(),duplicates=new Set()
      products.forEach(product=>{if(seen.has(product.affiliate_url)||within.has(product.affiliate_url)){duplicates.add(product.row);errors.push({row:product.row,details:['Affiliate Link already exists']})}within.add(product.affiliate_url)})
      setPreview({products:products.filter(p=>!seen.has(p.affiliate_url)&&!duplicates.has(p.row)),errors})
    }catch(error){setMessage(error.message||'Unable to read this file.')}
  }
  const importProducts=async()=>{
    if(!preview||!preview.products.length)return
    setBusy(true);setMessage('');setProgress(0)
    try{
      const failures=[],successful=[]
      for(let i=0;i<preview.products.length;i++){
        const {row,...product}=preview.products[i]
        const {error}=await supabase.from('products').insert(product)
        if(error)failures.push({row,details:[error.message]})
        else successful.push(row)
        setProgress(Math.round((i+1)/preview.products.length*100))
      }
      setMessage(`${successful.length} products imported${failures.length?`. ${failures.length} row(s) failed.`:'. All are Pending Image until an admin uploads images.'}`)
      setPreview({...preview,products:preview.products.filter(product=>failures.some(failure=>failure.row===product.row)),errors:[...preview.errors,...failures]})
      if(successful.length)onImported?.()
    }catch(error){setMessage(error.message||'Unable to import products.')}
    finally{setBusy(false)}
  }
  return <section className="mb-4 rounded bg-white p-4">
    <h2 className="font-bold">Bulk Product Upload</h2>
    <p className="mt-1 text-sm text-slate-500">Required columns: {REQUIRED.join(', ')}. Images are added after import.</p>
    <div className="mt-3 flex flex-wrap items-center gap-2"><input type="file" accept=".xlsx,.csv" onChange={e=>parse(e.target.files?.[0]||null)}/><button type="button" className="btn" disabled={!preview||preview.errors.length>0||busy} onClick={importProducts}>{busy?`Importing ${progress}%...`:'Import products'}</button></div>
    {message&&<p role="status" className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-700">{message}</p>}
    {preview&&<div className="mt-3 text-sm"><p>{preview.products.length} valid product(s), {preview.errors.length} error(s)</p>{preview.errors.length>0&&<div className="mt-2 max-h-40 overflow-auto rounded bg-red-50 p-2 text-red-700">{preview.errors.map(error=><p key={error.row}>Row {error.row}: {error.details.join('; ')}</p>)}</div>}</div>}
  </section>
}
